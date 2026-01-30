import { auth } from "@/lib/auth";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getProducts, getProductStats, type ProductListItem } from "@/lib/data/products";
import { UserRole } from "@/lib/types";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Package, Tag, AlertTriangle, MoreHorizontal, Eye, Edit, Trash } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ProductActions } from "./components/product-actions";

interface ProductsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{
    page?: string;
    category?: string;
    search?: string;
  }>;
}

export default async function ProductsPage({
  params,
  searchParams,
}: ProductsPageProps) {
  const session = await auth();
  const { locale: localeParam } = await params;
  const { page = "1", category = "", search = "" } = await searchParams;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;
  const dictionary = await getDictionary(locale);

  const dealerId =
    session?.user?.role === UserRole.SUPER_ADMIN
      ? undefined
      : session?.user?.dealerId || undefined;

  const [{ data: products, total }, stats] = await Promise.all([
    getProducts(
      {
        dealerId,
        categoryId: category || undefined,
        search: search || undefined,
      },
      parseInt(page),
      10
    ),
    dealerId ? getProductStats(dealerId) : null,
  ]);

  const totalPages = Math.ceil(total / 10);

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const getFirstImage = (imagesJson: string | null): string | null => {
    if (!imagesJson) return null;
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) && images.length > 0 ? images[0] : null;
    } catch {
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Urunler</h1>
          <p className="text-muted-foreground">Urun yonetimi</p>
        </div>
        <div className="flex gap-2">
          <Link href={`/${locale}/products/categories`}>
            <Button variant="outline">
              <Tag className="mr-2 h-4 w-4" />
              Kategoriler
            </Button>
          </Link>
          <Link href={`/${locale}/products/new`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Urun Ekle
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Urun</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeProducts} aktif
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kategoriler</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Dusuk Stok</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-500">
                {stats.lowStockVariants}
              </div>
              <p className="text-xs text-muted-foreground">varyant</p>
            </CardContent>
          </Card>
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            {dictionary.common.showing} {products.length} {dictionary.common.of}{" "}
            {total} {dictionary.common.entries}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {products.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              {dictionary.common.noData}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Gorsel</TableHead>
                  <TableHead>Urun Adi</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Fiyat</TableHead>
                  <TableHead>Varyant</TableHead>
                  <TableHead>{dictionary.common.status}</TableHead>
                  <TableHead className="text-right">
                    {dictionary.common.actions}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product: ProductListItem) => {
                  const imageUrl = getFirstImage(product.images);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <div className="relative h-12 w-12 rounded-md overflow-hidden bg-muted">
                          {imageUrl ? (
                            <Image
                              src={imageUrl}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Package className="h-6 w-6 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">{product.name}</div>
                          <div className="text-sm text-muted-foreground">
                            {product.slug}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category.name}</Badge>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatPrice(product.price)}
                      </TableCell>
                      <TableCell>{product._count.variants} adet</TableCell>
                      <TableCell>
                        <Badge
                          variant={product.isActive ? "default" : "secondary"}
                        >
                          {product.isActive
                            ? dictionary.common.active
                            : dictionary.common.inactive}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <ProductActions
                          id={product.id}
                          locale={locale}
                          isActive={product.isActive}
                          dictionary={{
                            common: dictionary.common,
                          }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={`/${locale}/products?page=${p}&category=${category}&search=${search}`}
            >
              <Button
                variant={p === parseInt(page) ? "default" : "outline"}
                size="sm"
              >
                {p}
              </Button>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
