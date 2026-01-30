import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { i18n, type Locale } from "@/lib/i18n/config";
import { GalleryPageClient } from "./gallery-client";

interface GalleryPageProps {
  params: Promise<{ locale: string; dealerSlug: string }>;
}

export async function generateMetadata({ params }: GalleryPageProps) {
  const { dealerSlug } = await params;

  const dealer = await prisma.dealer.findUnique({
    where: { slug: dealerSlug },
    select: { name: true },
  });

  return {
    title: dealer ? `Galeri - ${dealer.name}` : "Galeri",
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale: localeParam, dealerSlug } = await params;

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

  // Fetch gallery images
  const images = await prisma.galleryImage.findMany({
    where: {
      dealerId: dealer.id,
      isActive: true,
    },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      url: true,
      title: true,
      description: true,
    },
  });

  return <GalleryPageClient images={images} dealerName={dealer.name} />;
}
