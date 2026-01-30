import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { HeroSection } from "@/components/public/hero-section";
import { FeaturesSection } from "@/components/public/features-section";
import { GallerySection } from "@/components/public/gallery-section";
import { ContactSection } from "@/components/public/contact-section";
import { ShopPreview } from "@/components/public/shop-preview";

interface LandingPageProps {
  params: Promise<{ locale: string; dealerSlug: string }>;
}

export async function generateMetadata({ params }: LandingPageProps) {
  const { dealerSlug } = await params;

  const dealer = await prisma.dealer.findUnique({
    where: { slug: dealerSlug },
    select: { name: true, heroTitle: true, heroSubtitle: true },
  });

  if (!dealer) {
    return { title: "Sayfa Bulunamadi" };
  }

  return {
    title: dealer.heroTitle || dealer.name,
    description: dealer.heroSubtitle || `${dealer.name} - Profesyonel Futbol Okulu`,
  };
}

export default async function LandingPage({ params }: LandingPageProps) {
  const { locale: localeParam, dealerSlug } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  // Fetch dealer with all landing page data
  const dealer = await prisma.dealer.findUnique({
    where: {
      slug: dealerSlug,
      isActive: true,
      isPublicPageActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      heroImage: true,
      heroTitle: true,
      heroSubtitle: true,
      features: true,
      contactPhone: true,
      contactEmail: true,
      contactAddress: true,
    },
  });

  if (!dealer) {
    notFound();
  }

  // Fetch gallery images
  const galleryImages = await prisma.galleryImage.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
    take: 10,
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
    },
  });

  // Fetch featured products
  const products = await prisma.product.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { createdAt: "desc" },
    take: 4,
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

  const dictionary = await getDictionary(locale);
  const publicDict = dictionary.public || {};

  return (
    <>
      {/* Hero Section */}
      <HeroSection
        dealerSlug={dealer.slug}
        dealerName={dealer.name}
        heroImage={dealer.heroImage}
        heroTitle={dealer.heroTitle}
        heroSubtitle={dealer.heroSubtitle}
        locale={locale}
        dictionary={{
          shopCta: publicDict.hero?.shopCta || "Magazaya Git",
          contactCta: publicDict.hero?.contactCta || "Iletisim",
        }}
      />

      {/* Features Section */}
      <FeaturesSection
        features={dealer.features}
        dictionary={{
          title: publicDict.features?.title || "Neden Bizi Tercih Etmelisiniz?",
          subtitle:
            publicDict.features?.subtitle ||
            "Profesyonel egitim kadromuz ve modern tesislerimizle farki yasayin.",
        }}
      />

      {/* Shop Preview */}
      {products.length > 0 && (
        <ShopPreview
          products={products}
          dealerSlug={dealer.slug}
          locale={locale}
          dictionary={{
            title: publicDict.shopSection?.title || "Magaza",
            viewAll: publicDict.shopSection?.viewAll || "Tumunu Gor",
            currency: "TL",
          }}
        />
      )}

      {/* Gallery Section */}
      {galleryImages.length > 0 && (
        <GallerySection
          images={galleryImages}
          dealerSlug={dealer.slug}
          locale={locale}
          dictionary={{
            title: publicDict.gallerySection?.title || "Galeri",
            viewAll: publicDict.gallerySection?.viewAll || "Tum Fotograflar",
          }}
        />
      )}

      {/* Contact Section */}
      <ContactSection
        contactPhone={dealer.contactPhone}
        contactEmail={dealer.contactEmail}
        contactAddress={dealer.contactAddress}
        dictionary={{
          title: publicDict.contactSection?.title || "Iletisim",
          subtitle:
            publicDict.contactSection?.subtitle ||
            "Sorulariniz icin bizimle iletisime gecin.",
          phoneLabel: publicDict.contactSection?.phoneLabel || "Telefon",
          emailLabel: publicDict.contactSection?.emailLabel || "E-posta",
          addressLabel: publicDict.contactSection?.addressLabel || "Adres",
          hoursLabel: publicDict.contactSection?.hoursLabel || "Calisma Saatleri",
          hours: publicDict.contactSection?.hours || "Pazartesi - Cumartesi: 09:00 - 21:00",
        }}
      />
    </>
  );
}
