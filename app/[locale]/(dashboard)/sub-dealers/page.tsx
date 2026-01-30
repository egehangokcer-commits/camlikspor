import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getSubDealers, getSubDealerStats } from "@/lib/data/sub-dealers";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Building2, Package, ShoppingCart, Users } from "lucide-react";

interface Props {
  params: Promise<{ locale: Locale }>;
  searchParams: Promise<{ page?: string; search?: string }>;
}

export default async function SubDealersPage({ params, searchParams }: Props) {
  const { locale } = await params;
  const { page = "1", search } = await searchParams;

  const session = await auth();
  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);

  const currentPage = parseInt(page) || 1;
  const [{ data: subDealers, total }, stats] = await Promise.all([
    getSubDealers(
      {
        parentDealerId: session.user.dealerId,
        search: search || undefined,
      },
      currentPage,
      10
    ),
    getSubDealerStats(session.user.dealerId),
  ]);

  const totalPages = Math.ceil(total / 10);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dict.subDealers?.title || "Alt Bayiler"}
          </h1>
          <p className="text-muted-foreground">
            {dict.subDealers?.description || "Alt bayilerinizi yönetin"}
          </p>
        </div>
        <Link href={`/${locale}/sub-dealers/create`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {dict.subDealers?.create || "Yeni Alt Bayi"}
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.subDealers?.totalSubDealers || "Toplam Alt Bayi"}
            </CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubDealers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.subDealers?.activeSubDealers || "Aktif Alt Bayi"}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.activeSubDealers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.subDealers?.totalProducts || "Toplam Ürün"}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProducts}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {dict.subDealers?.totalOrders || "Toplam Sipariş"}
            </CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalOrders}</div>
          </CardContent>
        </Card>
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>{dict.subDealers?.list || "Alt Bayi Listesi"}</CardTitle>
          <CardDescription>
            {dict.subDealers?.listDescription ||
              "Tüm alt bayilerinizi görüntüleyin ve yönetin"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {subDealers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Building2 className="h-12 w-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">
                {dict.subDealers?.noSubDealers || "Henüz alt bayi yok"}
              </p>
              <Link href={`/${locale}/sub-dealers/create`} className="mt-4">
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  {dict.subDealers?.createFirst || "İlk alt bayinizi oluşturun"}
                </Button>
              </Link>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{dict.common?.name || "İsim"}</TableHead>
                  <TableHead>{dict.common?.slug || "Slug"}</TableHead>
                  <TableHead>{dict.subDealers?.domain || "Domain"}</TableHead>
                  <TableHead>{dict.common?.status || "Durum"}</TableHead>
                  <TableHead>{dict.subDealers?.products || "Ürünler"}</TableHead>
                  <TableHead>{dict.subDealers?.orders || "Siparişler"}</TableHead>
                  <TableHead>{dict.common?.actions || "İşlemler"}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subDealers.map((dealer) => (
                  <TableRow key={dealer.id}>
                    <TableCell className="font-medium">{dealer.name}</TableCell>
                    <TableCell>{dealer.slug}</TableCell>
                    <TableCell>
                      {dealer.customDomain || dealer.subdomain || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={dealer.isActive ? "default" : "secondary"}
                      >
                        {dealer.isActive
                          ? dict.common?.active || "Aktif"
                          : dict.common?.inactive || "Pasif"}
                      </Badge>
                    </TableCell>
                    <TableCell>{dealer._count.products}</TableCell>
                    <TableCell>{dealer._count.orders}</TableCell>
                    <TableCell>
                      <Link href={`/${locale}/sub-dealers/${dealer.id}`}>
                        <Button variant="ghost" size="sm">
                          {dict.common?.view || "Görüntüle"}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNum) => (
                  <Link
                    key={pageNum}
                    href={`/${locale}/sub-dealers?page=${pageNum}${
                      search ? `&search=${search}` : ""
                    }`}
                  >
                    <Button
                      variant={pageNum === currentPage ? "default" : "outline"}
                      size="sm"
                    >
                      {pageNum}
                    </Button>
                  </Link>
                )
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
