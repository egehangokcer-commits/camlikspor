import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getOrders, getOrderStats, type OrderListItem } from "@/lib/data/products";
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
import { ShoppingBag, DollarSign, Clock, Eye } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";
import { OrderActions } from "./components/order-actions";

interface OrdersPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    status?: string;
    search?: string;
  }>;
}

const dateLocales = {
  tr: tr,
  en: enUS,
  es: es,
};

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Bekliyor", variant: "secondary" },
  CONFIRMED: { label: "Onaylandi", variant: "default" },
  PROCESSING: { label: "Hazirlaniyor", variant: "default" },
  SHIPPED: { label: "Kargoda", variant: "default" },
  DELIVERED: { label: "Teslim Edildi", variant: "default" },
  CANCELLED: { label: "Iptal Edildi", variant: "destructive" },
};

const paymentStatusLabels: Record<string, { label: string; variant: "default" | "secondary" | "outline" | "destructive" }> = {
  PENDING: { label: "Odeme Bekleniyor", variant: "outline" },
  PAID: { label: "Odendi", variant: "default" },
  FAILED: { label: "Basarisiz", variant: "destructive" },
  REFUNDED: { label: "Iade Edildi", variant: "secondary" },
};

export default async function OrdersPage({
  params,
  searchParams,
}: OrdersPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;
  const { page = "1", status = "", search = "" } = await searchParams;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);
  const dateLocale = dateLocales[locale];

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const [{ data: orders, total }, stats] = await Promise.all([
    getOrders(
      {
        dealerId,
        status: status || undefined,
        search: search || undefined,
      },
      parseInt(page),
      10
    ),
    dealerId ? getOrderStats(dealerId) : null,
  ]);

  const totalPages = Math.ceil(total / 10);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Siparisler</h1>
          <p className="text-muted-foreground">Siparis yonetimi</p>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Siparis</CardTitle>
              <ShoppingBag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOrders}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Bekleyen Siparisler</CardTitle>
              <Clock className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.pendingOrders}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Gelir</CardTitle>
              <DollarSign className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-500">
                {formatPrice(stats.totalRevenue)}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dictionary.common.showing} {orders.length} {dictionary.common.of}{" "}
            {total} {dictionary.common.entries}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {orders.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {dictionary.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Siparis No</TableHead>
                  <TableHead>Musteri</TableHead>
                  <TableHead>Urun Sayisi</TableHead>
                  <TableHead>Toplam</TableHead>
                  <TableHead>Durum</TableHead>
                  <TableHead>Odeme</TableHead>
                  <TableHead>Tarih</TableHead>
                  <TableHead className="text-right">
                    {dictionary.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {orders.map((order: OrderListItem) => {
                  const statusInfo = statusLabels[order.status] || {
                    label: order.status,
                    variant: "secondary" as const,
                  };
                  const paymentInfo = paymentStatusLabels[order.paymentStatus] || {
                    label: order.paymentStatus,
                    variant: "secondary" as const,
                  };

                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono font-medium">
                        {order.orderNumber}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-muted-foreground">
                            {order.customerPhone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{order._count.items} adet</TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(order.total)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={statusInfo.variant}>
                          {statusInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={paymentInfo.variant}>
                          {paymentInfo.label}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {format(order.createdAt, "dd MMM yyyy", { locale: dateLocale })}
                      </TableCell>
                      <TableCell className="text-right">
                        <OrderActions
                          id={order.id}
                          locale={locale}
                          currentStatus={order.status}
                          dictionary={{
                            common: dictionary.common,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/orders?page=${p}&status=${status}&search=${search}`}
            >
              <Button
                variant={p === parseInt(page) ? "default" : "outline"}
                size="sm"
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
