"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Trash2,
  Minus,
  Plus,
  ArrowLeft,
  CreditCard,
  ShoppingBag,
  Truck,
  Shield,
  Tag,
  ChevronRight,
  Home,
  Package,
} from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;

  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
  } = useCart();

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4 py-20">
          <Card className="max-w-md mx-auto text-center border-0 shadow-xl">
            <CardContent className="p-12">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                <ShoppingBag className="h-12 w-12 text-slate-400" />
              </div>
              <h1 className="text-2xl font-bold mb-3">Sepetiniz Boş</h1>
              <p className="text-muted-foreground mb-8">
                Henüz sepetinize ürün eklemediniz. Hemen alışverişe başlayın!
              </p>
              <Link href={`/${locale}/shop`}>
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Alışverişe Başla
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
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
            <span className="text-foreground font-medium">Sepetim</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center">
              <ShoppingCart className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Alışveriş Sepetim</h1>
              <p className="text-muted-foreground">{totalItems} ürün</p>
            </div>
          </div>
          <Button variant="ghost" onClick={clearCart} className="text-muted-foreground hover:text-destructive">
            <Trash2 className="mr-2 h-4 w-4" />
            Sepeti Temizle
          </Button>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            {items.map((item) => (
              <Card key={`${item.productId}-${item.variantId}`} className="border-0 shadow-lg overflow-hidden">
                <CardContent className="p-0">
                  <div className="flex gap-4 p-4">
                    {/* Image */}
                    <div className="w-28 h-28 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 rounded-xl overflow-hidden flex-shrink-0">
                      {item.image ? (
                        <Image
                          src={item.image}
                          alt={item.name}
                          width={112}
                          height={112}
                          className="object-cover w-full h-full"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <Package className="h-10 w-10 text-slate-400" />
                        </div>
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {item.size && (
                          <Badge variant="secondary" className="text-xs">
                            Beden: {item.size}
                          </Badge>
                        )}
                        {item.color && (
                          <Badge variant="secondary" className="text-xs">
                            Renk: {item.color}
                          </Badge>
                        )}
                      </div>
                      <p className="text-2xl font-bold text-blue-600">
                        {formatPrice(item.price)}
                      </p>
                    </div>

                    {/* Quantity & Actions */}
                    <div className="flex flex-col items-end justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:text-destructive hover:bg-red-50"
                        onClick={() => removeItem(item.productId, item.variantId)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>

                      <div className="flex items-center gap-1 border-2 border-slate-200 rounded-lg overflow-hidden">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity - 1,
                              item.variantId
                            )
                          }
                          disabled={item.quantity <= 1}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <span className="w-10 text-center font-semibold">
                          {item.quantity}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 rounded-none"
                          onClick={() =>
                            updateQuantity(
                              item.productId,
                              item.quantity + 1,
                              item.variantId
                            )
                          }
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      <p className="text-sm font-semibold text-muted-foreground">
                        Toplam: {formatPrice(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            {/* Continue Shopping */}
            <Link href={`/${locale}/shop`}>
              <Button variant="outline" className="w-full md:w-auto">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Alışverişe Devam Et
              </Button>
            </Link>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              <Card className="border-0 shadow-xl">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2">
                    <Tag className="h-5 w-5 text-blue-600" />
                    Sipariş Özeti
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ara Toplam ({totalItems} ürün)</span>
                    <span className="font-medium">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Kargo</span>
                    <span className="font-medium text-emerald-600">Ücretsiz</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg">
                    <span className="font-bold">Toplam</span>
                    <span className="font-bold text-blue-600">{formatPrice(totalPrice)}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex-col gap-3">
                  <Button
                    size="lg"
                    className="w-full bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={() => router.push(`/${locale}/checkout`)}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Ödemeye Geç
                  </Button>
                  <p className="text-xs text-center text-muted-foreground">
                    Güvenli ödeme ile alışverişinizi tamamlayın
                  </p>
                </CardFooter>
              </Card>

              {/* Trust Badges */}
              <Card className="border-0 shadow-lg">
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2 text-sm">
                      <Truck className="h-5 w-5 text-blue-600" />
                      <span>Ücretsiz Kargo</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="h-5 w-5 text-emerald-600" />
                      <span>Güvenli Ödeme</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
