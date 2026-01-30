import { prisma } from "@/lib/prisma";
import type { ThemePreset, ThemeSettings, LayoutSettings } from "@/lib/types";

export async function getThemePresets(): Promise<ThemePreset[]> {
  const presets = await prisma.dealerTheme.findMany({
    orderBy: [{ isSystem: "desc" }, { name: "asc" }],
  });

  return presets;
}

export async function getSystemThemePresets(): Promise<ThemePreset[]> {
  const presets = await prisma.dealerTheme.findMany({
    where: { isSystem: true },
    orderBy: { name: "asc" },
  });

  return presets;
}

export async function getThemePresetById(
  themeId: string
): Promise<ThemePreset | null> {
  const preset = await prisma.dealerTheme.findUnique({
    where: { id: themeId },
  });

  return preset;
}

export async function getDealerTheme(dealerId: string): Promise<{
  preset: ThemePreset | null;
  customSettings: ThemeSettings | null;
  layoutSettings: LayoutSettings | null;
  customCss: string | null;
}> {
  const dealer = await prisma.dealer.findUnique({
    where: { id: dealerId },
    select: {
      themePresetId: true,
      themeSettings: true,
      layoutSettings: true,
      customCss: true,
      themePreset: true,
    },
  });

  if (!dealer) {
    return {
      preset: null,
      customSettings: null,
      layoutSettings: null,
      customCss: null,
    };
  }

  let customSettings: ThemeSettings | null = null;
  let layoutSettings: LayoutSettings | null = null;

  if (dealer.themeSettings) {
    try {
      customSettings = JSON.parse(dealer.themeSettings) as ThemeSettings;
    } catch {
      customSettings = null;
    }
  }

  if (dealer.layoutSettings) {
    try {
      layoutSettings = JSON.parse(dealer.layoutSettings) as LayoutSettings;
    } catch {
      layoutSettings = null;
    }
  }

  return {
    preset: dealer.themePreset,
    customSettings,
    layoutSettings,
    customCss: dealer.customCss,
  };
}

export function generateThemeCss(
  preset: ThemePreset | null,
  customSettings: ThemeSettings | null
): string {
  const theme = customSettings || preset;

  if (!theme) {
    return "";
  }

  return `
:root {
  --theme-primary: ${theme.primaryColor};
  --theme-secondary: ${theme.secondaryColor};
  --theme-accent: ${theme.accentColor};
  --theme-background: ${theme.backgroundColor};
  --theme-text: ${theme.textColor};
  --theme-muted: ${"mutedColor" in theme ? theme.mutedColor : "#6B7280"};
  --theme-heading-font: ${theme.headingFont}, sans-serif;
  --theme-body-font: ${theme.bodyFont}, sans-serif;
}

body {
  font-family: var(--theme-body-font);
  color: var(--theme-text);
  background-color: var(--theme-background);
}

h1, h2, h3, h4, h5, h6 {
  font-family: var(--theme-heading-font);
}

.btn-primary {
  background-color: var(--theme-primary);
}

.btn-secondary {
  background-color: var(--theme-secondary);
}

.text-primary {
  color: var(--theme-primary);
}

.text-secondary {
  color: var(--theme-secondary);
}

.text-accent {
  color: var(--theme-accent);
}

.bg-primary {
  background-color: var(--theme-primary);
}

.bg-secondary {
  background-color: var(--theme-secondary);
}

.border-primary {
  border-color: var(--theme-primary);
}
`.trim();
}

export function getDefaultThemeSettings(): ThemeSettings {
  return {
    primaryColor: "#3B82F6",
    secondaryColor: "#10B981",
    accentColor: "#F59E0B",
    backgroundColor: "#FFFFFF",
    textColor: "#1F2937",
    mutedColor: "#6B7280",
    headingFont: "Inter",
    bodyFont: "Inter",
  };
}

export function getDefaultLayoutSettings(): LayoutSettings {
  return {
    headerStyle: "default" as const,
    footerStyle: "default" as const,
    productGridCols: 3 as const,
    showHeroSection: true,
    showFeatures: true,
    showGallery: true,
    showShopPreview: true,
    showContact: true,
  };
}

export async function getAvailableFonts(): Promise<
  { name: string; family: string }[]
> {
  return [
    { name: "Inter", family: "Inter" },
    { name: "Roboto", family: "Roboto" },
    { name: "Open Sans", family: "Open Sans" },
    { name: "Lato", family: "Lato" },
    { name: "Montserrat", family: "Montserrat" },
    { name: "Poppins", family: "Poppins" },
    { name: "Nunito", family: "Nunito" },
    { name: "Raleway", family: "Raleway" },
    { name: "Ubuntu", family: "Ubuntu" },
    { name: "Playfair Display", family: "Playfair Display" },
  ];
}

export async function createThemePreset(
  data: Omit<ThemePreset, "id" | "createdAt" | "updatedAt">
): Promise<ThemePreset> {
  const preset = await prisma.dealerTheme.create({
    data,
  });

  return preset;
}

export async function updateThemePreset(
  themeId: string,
  data: Partial<Omit<ThemePreset, "id" | "createdAt" | "updatedAt" | "isSystem">>
): Promise<ThemePreset> {
  const preset = await prisma.dealerTheme.update({
    where: { id: themeId },
    data,
  });

  return preset;
}

export async function deleteThemePreset(themeId: string): Promise<void> {
  const preset = await prisma.dealerTheme.findUnique({
    where: { id: themeId },
  });

  if (preset?.isSystem) {
    throw new Error("System theme presets cannot be deleted");
  }

  await prisma.dealerTheme.delete({
    where: { id: themeId },
  });
}
