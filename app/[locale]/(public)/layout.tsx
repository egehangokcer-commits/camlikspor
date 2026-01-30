import { notFound } from "next/navigation";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import { i18n, type Locale } from "@/lib/i18n/config";
import { PublicHeader } from "@/components/public/public-header";
import { PublicFooter } from "@/components/public/public-footer";
import { CartProvider } from "@/lib/contexts/cart-context";
import { ThemeProvider } from "@/components/public/theme-provider";
import { getPublicDealer } from "@/lib/utils/get-public-dealer";

interface PublicLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function PublicLayout({
  children,
  params,
}: PublicLayoutProps) {
  const { locale: localeParam } = await params;

  // Validate locale
  const locale = i18n.locales.includes(localeParam as Locale)
    ? (localeParam as Locale)
    : i18n.defaultLocale;

  // Get dealer from domain or default
  const dealer = await getPublicDealer();

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
      <ThemeProvider
        customSettings={dealer.themeSettings}
        layoutSettings={dealer.layoutSettings}
        customCss={dealer.customCss}
      >
        <div className="flex min-h-screen flex-col">
          <PublicHeader
            dealerSlug=""
            dealerName={dealer.name}
            dealerLogo={dealer.logo}
            locale={locale}
            contactPhone={dealer.contactPhone}
            contactEmail={dealer.contactEmail}
            dictionary={{
              shop: publicDict.shop || "Magaza",
              gallery: publicDict.gallery || "Galeri",
              contact: publicDict.contact || "Iletisim",
              cart: publicDict.cart || "Sepet",
            }}
            useRootPaths
          />
          <main className="flex-1">{children}</main>
          <PublicFooter
            dealerSlug=""
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
            useRootPaths
          />
        </div>
      </ThemeProvider>
    </CartProvider>
  );
}
