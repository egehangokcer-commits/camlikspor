import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { UserRole } from "@/lib/types";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Edit,
  Phone,
  Mail,
  MapPin,
  Building2,
  Users,
  GraduationCap,
  User,
  Wallet,
  TrendingUp,
  Clock,
  Calendar,
  CreditCard,
} from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";
import { PasswordResetCard } from "./components/password-reset-card";

interface DealerDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const dateLocales = { tr: tr, en: enUS, es: es };

export default async function DealerDetailPage({
  params,
}: DealerDetailPageProps) {
  const session = await auth();
  const { locale: localeParam, id } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    redirect(`/${locale}/dashboard`);
  }

  const dictionary = await getDictionary(locale);
  const dateLocale = dateLocales[locale];

  // Get dealer with all related data
  const dealer = await prisma.dealer.findUnique({
    where: { id },
    include: {
      settings: true,
      _count: {
        select: {
          students: true,
          trainers: true,
          groups: true,
          facilities: true,
          branches: true,
          locations: true,
          users: true,
        },
      },
    },
  });

  if (!dealer) {
    notFound();
  }

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get payment statistics
  const [completedPayments, pendingPayments, thisMonthPayments] = await Promise.all([
    // All completed payments
    prisma.payment.aggregate({
      where: { dealerId: id, status: "COMPLETED" },
      _sum: { amount: true },
      _count: true,
    }),
    // Pending payments
    prisma.payment.aggregate({
      where: { dealerId: id, status: "PENDING" },
      _sum: { amount: true },
      _count: true,
    }),
    // This month's payments
    prisma.payment.aggregate({
      where: {
        dealerId: id,
        status: "COMPLETED",
        paidAt: { gte: startOfMonth, lte: endOfMonth },
      },
      _sum: { amount: true },
      _count: true,
    }),
  ]);

  // Get last 6 months payment breakdown
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);
  const monthlyPayments = await prisma.payment.groupBy({
    by: ["paidAt"],
    where: {
      dealerId: id,
      status: "COMPLETED",
      paidAt: { gte: sixMonthsAgo },
    },
    _sum: { amount: true },
  });

  type MonthlyPayment = (typeof monthlyPayments)[number];

  // Group by month
  const monthlyData: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const monthKey = format(monthDate, "yyyy-MM");
    const monthLabel = format(monthDate, "MMMM yyyy", { locale: dateLocale });

    const monthTotal = monthlyPayments
      .filter((p: MonthlyPayment) => p.paidAt && format(p.paidAt, "yyyy-MM") === monthKey)
      .reduce((sum: number, p: MonthlyPayment) => sum + (p._sum.amount || 0), 0);

    monthlyData.push({ month: monthLabel, amount: monthTotal });
  }

  // Get recent payments
  const recentPayments = await prisma.payment.findMany({
    where: { dealerId: id, status: "COMPLETED" },
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { paidAt: "desc" },
    take: 10,
  });

  type RecentPayment = (typeof recentPayments)[number];
  type MonthlyDataItem = { month: string; amount: number };

  // Get active students count
  const activeStudents = await prisma.student.count({
    where: { dealerId: id, isActive: true },
  });

  // Get dealer users for password management
  const dealerUsers = await prisma.user.findMany({
    where: { dealerId: id, isActive: true },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
    },
    orderBy: { name: "asc" },
  });

  // Calculate totals
  const totalEarnings = completedPayments._sum.amount || 0;
  const thisMonthEarnings = thisMonthPayments._sum.amount || 0;
  const pendingAmount = pendingPayments._sum.amount || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/dealers`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">{dealer.name}</h1>
            <p className="text-muted-foreground font-mono">{dealer.slug}</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={dealer.isActive ? "default" : "secondary"} className="text-sm">
            {dealer.isActive ? dictionary.common.active : dictionary.common.inactive}
          </Badge>
          <Link href={`/${locale}/dealers/${id}/edit`}>
            <Button>
              <Edit className="mr-2 h-4 w-4" />
              {dictionary.common.edit}
            </Button>
          </Link>
        </div>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Kazanc</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalEarnings.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">
              {completedPayments._count} odeme
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {thisMonthEarnings.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM yyyy", { locale: dateLocale })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
            <Clock className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingAmount.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">
              {pendingPayments._count} odeme bekliyor
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktif Ogrenci</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeStudents}</div>
            <p className="text-xs text-muted-foreground">
              / {dealer._count.students} toplam
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Breakdown & Stats */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Monthly Payment Chart/Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Aylik Tahsilat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ay</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {monthlyData.map((data: MonthlyDataItem, index: number) => (
                  <TableRow key={index}>
                    <TableCell className="font-medium">{data.month}</TableCell>
                    <TableCell className="text-right">
                      <span className={data.amount > 0 ? "text-green-600 font-medium" : "text-muted-foreground"}>
                        {data.amount.toLocaleString("tr-TR")} TL
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Dealer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Bayi Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Olusturulma</p>
                <p className="font-medium">
                  {format(dealer.createdAt, "d MMMM yyyy", { locale: dateLocale })}
                </p>
              </div>
              {dealer.taxNumber && (
                <div>
                  <p className="text-sm text-muted-foreground">Vergi No</p>
                  <p className="font-medium">{dealer.taxNumber}</p>
                </div>
              )}
            </div>
            {dealer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{dealer.phone}</span>
              </div>
            )}
            {dealer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{dealer.email}</span>
              </div>
            )}
            {dealer.address && (
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{dealer.address}</span>
              </div>
            )}

            <div className="border-t pt-4">
              <p className="text-sm text-muted-foreground mb-2">Yapilandirma</p>
              <div className="grid grid-cols-4 gap-2 text-center">
                <div className="bg-muted rounded p-2">
                  <div className="text-lg font-bold">{dealer._count.branches}</div>
                  <div className="text-xs text-muted-foreground">Brans</div>
                </div>
                <div className="bg-muted rounded p-2">
                  <div className="text-lg font-bold">{dealer._count.locations}</div>
                  <div className="text-xs text-muted-foreground">Sube</div>
                </div>
                <div className="bg-muted rounded p-2">
                  <div className="text-lg font-bold">{dealer._count.facilities}</div>
                  <div className="text-xs text-muted-foreground">Tesis</div>
                </div>
                <div className="bg-muted rounded p-2">
                  <div className="text-lg font-bold">{dealer._count.users}</div>
                  <div className="text-xs text-muted-foreground">Kullanici</div>
                </div>
              </div>
            </div>

            {dealer.settings && (
              <div className="border-t pt-4">
                <p className="text-sm text-muted-foreground mb-2">Entegrasyonlar</p>
                <div className="flex gap-2">
                  <Badge variant={dealer.settings.paytrEnabled ? "default" : "secondary"}>
                    PayTR {dealer.settings.paytrEnabled ? "Aktif" : "Pasif"}
                  </Badge>
                  <Badge variant={dealer.settings.netgsmEnabled ? "default" : "secondary"}>
                    Netgsm {dealer.settings.netgsmEnabled ? "Aktif" : "Pasif"}
                  </Badge>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Operational Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Toplam Ogrenci
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealer._count.students}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <User className="h-4 w-4" />
              Antrenor
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealer._count.trainers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4" />
              Grup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealer._count.groups}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Tesis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dealer._count.facilities}</div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Son Odemeler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentPayments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Henuz odeme yapilmamis
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarih</TableHead>
                  <TableHead>Ogrenci</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment: RecentPayment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paidAt
                        ? format(payment.paidAt, "dd MMM yyyy HH:mm", { locale: dateLocale })
                        : "-"}
                    </TableCell>
                    <TableCell>
                      {payment.student.firstName} {payment.student.lastName}
                    </TableCell>
                    <TableCell className="text-right font-medium text-green-600">
                      {payment.amount.toLocaleString("tr-TR")} TL
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Password Reset Card */}
      <PasswordResetCard users={dealerUsers} dealerId={id} />
    </div>
  );
}
