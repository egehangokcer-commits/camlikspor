import { auth } from "@/lib/auth";
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
import { format } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";

interface PaymentsPageProps {
  params: Promise<{ locale: string }>;
}

const dateLocales = { tr: tr, en: enUS, es: es };

const statusStyles: Record<string, string> = {
  PENDING: "bg-yellow-100 text-yellow-800",
  COMPLETED: "bg-green-100 text-green-800",
  OVERDUE: "bg-red-100 text-red-800",
  CANCELLED: "bg-gray-100 text-gray-800",
};

export default async function PaymentsPage({ params }: PaymentsPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);
  const dateLocale = dateLocales[locale];

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const payments = await prisma.payment.findMany({
    where: dealerId ? { dealerId } : {},
    include: {
      student: { select: { firstName: true, lastName: true } },
    },
    orderBy: { dueDate: "desc" },
    take: 50,
  });

  type Payment = (typeof payments)[number];

  const stats = {
    pending: payments.filter((p: Payment) => p.status === "PENDING").length,
    completed: payments.filter((p: Payment) => p.status === "COMPLETED").length,
    overdue: payments.filter(
      (p: Payment) => p.status === "PENDING" && new Date(p.dueDate) < new Date()
    ).length,
    totalAmount: payments
      .filter((p: Payment) => p.status === "COMPLETED")
      .reduce((sum: number, p: Payment) => sum + p.amount, 0),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {dictionary.accounting.payments.title}
        </h1>
        <p className="text-muted-foreground">
          {dictionary.accounting.payments.summary}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Bekleyen</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Tamamlanan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-destructive">
              Geciken
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {stats.overdue}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Toplam Tahsilat</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAmount.toLocaleString(locale)} TL
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Son Odemeler</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {dictionary.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {dictionary.accounting.payments.studentName}
                  </TableHead>
                  <TableHead>{dictionary.accounting.payments.amount}</TableHead>
                  <TableHead>{dictionary.accounting.payments.dueDate}</TableHead>
                  <TableHead>{dictionary.common.status}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.slice(0, 20).map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">
                      {payment.student.firstName} {payment.student.lastName}
                    </TableCell>
                    <TableCell>
                      {payment.amount.toLocaleString(locale)} TL
                    </TableCell>
                    <TableCell>
                      {format(payment.dueDate, "d MMM yyyy", {
                        locale: dateLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        className={statusStyles[payment.status] || ""}
                        variant="secondary"
                      >
                        {payment.status}
                      </Badge>
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
