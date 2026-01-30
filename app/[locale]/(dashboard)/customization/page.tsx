import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getDealerTheme, getDefaultThemeSettings, getDefaultLayoutSettings } from "@/lib/data/themes";
import { getDictionary } from "@/lib/i18n/get-dictionary";
import type { Locale } from "@/lib/i18n/config";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Palette, Layout, Code, Globe, ExternalLink } from "lucide-react";

interface Props {
  params: Promise<{ locale: Locale }>;
}

export default async function CustomizationPage({ params }: Props) {
  const { locale } = await params;

  const session = await auth();
  if (!session?.user?.dealerId) {
    redirect(`/${locale}/login`);
  }

  const dict = await getDictionary(locale);
  const { preset, customSettings, layoutSettings, customCss } =
    await getDealerTheme(session.user.dealerId);

  const currentTheme = customSettings || getDefaultThemeSettings();
  const currentLayout = layoutSettings || getDefaultLayoutSettings();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {dict.customization?.title || "Özelleştirme"}
          </h1>
          <p className="text-muted-foreground">
            {dict.customization?.description ||
              "Mağazanızın görünümünü özelleştirin"}
          </p>
        </div>
        {session.user.dealerSlug && (
          <Link
            href={`/${locale}/${session.user.dealerSlug}`}
            target="_blank"
          >
            <Button variant="outline">
              <ExternalLink className="mr-2 h-4 w-4" />
              {dict.customization?.previewSite || "Siteyi Önizle"}
            </Button>
          </Link>
        )}
      </div>

      {/* Current Theme Preview */}
      <Card>
        <CardHeader>
          <CardTitle>
            {dict.customization?.currentTheme || "Mevcut Tema"}
          </CardTitle>
          <CardDescription>
            {preset
              ? `${dict.customization?.usingPreset || "Preset"}: ${preset.name}`
              : dict.customization?.usingCustom || "Özel tema kullanılıyor"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: currentTheme.primaryColor }}
                title="Primary"
              />
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: currentTheme.secondaryColor }}
                title="Secondary"
              />
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: currentTheme.accentColor }}
                title="Accent"
              />
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: currentTheme.backgroundColor }}
                title="Background"
              />
              <div
                className="w-8 h-8 rounded-full border"
                style={{ backgroundColor: currentTheme.textColor }}
                title="Text"
              />
            </div>
            <div className="text-sm text-muted-foreground">
              Font: {currentTheme.headingFont} / {currentTheme.bodyFont}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Customization Options */}
      <div className="grid gap-4 md:grid-cols-2">
        <Link href={`/${locale}/customization/theme`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Palette className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {dict.customization?.theme || "Tema"}
                </CardTitle>
              </div>
              <CardDescription>
                {dict.customization?.themeDescription ||
                  "Renkleri, fontları ve tema presetlerini düzenleyin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                {[
                  currentTheme.primaryColor,
                  currentTheme.secondaryColor,
                  currentTheme.accentColor,
                ].map((color, i) => (
                  <div
                    key={i}
                    className="w-6 h-6 rounded border"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/customization/layout`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Layout className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {dict.customization?.layout || "Layout"}
                </CardTitle>
              </div>
              <CardDescription>
                {dict.customization?.layoutDescription ||
                  "Sayfa düzenini ve bileşen görünürlüğünü ayarlayın"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                Header: {currentLayout.headerStyle} | Grid:{" "}
                {currentLayout.productGridCols} {dict.common?.columns || "sütun"}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/customization/css`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Code className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {dict.customization?.customCss || "Özel CSS"}
                </CardTitle>
              </div>
              <CardDescription>
                {dict.customization?.cssDescription ||
                  "Gelişmiş özelleştirme için kendi CSS kodunuzu ekleyin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {customCss
                  ? `${customCss.length} ${dict.common?.characters || "karakter"}`
                  : dict.customization?.noCss || "CSS eklenmemiş"}
              </div>
            </CardContent>
          </Card>
        </Link>

        <Link href={`/${locale}/customization/domain`}>
          <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
            <CardHeader>
              <div className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">
                  {dict.customization?.domain || "Domain"}
                </CardTitle>
              </div>
              <CardDescription>
                {dict.customization?.domainDescription ||
                  "Özel domain ve subdomain ayarlarınızı yönetin"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-muted-foreground">
                {dict.customization?.manageDomains || "Domainleri yönet"}
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
