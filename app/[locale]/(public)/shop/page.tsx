import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { i18n, type Locale } from "@/lib/i18n/config";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Filter,
  Search,
  Grid3X3,
  LayoutGrid,
  SlidersHorizontal,
  Heart,
  Eye,
} from "lucide-react";
import { getPublicDealer } from "@/lib/utils/get-public-dealer";

interface ShopPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}

export async function generateMetadata() {
  const dealer = await getPublicDealer();

  return {
    title: dealer ? `Mağaza - ${dealer.name}` : "Mağaza",
    description: "Kaliteli spor malzemeleri ve formalar",
  };
}

export default async function ShopPage({ params, searchParams }: ShopPageProps) {
  const { locale: localeParam } = await params;
  const { category: categorySlug } = await searchParams;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  const dealer = await getPublicDealer();

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
      description: true,
      category: {
        select: { name: true, slug: true },
      },
      variants: {
        select: { stock: true },
      },
    },
  });

  // Get selected category name
  const selectedCategory = categorySlug
    ? categories.find((c) => c.slug === categorySlug)?.name
    : null;

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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Hero Banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold mb-4">
              {selectedCategory || "Tüm Ürünler"}
            </h1>
            <p className="text-white/80 text-lg">
              {products.length} ürün listeleniyor
            </p>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar - Categories */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            <div className="sticky top-24 space-y-6">
              {/* Search */}
              <Card className="p-4 border-0 shadow-lg">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Ürün ara..."
                    className="pl-10 bg-slate-50 dark:bg-slate-800 border-0"
                  />
                </div>
              </Card>

              {/* Categories */}
              {categories.length > 0 && (
                <Card className="p-4 border-0 shadow-lg">
                  <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                    <SlidersHorizontal className="h-5 w-5 text-blue-600" />
                    <h2 className="font-bold text-lg">Kategoriler</h2>
                  </div>
                  <div className="space-y-1">
                    <Link href={`/${locale}/shop`}>
                      <Button
                        variant={!categorySlug ? "default" : "ghost"}
                        className={`w-full justify-between ${!categorySlug ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                      >
                        <span>Tüm Ürünler</span>
                        <Badge variant={!categorySlug ? "secondary" : "outline"} className="ml-2">
                          {products.length}
                        </Badge>
                      </Button>
                    </Link>
                    {categories.map((cat) => (
                      <Link
                        key={cat.id}
                        href={`/${locale}/shop?category=${cat.slug}`}
                      >
                        <Button
                          variant={categorySlug === cat.slug ? "default" : "ghost"}
                          className={`w-full justify-between ${categorySlug === cat.slug ? "bg-blue-600 hover:bg-blue-700" : ""}`}
                        >
                          <span>{cat.name}</span>
                          <Badge
                            variant={categorySlug === cat.slug ? "secondary" : "outline"}
                            className="ml-2"
                          >
                            {cat._count.products}
                          </Badge>
                        </Button>
                      </Link>
                    ))}
                  </div>
                </Card>
              )}

              {/* Price Filter Placeholder */}
              <Card className="p-4 border-0 shadow-lg">
                <div className="flex items-center gap-2 mb-4 pb-3 border-b">
                  <Filter className="h-5 w-5 text-blue-600" />
                  <h2 className="font-bold text-lg">Fiyat Aralığı</h2>
                </div>
                <div className="space-y-3">
                  <div className="flex gap-2">
                    <Input placeholder="Min" className="bg-slate-50 dark:bg-slate-800 border-0" />
                    <Input placeholder="Max" className="bg-slate-50 dark:bg-slate-800 border-0" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Filtrele
                  </Button>
                </div>
              </Card>
            </div>
          </aside>

          {/* Products Grid */}
          <div className="flex-1">
            {/* Toolbar */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 rounded-xl p-4 shadow-lg">
              <p className="text-muted-foreground">
                <span className="font-semibold text-foreground">{products.length}</span> ürün bulundu
              </p>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <Grid3X3 className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon" className="hidden md:flex">
                  <LayoutGrid className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {products.length === 0 ? (
              <Card className="border-0 shadow-lg">
                <CardContent className="text-center py-20">
                  <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <ShoppingBag className="h-10 w-10 text-slate-400" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Ürün Bulunamadı</h3>
                  <p className="text-muted-foreground mb-6">
                    Bu kategoride henüz ürün bulunmuyor.
                  </p>
                  <Link href={`/${locale}/shop`}>
                    <Button>Tüm Ürünlere Dön</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6 grid-cols-2 md:grid-cols-3">
                {products.map((product) => {
                  const imageUrl = getFirstImage(product.images);
                  const totalStock = getTotalStock(product.variants);
                  const isOutOfStock = totalStock === 0;

                  return (
                    <Link
                      key={product.id}
                      href={`/${locale}/shop/${product.slug}`}
                    >
                      <Card className="group h-full border-0 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white dark:bg-slate-800">
                        <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                          ) : (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <ShoppingBag className="h-16 w-16 text-slate-300" />
                            </div>
                          )}

                          {/* Category Badge */}
                          <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-600 shadow-lg">
                            {product.category.name}
                          </Badge>

                          {/* Stock Badge */}
                          {isOutOfStock && (
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                              <Badge variant="destructive" className="text-sm px-4 py-1">
                                Stokta Yok
                              </Badge>
                            </div>
                          )}

                          {/* Hover Actions */}
                          <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-lg">
                              <Heart className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="secondary" className="h-9 w-9 rounded-full shadow-lg">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>

                          {/* Quick Add Button */}
                          <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                            <Button className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg" disabled={isOutOfStock}>
                              <ShoppingBag className="mr-2 h-4 w-4" />
                              {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
                            </Button>
                          </div>
                        </div>

                        <CardContent className="p-4">
                          <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                            {product.category.name}
                          </p>
                          <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                            {product.name}
                          </h3>
                          <div className="flex items-center justify-between">
                            <p className="text-xl font-bold text-blue-600">
                              {formatPrice(product.price)}
                            </p>
                            {!isOutOfStock && (
                              <Badge variant="outline" className="text-xs text-emerald-600 border-emerald-200 bg-emerald-50">
                                Stokta
                              </Badge>
                            )}
                          </div>
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
    </div>
  );
}
