"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import {
  Loader2,
  CreditCard,
  ShoppingBag,
  ArrowLeft,
  User,
  MapPin,
  FileText,
  Truck,
  Shield,
  Lock,
  Home,
  ChevronRight,
  Package,
  CheckCircle2,
} from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";
import Link from "next/link";

export default function CheckoutPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const { items, totalItems, totalPrice, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [dealerSlug, setDealerSlug] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    shippingAddress: "",
    notes: "",
  });

  // Fetch dealer slug from API
  useEffect(() => {
    async function fetchDealer() {
      try {
        const response = await fetch("/api/dealer/by-domain");
        if (response.ok) {
          const data = await response.json();
          setDealerSlug(data.slug);
        }
      } catch (error) {
        console.error("Failed to fetch dealer:", error);
      }
    }
    fetchDealer();
  }, []);

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`/${locale}/shop`);
    }
  }, [items, router, locale]);

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
      toast.error("Lütfen zorunlu alanları doldurun");
      return;
    }

    if (!dealerSlug) {
      toast.error("Mağaza bilgisi alınamadı");
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
        throw new Error(error.message || "Sipariş oluşturulamadı");
      }

      const result = await response.json();
      clearCart();
      router.push(`/${locale}/checkout/success?order=${result.orderNumber}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Bir hata oluştu");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}/cart`} className="hover:text-foreground">
              Sepetim
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium">Ödeme</span>
          </nav>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="bg-white dark:bg-slate-800 border-b py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-center gap-4 max-w-xl mx-auto">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-white" />
              </div>
              <span className="text-sm font-medium hidden sm:inline">Sepet</span>
            </div>
            <div className="flex-1 h-1 bg-blue-600 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <span className="text-sm font-medium hidden sm:inline">Ödeme</span>
            </div>
            <div className="flex-1 h-1 bg-slate-200 dark:bg-slate-700 rounded" />
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                <span className="text-slate-500 font-bold text-sm">3</span>
              </div>
              <span className="text-sm text-muted-foreground hidden sm:inline">Onay</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {/* Customer Info */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                      <User className="h-5 w-5 text-blue-600" />
                    </div>
                    Müşteri Bilgileri
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="customerName">Ad Soyad *</Label>
                      <Input
                        id="customerName"
                        placeholder="Adınız ve soyadınız"
                        value={formData.customerName}
                        onChange={(e) =>
                          setFormData({ ...formData, customerName: e.target.value })
                        }
                        className="bg-slate-50 dark:bg-slate-800 border-0"
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
                        className="bg-slate-50 dark:bg-slate-800 border-0"
                        required
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="customerEmail">E-posta *</Label>
                    <Input
                      id="customerEmail"
                      type="email"
                      placeholder="ornek@email.com"
                      value={formData.customerEmail}
                      onChange={(e) =>
                        setFormData({ ...formData, customerEmail: e.target.value })
                      }
                      className="bg-slate-50 dark:bg-slate-800 border-0"
                      required
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Shipping Address */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center">
                      <MapPin className="h-5 w-5 text-emerald-600" />
                    </div>
                    Teslimat Adresi
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <Label htmlFor="shippingAddress">Adres</Label>
                    <Textarea
                      id="shippingAddress"
                      rows={4}
                      value={formData.shippingAddress}
                      onChange={(e) =>
                        setFormData({ ...formData, shippingAddress: e.target.value })
                      }
                      placeholder="Mahalle, sokak, bina no, daire no, ilçe, il, posta kodu"
                      className="bg-slate-50 dark:bg-slate-800 border-0 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Notes */}
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-900 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-amber-600" />
                    </div>
                    Sipariş Notu
                  </CardTitle>
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
                      placeholder="Siparişinizle ilgili eklemek istediğiniz bir not var mı?"
                      className="bg-slate-50 dark:bg-slate-800 border-0 resize-none"
                    />
                  </div>
                </CardContent>
              </Card>

              <Link href={`/${locale}/cart`}>
                <Button variant="outline" type="button" className="gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Sepete Dön
                </Button>
              </Link>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-4">
                <Card className="border-0 shadow-xl">
                  <CardHeader className="pb-4">
                    <CardTitle className="flex items-center gap-2">
                      <ShoppingBag className="h-5 w-5 text-blue-600" />
                      Sipariş Özeti
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Items */}
                    <div className="space-y-4 max-h-64 overflow-y-auto">
                      {items.map((item) => (
                        <div
                          key={`${item.productId}-${item.variantId}`}
                          className="flex gap-3"
                        >
                          <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-lg overflow-hidden flex-shrink-0">
                            {item.image ? (
                              <Image
                                src={item.image}
                                alt={item.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Package className="h-6 w-6 text-slate-400" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">{item.name}</p>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {item.size && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.size}
                                </Badge>
                              )}
                              {item.color && (
                                <Badge variant="secondary" className="text-xs">
                                  {item.color}
                                </Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                x{item.quantity}
                              </Badge>
                            </div>
                            <p className="font-semibold text-blue-600 mt-1">
                              {formatPrice(item.price * item.quantity)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>

                    <Separator />

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Ara Toplam ({totalItems} ürün)</span>
                        <span>{formatPrice(totalPrice)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Kargo</span>
                        <span className="text-emerald-600 font-medium">Ücretsiz</span>
                      </div>
                    </div>

                    <Separator />

                    <div className="flex justify-between text-lg">
                      <span className="font-bold">Toplam</span>
                      <span className="font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                    </div>

                    <Button
                      type="submit"
                      size="lg"
                      className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                      disabled={isSubmitting || !dealerSlug}
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                          Sipariş Oluşturuluyor...
                        </>
                      ) : (
                        <>
                          <Lock className="mr-2 h-5 w-5" />
                          Siparişi Tamamla
                        </>
                      )}
                    </Button>

                    <p className="text-xs text-center text-muted-foreground">
                      Siparişi tamamlayarak satış koşullarını kabul etmiş olursunuz.
                    </p>
                  </CardContent>
                </Card>

                {/* Trust Badges */}
                <Card className="border-0 shadow-lg">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span>256-bit SSL ile güvenli ödeme</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span>2-3 iş günü içinde teslimat</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <CreditCard className="h-5 w-5 text-amber-600" />
                      <span>Kredi kartına taksit imkanı</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
