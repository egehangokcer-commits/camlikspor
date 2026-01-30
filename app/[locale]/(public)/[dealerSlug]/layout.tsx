import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { CartProvider } from "@/lib/contexts/cart-context";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string; dealerSlug: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale: localeParam, dealerSlug } = await params;

  // Validate locale
  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  // Fetch dealer by slug
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
      logo: true,
      contactPhone: true,
      contactEmail: true,
      contactAddress: true,
      socialFacebook: true,
      socialInstagram: true,
      socialTwitter: true,
      socialYoutube: true,
    },
  });

  if (!dealer) {
    notFound();
  }

  const dictionary = await getDictionary(locale);
  const publicDict = dictionary.public || {
    shop: "Magaza",
    gallery: "Galeri",
    contact: "Iletisim",
    cart: "Sepet",
    allRightsReserved: "Tum haklari saklidir.",
    quickLinks: "Hizli Baglantilar",
    followUs: "Bizi Takip Edin",
  };

  return (
    <CartProvider>
      <div className="flex min-h-screen flex-col">
        <PublicHeader
          dealerSlug={dealer.slug}
          dealerName={dealer.name}
          dealerLogo={dealer.logo}
          locale={locale}
          dictionary={{
            shop: publicDict.shop || "Magaza",
            gallery: publicDict.gallery || "Galeri",
            contact: publicDict.contact || "Iletisim",
            cart: publicDict.cart || "Sepet",
          }}
        />
        <main className="flex-1">{children}</main>
        <PublicFooter
          dealerSlug={dealer.slug}
          dealerName={dealer.name}
          locale={locale}
          contactPhone={dealer.contactPhone}
          contactEmail={dealer.contactEmail}
          contactAddress={dealer.contactAddress}
          socialFacebook={dealer.socialFacebook}
          socialInstagram={dealer.socialInstagram}
          socialTwitter={dealer.socialTwitter}
          socialYoutube={dealer.socialYoutube}
          dictionary={{
            shop: publicDict.shop || "Magaza",
            gallery: publicDict.gallery || "Galeri",
            contact: publicDict.contact || "Iletisim",
            allRightsReserved: publicDict.allRightsReserved || "Tum haklari saklidir.",
            quickLinks: publicDict.quickLinks || "Hizli Baglantilar",
            followUs: publicDict.followUs || "Bizi Takip Edin",
          }}
        />
      </div>
    </CartProvider>
  );
}
