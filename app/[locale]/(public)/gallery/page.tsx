import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getPublicDealer } from "@/lib/utils/get-public-dealer";
import { GalleryPageClient } from "./gallery-client";

interface GalleryPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata() {
  const dealer = await getPublicDealer();

  return {
    title: dealer ? `Galeri - ${dealer.name}` : "Galeri",
  };
}

export default async function GalleryPage({ params }: GalleryPageProps) {
  const { locale: localeParam } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  const dealer = await getPublicDealer();

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
