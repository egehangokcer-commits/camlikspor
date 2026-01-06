import { i18n, type Locale } from "@/lib/i18n/config";

export async function generateStaticParams() {
  return i18n.locales.map((locale: Locale) => ({ locale }));
}

interface LocaleLayoutProps {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}

export default async function LocaleLayout({
  children,
  params,
}: LocaleLayoutProps) {
  const { locale: localeParam } = await params;
  const locale = i18n.locales.includes(localeParam as Locale)
    ? localeParam
    : i18n.defaultLocale;

  return (
    <div lang={locale} dir="ltr">
      {children}
    </div>
  );
}
