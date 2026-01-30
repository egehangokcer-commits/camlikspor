import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Filter } from "lucide-react";

interface ShopPageProps {
  params: Promise<{ locale: string; dealerSlug: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata({ params }: ShopPageProps) {
  const { dealerSlug } = await params;

  const dealer = await prisma.dealer.findUnique({
    where: { slug: dealerSlug },
    select: { name: true },
  });

  return {
    title: dealer ? `Magaza - ${dealer.name}` : "Magaza",
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: localeParam, dealerSlug } = await params;
  const { category: categorySlug } = await searchParams;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  // Fetch dealer
  const dealer = await prisma.dealer.findUnique({
    where: {
      slug: dealerSlug,
      isActive: true,
      isPublicPageActive: true,
    },
    select: { id: true, name: true },
  });

  if (!dealer) {
    notFound();
  }

  // Fetch categories
  const categories = await prisma.productCategory.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });

  // Fetch products
  const products = await prisma.product.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
      ...(categorySlug && {
        category: { slug: categorySlug },
      }),
    },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: {
        select: { name: true, slug: true },
      },
      variants: {
        select: { stock: true },
      },
    },
  });

  const dictionary = await getDictionary(locale);
  const shopDict = dictionary.shop || {};

  const getFirstImage = (imagesJson: string | null): string | null => {
    if (!imagesJson) return null;
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) && images.length > 0 ? images[0] : null;
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getTotalStock = (variants: { stock: number }[]): number => {
    return variants.reduce((sum, v) => sum + v.stock, 0);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBag className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">{shopDict.title || "Magaza"}</h1>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Sidebar - Categories */}
        {categories.length > 0 && (
          <aside className="w-full lg:w-64 flex-shrink-0">
            <div className="sticky top-24">
              <div className="flex items-center gap-2 mb-4">
                <Filter className="h-5 w-5" />
                <h2 className="font-semibold">{shopDict.categories || "Kategoriler"}</h2>
              </div>
              <div className="space-y-2">
                <Link href={`/${locale}/${dealerSlug}/shop`}>
                  <Button
                    variant={!categorySlug ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    {shopDict.allProducts || "Tum Urunler"}
                  </Button>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/${locale}/${dealerSlug}/shop?category=${cat.slug}`}
                  >
                    <Button
                      variant={categorySlug === cat.slug ? "default" : "ghost"}
                      className="w-full justify-between"
                    >
                      <span>{cat.name}</span>
                      <Badge variant="secondary" className="ml-2">
                        {cat._count.products}
                      </Badge>
                    </Button>
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        )}

        {/* Products Grid */}
        <div className="flex-1">
          {products.length === 0 ? (
            <div className="text-center py-20">
              <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-muted-foreground">{shopDict.noProducts || "Henuz urun bulunmuyor."}</p>
            </div>
          ) : (
            <div className="grid gap-6 grid-cols-2 md:grid-cols-3 lg:grid-cols-3">
              {products.map((product) => {
                const imageUrl = getFirstImage(product.images);
                const totalStock = getTotalStock(product.variants);
                const isOutOfStock = totalStock === 0;

                return (
                  <Link
                    key={product.id}
                    href={`/${locale}/${dealerSlug}/shop/${product.slug}`}
                  >
                    <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                      <div className="aspect-square relative bg-muted">
                        {imageUrl ? (
                          <Image
                            src={imageUrl}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                        ) : (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                          </div>
                        )}
                        <Badge className="absolute top-3 left-3" variant="secondary">
                          {product.category.name}
                        </Badge>
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                            <Badge variant="destructive" className="text-sm">
                              {shopDict.outOfStock || "Stokta Yok"}
                            </Badge>
                          </div>
                        )}
                      </div>
                      <CardContent className="p-4">
                        <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                          {product.name}
                        </h3>
                        <p className="text-lg font-bold text-primary">
                          {formatPrice(product.price)}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
