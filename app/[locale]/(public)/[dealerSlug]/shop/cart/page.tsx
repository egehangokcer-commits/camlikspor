"use client";

import { useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ShoppingCart, Trash2, Minus, Plus, ArrowLeft, CreditCard } from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";

export default function CartPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const dealerSlug = params.dealerSlug as string;

  const {
    items,
    totalItems,
    totalPrice,
    removeItem,
    updateQuantity,
    clearCart,
    setDealerSlug,
  } = useCart();

  // Set dealer slug
  useEffect(() => {
    setDealerSlug(dealerSlug);
  }, [dealerSlug, setDealerSlug]);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <ShoppingCart className="h-24 w-24 mx-auto text-muted-foreground/30 mb-6" />
        <h1 className="text-2xl font-bold mb-2">Sepetiniz Bos</h1>
        <p className="text-muted-foreground mb-6">
          Henuz sepetinize urun eklemediniz.
        </p>
        <Link href={`/${locale}/${dealerSlug}/shop`}>
          <Button>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Alisverise Devam Et
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingCart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Sepetim</h1>
        <span className="text-muted-foreground">({totalItems} urun)</span>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={`${item.productId}-${item.variantId}`}>
              <CardContent className="p-4">
                <div className="flex gap-4">
                  {/* Image */}
                  <div className="w-24 h-24 bg-muted rounded-lg overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={96}
                        height={96}
                        className="object-cover w-full h-full"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingCart className="h-8 w-8 text-muted-foreground/30" />
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold truncate">{item.name}</h3>
                    <div className="text-sm text-muted-foreground mt-1">
                      {item.size && <span>Beden: {item.size}</span>}
                      {item.color && <span className="ml-3">Renk: {item.color}</span>}
                    </div>
                    <p className="font-bold text-primary mt-2">
                      {formatPrice(item.price)}
                    </p>
                  </div>

                  {/* Quantity & Remove */}
                  <div className="flex flex-col items-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:text-destructive"
                      onClick={() => removeItem(item.productId, item.variantId)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity - 1,
                            item.variantId
                          )
                        }
                        disabled={item.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center font-medium">
                        {item.quantity}
                      </span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() =>
                          updateQuantity(
                            item.productId,
                            item.quantity + 1,
                            item.variantId
                          )
                        }
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm font-medium">
                      {formatPrice(item.price * item.quantity)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}

          {/* Actions */}
          <div className="flex gap-4">
            <Link href={`/${locale}/${dealerSlug}/shop`}>
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Alisverise Devam Et
              </Button>
            </Link>
            <Button variant="ghost" onClick={clearCart}>
              <Trash2 className="mr-2 h-4 w-4" />
              Sepeti Temizle
            </Button>
          </div>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-1">
          <Card className="sticky top-24">
            <CardHeader>
              <CardTitle>Siparis Ozeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
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
            </CardContent>
            <CardFooter>
              <Button
                size="lg"
                className="w-full"
                onClick={() => router.push(`/${locale}/${dealerSlug}/checkout`)}
              >
                <CreditCard className="mr-2 h-5 w-5" />
                Odemeye Gec
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
