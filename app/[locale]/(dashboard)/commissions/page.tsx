import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
  getCommissionsByParent,
  getCommissionStats,
  getCommissionTransactions,
} from "@/lib/data/commissions";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Coins, TrendingUp, Clock, Users } from "lucide-react";

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string }>;
}

export default async function CommissionsPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page = "1" } = await searchParams;

  const session = await auth();
  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);
  const currentPage = parseInt(page) || 1;

  const [commissions, stats, { data: transactions, total }] = await Promise.all([
    getCommissionsByParent(session.user.dealerId),
    getCommissionStats(session.user.dealerId),
    getCommissionTransactions(session.user.dealerId, undefined, currentPage, 10),
  ]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">
          {dict.commissions?.title || "Komisyonlar"}
        </h1>
        <p className="text-muted-foreground">
          {dict.commissions?.description ||
            "Alt bayilerinizden gelen komisyonları takip edin"}
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.commissions?.totalEarned || "Toplam Kazanç"}
            </CardTitle>
            <Coins className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.totalEarned)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.commissions?.pendingPayouts || "Bekleyen Ödemeler"}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.pendingPayouts)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.commissions?.paidPayouts || "Ödenen Komisyonlar"}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(stats.paidPayouts)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.commissions?.activeSubDealers || "Aktif Alt Bayiler"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubDealers}</div>
          </CardContent>
        </Card>
      </div>

      {/* Commission Settings */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dict.commissions?.settings || "Komisyon Ayarları"}
          </CardTitle>
          <CardDescription>
            {dict.commissions?.settingsDescription ||
              "Alt bayileriniz için komisyon oranlarını görüntüleyin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {commissions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dict.commissions?.noCommissions ||
                  "Henüz komisyon ayarı yapılmamış"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.commissions?.subDealer || "Alt Bayi"}</TableHead>
                  <TableHead>
                    {dict.commissions?.orderRate || "Sipariş Oranı"}
                  </TableHead>
                  <TableHead>
                    {dict.commissions?.productRate || "Ürün Oranı"}
                  </TableHead>
                  <TableHead>
                    {dict.commissions?.fixedAmount || "Sabit Tutar"}
                  </TableHead>
                  <TableHead>
                    {dict.commissions?.minimumPayout || "Min. Ödeme"}
                  </TableHead>
                  <TableHead>{dict.common?.status || "Durum"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {commissions.map((commission) => (
                  <TableRow key={commission.id}>
                    <TableCell className="font-medium">
                      {commission.childDealer.name}
                    </TableCell>
                    <TableCell>%{commission.orderCommissionRate}</TableCell>
                    <TableCell>%{commission.productCommissionRate}</TableCell>
                    <TableCell>
                      {formatCurrency(commission.fixedOrderCommission)}
                    </TableCell>
                    <TableCell>
                      {formatCurrency(commission.minimumPayout)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={commission.isActive ? "default" : "secondary"}
                      >
                        {commission.isActive
                          ? dict.common?.active || "Aktif"
                          : dict.common?.inactive || "Pasif"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dict.commissions?.recentTransactions || "Son İşlemler"}
          </CardTitle>
          <CardDescription>
            {dict.commissions?.transactionsDescription ||
              "Komisyon işlemlerinizin geçmişini görüntüleyin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {transactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8">
              <Coins className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dict.commissions?.noTransactions || "Henüz işlem yok"}
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>
                    {dict.commissions?.orderNumber || "Sipariş No"}
                  </TableHead>
                  <TableHead>{dict.commissions?.subDealer || "Alt Bayi"}</TableHead>
                  <TableHead>
                    {dict.commissions?.orderTotal || "Sipariş Tutarı"}
                  </TableHead>
                  <TableHead>
                    {dict.commissions?.commission || "Komisyon"}
                  </TableHead>
                  <TableHead>{dict.common?.status || "Durum"}</TableHead>
                  <TableHead>{dict.common?.date || "Tarih"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell className="font-mono">
                      {transaction.orderNumber}
                    </TableCell>
                    <TableCell>{transaction.childDealerName}</TableCell>
                    <TableCell>
                      {formatCurrency(transaction.orderTotal)}
                    </TableCell>
                    <TableCell className="font-medium text-green-600">
                      {formatCurrency(transaction.commissionAmount)}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          transaction.status === "PAID"
                            ? "default"
                            : transaction.status === "PENDING"
                            ? "secondary"
                            : "destructive"
                        }
                      >
                        {transaction.status === "PAID"
                          ? dict.commissions?.paid || "Ödendi"
                          : transaction.status === "PENDING"
                          ? dict.commissions?.pending || "Bekliyor"
                          : dict.commissions?.cancelled || "İptal"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(transaction.createdAt).toLocaleDateString(
                        locale
                      )}
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
