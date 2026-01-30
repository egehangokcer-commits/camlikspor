"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Loader2, CreditCard, ShoppingBag, ArrowLeft } from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const dealerSlug = params.dealerSlug as string;

  const { items, totalPrice, clearCart, setDealerSlug } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    notes: "",
  });

  // Set dealer slug
  useEffect(() => {
    setDealerSlug(dealerSlug);
  }, [dealerSlug, setDealerSlug]);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/${dealerSlug}/shop`);
    }
  }, [items, router, locale, dealerSlug]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.customerName || !formData.customerEmail || !formData.customerPhone) {
      toast.error("Lutfen zorunlu alanlari doldurun");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/shop/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dealerSlug,
          ...formData,
          items: items.map((item) => ({
            productId: item.productId,
            variantId: item.variantId,
            quantity: item.quantity,
            unitPrice: item.price,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Siparis olusturulamadi");
      }

      const result = await response.json();
      clearCart();
      router.push(`/${locale}/${dealerSlug}/checkout/success?order=${result.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata olustu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <CreditCard className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Odeme</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <div className="lg:col-span-2 space-y-6">
            {/* Customer Info */}
            <Card>
              <CardHeader>
                <CardTitle>Musteri Bilgileri</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">Ad Soyad *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) =>
                        setFormData({ ...formData, customerName: e.target.value })
                      }
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerPhone">Telefon *</Label>
                    <Input
                      id="customerPhone"
                      type="tel"
                      placeholder="0XXX XXX XX XX"
                      value={formData.customerPhone}
                      onChange={(e) =>
                        setFormData({ ...formData, customerPhone: e.target.value })
                      }
                      required
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerEmail">E-posta *</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) =>
                      setFormData({ ...formData, customerEmail: e.target.value })
                    }
                    required
                  />
                </div>
              </CardContent>
            </Card>

            {/* Shipping Address */}
            <Card>
              <CardHeader>
                <CardTitle>Teslimat Adresi</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="shippingAddress">Adres</Label>
                  <Textarea
                    id="shippingAddress"
                    rows={3}
                    value={formData.shippingAddress}
                    onChange={(e) =>
                      setFormData({ ...formData, shippingAddress: e.target.value })
                    }
                    placeholder="Sokak, mahalle, il/ilce, posta kodu"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Notes */}
            <Card>
              <CardHeader>
                <CardTitle>Siparis Notu</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="notes">Not (Opsiyonel)</Label>
                  <Textarea
                    id="notes"
                    rows={2}
                    value={formData.notes}
                    onChange={(e) =>
                      setFormData({ ...formData, notes: e.target.value })
                    }
                    placeholder="Siparisinizle ilgili eklemek istediginiz bir not var mi?"
                  />
                </div>
              </CardContent>
            </Card>

            <Link href={`/${locale}/${dealerSlug}/shop/cart`}>
              <Button variant="outline" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Sepete Don
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Siparis Ozeti</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Items */}
                <div className="space-y-3">
                  {items.map((item) => (
                    <div
                      key={`${item.productId}-${item.variantId}`}
                      className="flex justify-between text-sm"
                    >
                      <div className="flex-1 min-w-0">
                        <p className="truncate">{item.name}</p>
                        <p className="text-muted-foreground text-xs">
                          {item.size && `Beden: ${item.size}`}
                          {item.color && ` | Renk: ${item.color}`}
                          {` | Adet: ${item.quantity}`}
                        </p>
                      </div>
                      <span className="ml-2 font-medium">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Ara Toplam</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kargo</span>
                  <span className="text-green-600">Ucretsiz</span>
                </div>

                <Separator />

                <div className="flex justify-between font-bold text-lg">
                  <span>Toplam</span>
                  <span className="text-primary">{formatPrice(totalPrice)}</span>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Siparis Olusturuluyor...
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="mr-2 h-5 w-5" />
                      Siparisi Tamamla
                    </>
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground">
                  Siparisi tamamlayarak satis kosullarini kabul etmis olursunuz.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </form>
    </div>
  );
}
