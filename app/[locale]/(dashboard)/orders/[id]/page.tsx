import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getOrderById } from "@/lib/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ArrowLeft, User, Package, MapPin, Phone, Mail } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { tr, enUS, es } from "date-fns/locale";

interface OrderDetailPageProps {
  params: Promise<{ locale: string; id: string }>;
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

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const session = await auth();
  const { locale: localeParam, id } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dateLocale = dateLocales[locale];

  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const [order, dictionary] = await Promise.all([
    getOrderById(id, session.user.dealerId),
    getDictionary(locale),
  ]);

  if (!order) {
    notFound();
  }

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const statusInfo = statusLabels[order.status] || {
    label: order.status,
    variant: "secondary" as const,
  };
  const paymentInfo = paymentStatusLabels[order.paymentStatus] || {
    label: order.paymentStatus,
    variant: "secondary" as const,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/orders`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Siparis #{order.orderNumber}
            </h1>
            <p className="text-muted-foreground">
              {format(order.createdAt, "dd MMMM yyyy, HH:mm", { locale: dateLocale })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Badge variant={statusInfo.variant} className="text-sm">
            {statusInfo.label}
          </Badge>
          <Badge variant={paymentInfo.variant} className="text-sm">
            {paymentInfo.label}
          </Badge>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Customer Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Musteri Bilgileri
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium">{order.customerName}</div>
              {order.student && (
                <div className="text-sm text-muted-foreground">
                  Ogrenci: {order.student.firstName} {order.student.lastName}
                </div>
              )}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Phone className="h-4 w-4" />
              {order.customerPhone}
            </div>
            <div className="flex items-center gap-2 text-muted-foreground">
              <Mail className="h-4 w-4" />
              {order.customerEmail}
            </div>
          </CardContent>
        </Card>

        {/* Shipping Address */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Teslimat Adresi
            </CardTitle>
          </CardHeader>
          <CardContent>
            {order.shippingAddress ? (
              <p className="text-muted-foreground whitespace-pre-line">
                {order.shippingAddress}
              </p>
            ) : (
              <p className="text-muted-foreground">Adres girilmemis</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Order Items */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Siparis Urunleri
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Urun</TableHead>
                <TableHead>Varyant</TableHead>
                <TableHead className="text-right">Birim Fiyat</TableHead>
                <TableHead className="text-right">Adet</TableHead>
                <TableHead className="text-right">Toplam</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">
                    <Link
                      href={`/${locale}/products/${item.product.id}/edit`}
                      className="hover:underline"
                    >
                      {item.product.name}
                    </Link>
                  </TableCell>
                  <TableCell>
                    {item.variant ? (
                      <span>
                        {item.variant.size}
                        {item.variant.color && ` / ${item.variant.color}`}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {formatPrice(item.unitPrice)}
                  </TableCell>
                  <TableCell className="text-right">{item.quantity}</TableCell>
                  <TableCell className="text-right font-medium">
                    {formatPrice(item.total)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Ara Toplam</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Kargo</span>
              <span>{formatPrice(order.shippingCost)}</span>
            </div>
            <Separator />
            <div className="flex justify-between font-medium text-lg">
              <span>Toplam</span>
              <span className="text-primary">{formatPrice(order.total)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notes */}
      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notlar</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground whitespace-pre-line">
              {order.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
