import { prisma } from "@/lib/prisma";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getPublicDealer } from "@/lib/utils/get-public-dealer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { CategoriesSwiper } from "@/components/public/categories-swiper";
import { ProductsSwiper } from "@/components/public/products-swiper";
import {
  ShoppingBag,
  Truck,
  Shield,
  CreditCard,
  Star,
  ArrowRight,
  Phone,
  Mail,
  MapPin,
  Sparkles,
  Send,
  Clock,
  Facebook,
  Instagram,
  Twitter,
  Youtube,
} from "lucide-react";

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  const dealer = await getPublicDealer();

  if (!dealer) {
    return { title: "Sayfa Bulunamadı" };
  }

  return {
    title: dealer.heroTitle || `${dealer.name} - Spor Malzemeleri`,
    description: dealer.heroSubtitle || `${dealer.name} - Kaliteli spor malzemeleri ve formalar`,
  };
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  const dealer = await getPublicDealer();

  if (!dealer) {
    notFound();
  }

  // Fetch featured products
  const products = await prisma.product.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: 8,
    select: {
      id: true,
      name: true,
      slug: true,
      price: true,
      images: true,
      category: {
        select: { name: true },
      },
    },
  });

  // Fetch categories
  const categories = await prisma.productCategory.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
    take: 6,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: { select: { products: true } },
    },
  });

  return (
    <div className="min-h-screen">
      {/* Hero Section - Full Width Gradient */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-blue-600/10 rounded-full blur-3xl" />
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:50px_50px]" />

        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-8">
              <Sparkles className="h-4 w-4 text-yellow-400" />
              <span className="text-white/90 text-sm font-medium">Yeni Sezon Koleksiyonu</span>
            </div>

            {/* Main Title */}
            <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
              {dealer.heroTitle || (
                <>
                  Profesyonel <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Spor Malzemeleri</span>
                </>
              )}
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {dealer.heroSubtitle || "En kaliteli formalar, spor ayakkabıları ve ekipmanlar. Takımınız için en iyisi burada!"}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href={`/${locale}/shop`}>
                <Button size="lg" className="text-lg px-8 py-6 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 shadow-lg shadow-blue-500/25 transition-all hover:shadow-xl hover:shadow-blue-500/30 hover:-translate-y-0.5">
                  <ShoppingBag className="mr-2 h-5 w-5" />
                  Alışverişe Başla
                </Button>
              </Link>
              <Link href={`/${locale}#categories`}>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/5 border-white/20 text-white hover:bg-white/10 backdrop-blur-sm">
                  Kategorileri Keşfet
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="mt-16 flex flex-wrap items-center justify-center gap-8 text-white/60">
              <div className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                <span className="text-sm">Ücretsiz Kargo</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                <span className="text-sm">Güvenli Ödeme</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                <span className="text-sm">Taksit İmkanı</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="h-5 w-5" />
                <span className="text-sm">Kalite Garantisi</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
            <path d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z" fill="white" className="dark:fill-slate-950"/>
          </svg>
        </div>
      </section>

      {/* Categories Section */}
      {categories.length > 0 && (
        <section id="categories" className="py-20 bg-white dark:bg-slate-950">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="text-center mb-12">
                <Badge className="mb-4 bg-blue-100 text-blue-700 hover:bg-blue-100">
                  Kategoriler
                </Badge>
                <h2 className="text-3xl md:text-4xl font-bold mb-4">Ürün Kategorileri</h2>
                <p className="text-muted-foreground text-lg">
                  Aradığınız ürünleri kolayca bulun
                </p>
              </div>

              <CategoriesSwiper categories={categories} locale={locale} />
            </div>
          </div>
        </section>
      )}

      {/* Featured Products Section */}
      {products.length > 0 && (
        <section className="py-20 bg-slate-50 dark:bg-slate-900">
          <div className="container mx-auto px-4">
            <div className="max-w-6xl mx-auto">
              <div className="flex items-center justify-between mb-12">
                <div>
                  <Badge className="mb-3 bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                    Öne Çıkanlar
                  </Badge>
                  <h2 className="text-3xl md:text-4xl font-bold mb-2">Popüler Ürünler</h2>
                  <p className="text-muted-foreground text-lg">En çok tercih edilen ürünlerimiz</p>
                </div>
                <Link href={`/${locale}/shop`}>
                  <Button variant="outline" className="hidden md:flex">
                    Tümünü Gör
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>

              <ProductsSwiper products={products} locale={locale} />

              <div className="mt-8 text-center md:hidden">
                <Link href={`/${locale}/shop`}>
                  <Button variant="outline">
                    Tümünü Gör
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Neden Bizi Tercih Etmelisiniz?</h2>
              <p className="text-muted-foreground text-lg">
                Müşteri memnuniyeti odaklı hizmet anlayışımızla fark yaratıyoruz
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-blue-50 to-white dark:from-blue-950 dark:to-slate-900">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-600 flex items-center justify-center">
                <Truck className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Hızlı Teslimat</h3>
              <p className="text-muted-foreground text-sm">
                Siparişleriniz 2-3 iş günü içinde kapınızda
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950 dark:to-slate-900">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-emerald-600 flex items-center justify-center">
                <Shield className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Güvenli Alışveriş</h3>
              <p className="text-muted-foreground text-sm">
                256-bit SSL sertifikası ile güvenli ödeme
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-amber-50 to-white dark:from-amber-950 dark:to-slate-900">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-amber-600 flex items-center justify-center">
                <Star className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kalite Garantisi</h3>
              <p className="text-muted-foreground text-sm">
                Orijinal ve kaliteli ürün garantisi
              </p>
            </Card>

            <Card className="text-center p-6 border-0 shadow-lg hover:shadow-xl transition-shadow bg-gradient-to-br from-purple-50 to-white dark:from-purple-950 dark:to-slate-900">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-purple-600 flex items-center justify-center">
                <CreditCard className="h-8 w-8 text-white" />
              </div>
              <h3 className="font-bold text-lg mb-2">Kolay Ödeme</h3>
              <p className="text-muted-foreground text-sm">
                Kredi kartına 12 aya varan taksit imkanı
              </p>
            </Card>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-blue-700">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Hemen Alışverişe Başlayın
            </h2>
            <p className="text-white/80 text-lg mb-8">
              En yeni ürünleri keşfedin, özel fırsatlardan yararlanın
            </p>
            <Link href={`/${locale}/shop`}>
              <Button size="lg" variant="secondary" className="text-lg px-8 py-6">
                <ShoppingBag className="mr-2 h-5 w-5" />
                Mağazaya Git
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-16 bg-slate-50 dark:bg-slate-900">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto text-center mb-10">
            <Badge className="mb-3 bg-blue-100 text-blue-700 hover:bg-blue-100">
              İletişim
            </Badge>
            <h2 className="text-3xl font-bold mb-3">Bize Ulaşın</h2>
            <p className="text-muted-foreground">
              Sorularınız için bizimle iletişime geçin
            </p>
          </div>

          {/* Contact Info Bar */}
          <div className="max-w-6xl mx-auto mb-10">
            <Card className="border-0 shadow-lg">
              <CardContent className="p-0">
                <div className="grid grid-cols-1 md:grid-cols-4 divide-y md:divide-y-0 md:divide-x">
                  {dealer.contactPhone && (
                    <a href={`tel:${dealer.contactPhone}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-blue-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Telefon</p>
                        <p className="font-medium text-sm truncate">{dealer.contactPhone}</p>
                      </div>
                    </a>
                  )}
                  {dealer.contactEmail && (
                    <a href={`mailto:${dealer.contactEmail}`} className="flex items-center gap-3 p-4 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                      <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-emerald-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">E-posta</p>
                        <p className="font-medium text-sm truncate">{dealer.contactEmail}</p>
                      </div>
                    </a>
                  )}
                  {dealer.contactAddress && (
                    <div className="flex items-center gap-3 p-4">
                      <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-900 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-amber-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs text-muted-foreground">Adres</p>
                        <p className="font-medium text-sm truncate">{dealer.contactAddress}</p>
                      </div>
                    </div>
                  )}
                  <div className="flex items-center gap-3 p-4">
                    <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900 flex items-center justify-center flex-shrink-0">
                      <Clock className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs text-muted-foreground">Çalışma Saatleri</p>
                      <p className="font-medium text-sm">Pzt-Cuma 09:00-18:00</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="max-w-6xl mx-auto">
            {/* Contact Form */}
            <Card className="border-0 shadow-xl">
              <CardContent className="p-8 md:p-12">
                <div className="flex items-center justify-between mb-8">
                  <h3 className="text-xl font-bold flex items-center gap-3">
                    <Send className="h-6 w-6 text-blue-600" />
                    Mesaj Gönderin
                  </h3>
                  {/* Social Links */}
                  {(dealer.socialFacebook || dealer.socialInstagram || dealer.socialTwitter || dealer.socialYoutube) && (
                    <div className="flex gap-3">
                      {dealer.socialFacebook && (
                        <a href={dealer.socialFacebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-colors">
                          <Facebook className="h-5 w-5" />
                        </a>
                      )}
                      {dealer.socialInstagram && (
                        <a href={dealer.socialInstagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-pink-600 hover:text-white transition-colors">
                          <Instagram className="h-5 w-5" />
                        </a>
                      )}
                      {dealer.socialTwitter && (
                        <a href={dealer.socialTwitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-sky-500 hover:text-white transition-colors">
                          <Twitter className="h-5 w-5" />
                        </a>
                      )}
                      {dealer.socialYoutube && (
                        <a href={dealer.socialYoutube} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center hover:bg-red-600 hover:text-white transition-colors">
                          <Youtube className="h-5 w-5" />
                        </a>
                      )}
                    </div>
                  )}
                </div>
                <form className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <Input
                      placeholder="Adınız Soyadınız *"
                      className="bg-slate-50 dark:bg-slate-800 border-0 h-12"
                      required
                    />
                    <Input
                      type="tel"
                      placeholder="Telefon *"
                      className="bg-slate-50 dark:bg-slate-800 border-0 h-12"
                      required
                    />
                    <Input
                      type="email"
                      placeholder="E-posta *"
                      className="bg-slate-50 dark:bg-slate-800 border-0 h-12"
                      required
                    />
                  </div>
                  <Input
                    placeholder="Konu"
                    className="bg-slate-50 dark:bg-slate-800 border-0 h-12"
                  />
                  <Textarea
                    placeholder="Mesajınız *"
                    rows={5}
                    className="bg-slate-50 dark:bg-slate-800 border-0 resize-none"
                    required
                  />
                  <Button type="submit" size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-12">
                    <Send className="mr-2 h-5 w-5" />
                    Mesajı Gönder
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
