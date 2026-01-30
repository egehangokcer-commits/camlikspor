import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { ProductPageClient } from "./product-client";

interface ProductPageProps {
  params: Promise<{ locale: string; dealerSlug: string; productSlug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { dealerSlug, productSlug } = await params;

  const dealer = await prisma.dealer.findUnique({
    where: { slug: dealerSlug },
    select: { id: true, name: true },
  });

  if (!dealer) {
    return { title: "Urun Bulunamadi" };
  }

  const product = await prisma.product.findFirst({
    where: { slug: productSlug, dealerId: dealer.id },
    select: { name: true, description: true },
  });

  if (!product) {
    return { title: "Urun Bulunamadi" };
  }

  return {
    title: `${product.name} - ${dealer.name}`,
    description: product.description || product.name,
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { locale: localeParam, dealerSlug, productSlug } = await params;

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
    select: { id: true },
  });

  if (!dealer) {
    notFound();
  }

  // Fetch product
  const product = await prisma.product.findFirst({
    where: {
      slug: productSlug,
      dealerId: dealer.id,
      isActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      images: true,
      category: {
        select: { name: true, slug: true },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
        },
        orderBy: { size: "asc" },
      },
    },
  });

  if (!product) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const shopDict = dictionary.shop || {};

  return (
    <ProductPageClient
      product={product}
      dealerSlug={dealerSlug}
      locale={locale}
      dictionary={{
        addToCart: shopDict.addToCart || "Sepete Ekle",
        outOfStock: shopDict.outOfStock || "Stokta Yok",
        size: shopDict.size || "Beden",
        color: shopDict.color || "Renk",
        quantity: shopDict.quantity || "Adet",
        inStock: shopDict.inStock || "adet stokta",
        description: shopDict.description || "Aciklama",
        selectSize: shopDict.selectSize || "Beden Secin",
        addedToCart: shopDict.addedToCart || "Urun sepete eklendi",
        viewCart: shopDict.viewCart || "Sepeti Gor",
      }}
    />
  );
}
