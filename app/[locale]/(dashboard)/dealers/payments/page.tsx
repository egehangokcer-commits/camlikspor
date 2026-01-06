import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Building2, TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

interface DealerPaymentsPageProps {
  params: Promise<{ locale: string }>;
}

export default async function DealerPaymentsPage({ params }: DealerPaymentsPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  // Only SuperAdmin can access this page
  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    redirect(`/${locale}/dashboard`);
  }

  const dictionary = await getDictionary(locale);

  // Get current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  // Get all dealers with their payment summaries
  const dealers = await prisma.dealer.findMany({
    where: { isActive: true },
    include: {
      payments: {
        where: {
          status: "COMPLETED",
        },
      },
      _count: {
        select: {
          students: { where: { isActive: true } },
        },
      },
    },
    orderBy: { name: "asc" },
  });

  type Dealer = (typeof dealers)[number];
  type DealerStat = {
    id: string;
    name: string;
    slug: string;
    studentCount: number;
    totalPayments: number;
    thisMonthPayments: number;
    paymentCount: number;
  };

  type DealerPayment = Dealer["payments"][number];

  // Calculate payment stats for each dealer
  const dealerStats: DealerStat[] = dealers.map((dealer: Dealer) => {
    const totalPayments = dealer.payments.reduce((sum: number, p: DealerPayment) => sum + p.amount, 0);
    const thisMonthPayments = dealer.payments
      .filter((p: DealerPayment) => p.paidAt && p.paidAt >= startOfMonth && p.paidAt <= endOfMonth)
      .reduce((sum: number, p: DealerPayment) => sum + p.amount, 0);

    return {
      id: dealer.id,
      name: dealer.name,
      slug: dealer.slug,
      studentCount: dealer._count.students,
      totalPayments,
      thisMonthPayments,
      paymentCount: dealer.payments.length,
    };
  });

  // Get pending payments count per dealer
  const pendingPayments = await prisma.payment.groupBy({
    by: ["dealerId"],
    where: { status: "PENDING" },
    _count: true,
    _sum: { amount: true },
  });

  type PendingPayment = (typeof pendingPayments)[number];
  const pendingMap = new Map(
    pendingPayments.map((p: PendingPayment) => [
      p.dealerId,
      { count: p._count, amount: p._sum.amount || 0 },
    ])
  );

  // Overall totals
  const totalAllPayments = dealerStats.reduce((sum: number, d: DealerStat) => sum + d.totalPayments, 0);
  const totalThisMonth = dealerStats.reduce((sum: number, d: DealerStat) => sum + d.thisMonthPayments, 0);
  const totalPending = pendingPayments.reduce((sum: number, p: PendingPayment) => sum + (p._sum.amount || 0), 0);
  const totalStudents = dealerStats.reduce((sum: number, d: DealerStat) => sum + d.studentCount, 0);

  // Recent payments
  const recentPayments = await prisma.payment.findMany({
    where: { status: "COMPLETED" },
    include: {
      dealer: { select: { name: true } },
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { paidAt: "desc" },
    take: 10,
  });

  type RecentPayment = (typeof recentPayments)[number];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Bayi Odemeleri</h1>
        <p className="text-muted-foreground">
          Tum bayilerden gelen odemeleri goruntuleyin
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tahsilat</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAllPayments.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">Tum zamanlar</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Bu Ay</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {totalThisMonth.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">
              {format(now, "MMMM yyyy", { locale: tr })}
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
              {totalPending.toLocaleString("tr-TR")} TL
            </div>
            <p className="text-xs text-muted-foreground">Odenmemis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Toplam Ogrenci</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">Aktif ogrenci</p>
          </CardContent>
        </Card>
      </div>

      {/* Dealer Payment Table */}
      <Card>
        <CardHeader>
          <CardTitle>Bayi Bazinda Odemeler</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bayi</TableHead>
                <TableHead className="text-right">Ogrenci</TableHead>
                <TableHead className="text-right">Toplam Tahsilat</TableHead>
                <TableHead className="text-right">Bu Ay</TableHead>
                <TableHead className="text-right">Bekleyen</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {dealerStats.map((dealer: DealerStat) => {
                const pending = pendingMap.get(dealer.id);
                return (
                  <TableRow key={dealer.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Building2 className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <div className="font-medium">{dealer.name}</div>
                          <div className="text-xs text-muted-foreground">
                            {dealer.slug}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">{dealer.studentCount}</TableCell>
                    <TableCell className="text-right font-medium">
                      {dealer.totalPayments.toLocaleString("tr-TR")} TL
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-green-600">
                        {dealer.thisMonthPayments.toLocaleString("tr-TR")} TL
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      {pending ? (
                        <Badge variant="outline" className="text-orange-600">
                          {pending.amount.toLocaleString("tr-TR")} TL ({pending.count})
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Recent Payments */}
      <Card>
        <CardHeader>
          <CardTitle>Son Odemeler</CardTitle>
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
                  <TableHead>Bayi</TableHead>
                  <TableHead>Ogrenci</TableHead>
                  <TableHead className="text-right">Tutar</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentPayments.map((payment: RecentPayment) => (
                  <TableRow key={payment.id}>
                    <TableCell>
                      {payment.paidAt
                        ? format(payment.paidAt, "dd MMM yyyy HH:mm", { locale: tr })
                        : "-"}
                    </TableCell>
                    <TableCell>{payment.dealer.name}</TableCell>
                    <TableCell>
                      {payment.student.firstName} {payment.student.lastName}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      {payment.amount.toLocaleString("tr-TR")} TL
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
