import { auth } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getProductById, getCategories } from "@/lib/data/products";
import { ProductForm } from "../../components/product-form";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

interface EditProductPageProps {
  params: Promise<{ locale: string; id: string }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const session = await auth();
  const { locale: localeParam, id } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const [product, categories, dictionary] = await Promise.all([
    getProductById(id, session.user.dealerId),
    getCategories(session.user.dealerId),
    getDictionary(locale),
  ]);

  if (!product) {
    notFound();
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
          <h1 className="text-3xl font-bold tracking-tight">Urun Duzenle</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      <ProductForm
        locale={locale}
        categories={categories}
        initialData={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          price: product.price,
          categoryId: product.categoryId,
          isActive: product.isActive,
          images: product.images,
          variants: product.variants.map((v) => ({
            id: v.id,
            size: v.size,
            color: v.color || "",
            stock: v.stock,
            sku: v.sku || "",
          })),
        }}
        dictionary={{
          common: dictionary.common,
        }}
      />
    </div>
  );
}
