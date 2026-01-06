import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { prisma } from "@/lib/prisma";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, Banknote, AlertCircle, CheckCircle } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";

interface GroupPaymentsPageProps {
  params: Promise<{ locale: string; id: string }>;
}

const dateLocales = { tr: tr, en: enUS, es: es };

export default async function GroupPaymentsPage({
  params,
}: GroupPaymentsPageProps) {
  const session = await auth();
  const { locale: localeParam, id } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);
  const dateLocale = dateLocales[locale];

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const group = await prisma.group.findUnique({
    where: { id },
    include: {
      students: {
        where: { isActive: true },
        include: {
          student: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              payments: {
                where: { type: "MONTHLY_FEE" },
                orderBy: { dueDate: "desc" },
                take: 12,
              },
            },
          },
        },
      },
    },
  });

  if (!group || (dealerId && group.dealerId !== dealerId)) {
    notFound();
  }

  type StudentGroup = (typeof group.students)[number];
  type Payment = StudentGroup["student"]["payments"][number];

  // Calculate payment statistics
  const allPayments = group.students.flatMap((sg: StudentGroup) => sg.student.payments);
  const totalAmount = allPayments.reduce((sum: number, p: Payment) => sum + p.amount, 0);
  const paidAmount = allPayments
    .filter((p: Payment) => p.status === "COMPLETED")
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);
  const pendingAmount = allPayments
    .filter((p: Payment) => p.status === "PENDING")
    .reduce((sum: number, p: Payment) => sum + p.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/groups/${id}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {group.name} - Aidatlar
          </h1>
          <p className="text-muted-foreground">
            Bu gruptaki ogrencilerin aidat durumu
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Toplam Aidat
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalAmount.toLocaleString("tr-TR")} TL
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              Odenen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {paidAmount.toLocaleString("tr-TR")} TL
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertCircle className="h-4 w-4 text-orange-500" />
              Bekleyen
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {pendingAmount.toLocaleString("tr-TR")} TL
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Banknote className="h-5 w-5" />
            Ogrenci Aidat Durumu
          </CardTitle>
        </CardHeader>
        <CardContent>
          {group.students.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Bu grupta ogrenci bulunmuyor
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ogrenci</TableHead>
                  <TableHead>Son Odeme</TableHead>
                  <TableHead>Bekleyen Aidat</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead className="text-right">Islemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {group.students.map((sg: StudentGroup) => {
                  const pendingPayments = sg.student.payments.filter(
                    (p: Payment) => p.status === "PENDING"
                  );
                  const lastPaid = sg.student.payments.find(
                    (p: Payment) => p.status === "COMPLETED"
                  );
                  const totalPending = pendingPayments.reduce(
                    (sum: number, p: Payment) => sum + p.amount,
                    0
                  );
                  const hasOverdue = pendingPayments.some(
                    (p: Payment) => new Date(p.dueDate) < new Date()
                  );

                  return (
                    <TableRow key={sg.student.id}>
                      <TableCell className="font-medium">
                        {sg.student.firstName} {sg.student.lastName}
                      </TableCell>
                      <TableCell>
                        {lastPaid?.paidAt
                          ? format(lastPaid.paidAt, "d MMM yyyy", {
                              locale: dateLocale,
                            })
                          : "-"}
                      </TableCell>
                      <TableCell>
                        {totalPending > 0 ? (
                          <span className="font-medium text-orange-600">
                            {totalPending.toLocaleString("tr-TR")} TL
                          </span>
                        ) : (
                          <span className="text-green-600">Yok</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {hasOverdue ? (
                          <Badge variant="destructive">Gecikmi</Badge>
                        ) : pendingPayments.length > 0 ? (
                          <Badge variant="outline" className="text-orange-600">
                            Bekliyor
                          </Badge>
                        ) : (
                          <Badge variant="default" className="bg-green-600">
                            Guncel
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/${locale}/students/${sg.student.id}?tab=payments`}
                        >
                          <Button variant="outline" size="sm">
                            Detay
                          </Button>
                        </Link>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
