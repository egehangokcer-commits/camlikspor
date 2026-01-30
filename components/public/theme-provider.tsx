"use client";

import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { ThemeSettings, LayoutSettings, ThemePreset } from "@/lib/types";

interface ThemeContextValue {
  theme: ThemeSettings;
  layout: LayoutSettings;
  customCss: string | null;
}

const defaultTheme: ThemeSettings = {
  primaryColor: "#3B82F6",
  secondaryColor: "#10B981",
  accentColor: "#F59E0B",
  backgroundColor: "#FFFFFF",
  textColor: "#1F2937",
  mutedColor: "#6B7280",
  headingFont: "Inter",
  bodyFont: "Inter",
};

const defaultLayout: LayoutSettings = {
  headerStyle: "default",
  footerStyle: "default",
  productGridCols: 3,
  showHeroSection: true,
  showFeatures: true,
  showGallery: true,
  showShopPreview: true,
  showContact: true,
};

const ThemeContext = createContext<ThemeContextValue>({
  theme: defaultTheme,
  layout: defaultLayout,
  customCss: null,
});

export function useTheme() {
  return useContext(ThemeContext);
}

interface ThemeProviderProps {
  children: ReactNode;
  preset?: ThemePreset | null;
  customSettings?: string | null;
  layoutSettings?: string | null;
  customCss?: string | null;
}

export function ThemeProvider({
  children,
  preset,
  customSettings,
  layoutSettings,
  customCss,
}: ThemeProviderProps) {
  const value = useMemo(() => {
    // Parse custom settings if available
    let parsedTheme: ThemeSettings = defaultTheme;
    let parsedLayout: LayoutSettings = defaultLayout;

    // First apply preset
    if (preset) {
      parsedTheme = {
        primaryColor: preset.primaryColor,
        secondaryColor: preset.secondaryColor,
        accentColor: preset.accentColor,
        backgroundColor: preset.backgroundColor,
        textColor: preset.textColor,
        mutedColor: preset.mutedColor,
        headingFont: preset.headingFont,
        bodyFont: preset.bodyFont,
      };
      parsedLayout = {
        headerStyle: preset.headerStyle as LayoutSettings["headerStyle"],
        footerStyle: preset.footerStyle as LayoutSettings["footerStyle"],
        productGridCols: preset.productGridCols as LayoutSettings["productGridCols"],
        showHeroSection: preset.showHeroSection,
        showFeatures: preset.showFeatures,
        showGallery: preset.showGallery,
        showShopPreview: preset.showShopPreview,
        showContact: preset.showContact,
      };
    }

    // Then override with custom settings
    if (customSettings) {
      try {
        const custom = JSON.parse(customSettings) as Partial<ThemeSettings>;
        parsedTheme = { ...parsedTheme, ...custom };
      } catch {
        // Ignore parse errors
      }
    }

    if (layoutSettings) {
      try {
        const layout = JSON.parse(layoutSettings) as Partial<LayoutSettings>;
        parsedLayout = { ...parsedLayout, ...layout };
      } catch {
        // Ignore parse errors
      }
    }

    return {
      theme: parsedTheme,
      layout: parsedLayout,
      customCss: customCss || null,
    };
  }, [preset, customSettings, layoutSettings, customCss]);

  // Generate CSS variables
  const cssVariables = useMemo(() => {
    return `
      :root {
        --theme-primary: ${value.theme.primaryColor};
        --theme-secondary: ${value.theme.secondaryColor};
        --theme-accent: ${value.theme.accentColor};
        --theme-background: ${value.theme.backgroundColor};
        --theme-text: ${value.theme.textColor};
        --theme-muted: ${value.theme.mutedColor};
        --theme-heading-font: ${value.theme.headingFont}, sans-serif;
        --theme-body-font: ${value.theme.bodyFont}, sans-serif;
        --theme-grid-cols: ${value.layout.productGridCols};
      }
    `.trim();
  }, [value.theme, value.layout.productGridCols]);

  return (
    <ThemeContext.Provider value={value}>
      <style dangerouslySetInnerHTML={{ __html: cssVariables }} />
      {value.customCss && (
        <style dangerouslySetInnerHTML={{ __html: value.customCss }} />
      )}
      {children}
    </ThemeContext.Provider>
  );
}

// Helper component to conditionally render sections
interface ConditionalSectionProps {
  section: keyof Pick<
    LayoutSettings,
    | "showHeroSection"
    | "showFeatures"
    | "showGallery"
    | "showShopPreview"
    | "showContact"
  >;
  children: ReactNode;
}

export function ConditionalSection({
  section,
  children,
}: ConditionalSectionProps) {
  const { layout } = useTheme();

  if (!layout[section]) {
    return null;
  }

  return <>{children}</>;
}
