import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle, ShoppingBag, Home } from "lucide-react";

interface SuccessPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ order?: string }>;
}

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: SuccessPageProps) {
  const { locale } = await params;
  const { order: orderNumber } = await searchParams;

  return (
    <div className="container mx-auto px-4 py-16">
      <Card className="max-w-lg mx-auto text-center">
        <CardContent className="pt-8 pb-8 space-y-6">
          <div className="flex justify-center">
            <div className="h-20 w-20 rounded-full bg-green-100 flex items-center justify-center">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-bold">Siparisiz Alindi!</h1>
            <p className="text-muted-foreground">
              Siparisiz basariyla olusturuldu. En kisa surede sizinle iletisime gececegiz.
            </p>
          </div>

          {orderNumber && (
            <div className="bg-muted rounded-lg p-4">
              <p className="text-sm text-muted-foreground">Siparis Numarasi</p>
              <p className="text-xl font-mono font-bold">{orderNumber}</p>
            </div>
          )}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Siparisinizin durumu hakkinda e-posta ile bilgilendirileceksiniz.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Link href={`/${locale}/shop`}>
              <Button variant="outline">
                <ShoppingBag className="mr-2 h-4 w-4" />
                Alisverise Devam Et
              </Button>
            </Link>
            <Link href={`/${locale}`}>
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Ana Sayfaya Don
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
