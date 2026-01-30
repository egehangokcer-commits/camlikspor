import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { getPublicDealer } from "@/lib/utils/get-public-dealer";
import { ProductDetailClient } from "./product-detail-client";

interface ProductPageProps {
  params: Promise<{ locale: string; productSlug: string }>;
}

export async function generateMetadata({ params }: ProductPageProps) {
  const { productSlug } = await params;
  const dealer = await getPublicDealer();

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
  const { locale: localeParam, productSlug } = await params;

  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  const dealer = await getPublicDealer();

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
    <ProductDetailClient
      product={product}
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
