import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getCategories } from "@/lib/data/products";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm } from "../components/product-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface NewProductPageProps {
  params: Promise<{ locale: string }>;
}

export default async function NewProductPage({ params }: NewProductPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const dictionary = await getDictionary(locale);
  const categories = await getCategories(session.user.dealerId);

  if (categories.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Link href={`/${locale}/products`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Yeni Urun</h1>
            <p className="text-muted-foreground">Yeni urun ekle</p>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kategori Gerekli</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground mb-4">
              Urun eklemek icin once en az bir kategori olusturmaniz gerekiyor.
            </p>
            <Link href={`/${locale}/products/categories`}>
              <Button>Kategori Olustur</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href={`/${locale}/products`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Yeni Urun</h1>
          <p className="text-muted-foreground">Yeni urun ekle</p>
        </div>
      </div>

      <ProductForm
        locale={locale}
        categories={categories}
        dictionary={{
          common: dictionary.common,
        }}
      />
    </div>
  );
}
