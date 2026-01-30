"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const themeSettingsSchema = z.object({
  primaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  secondaryColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  accentColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  backgroundColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  textColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  mutedColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Geçersiz renk kodu"),
  headingFont: z.string().min(1, "Font seçimi gerekli"),
  bodyFont: z.string().min(1, "Font seçimi gerekli"),
});

const layoutSettingsSchema = z.object({
  headerStyle: z.enum(["default", "centered", "minimal"]).default("default"),
  footerStyle: z.enum(["default", "simple", "expanded"]).default("default"),
  productGridCols: z.number().min(2).max(4).default(3),
  showHeroSection: z.boolean().default(true),
  showFeatures: z.boolean().default(true),
  showGallery: z.boolean().default(true),
  showShopPreview: z.boolean().default(true),
  showContact: z.boolean().default(true),
});

const metaSettingsSchema = z.object({
  metaTitle: z.string().max(60).optional(),
  metaDescription: z.string().max(160).optional(),
  metaKeywords: z.string().max(255).optional(),
  faviconUrl: z.string().url().optional().or(z.literal("")),
});

export type CustomizationFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
};

export async function updateThemeSettingsAction(
  _prevState: CustomizationFormState,
  formData: FormData
): Promise<CustomizationFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    primaryColor: formData.get("primaryColor") as string,
    secondaryColor: formData.get("secondaryColor") as string,
    accentColor: formData.get("accentColor") as string,
    backgroundColor: formData.get("backgroundColor") as string,
    textColor: formData.get("textColor") as string,
    mutedColor: formData.get("mutedColor") as string,
    headingFont: formData.get("headingFont") as string,
    bodyFont: formData.get("bodyFont") as string,
  };

  const validatedFields = themeSettingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        themeSettings: JSON.stringify(validatedFields.data),
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "themeUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update theme error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function updateLayoutSettingsAction(
  _prevState: CustomizationFormState,
  formData: FormData
): Promise<CustomizationFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    headerStyle: formData.get("headerStyle") as string,
    footerStyle: formData.get("footerStyle") as string,
    productGridCols: parseInt(formData.get("productGridCols") as string) || 3,
    showHeroSection: formData.get("showHeroSection") === "true",
    showFeatures: formData.get("showFeatures") === "true",
    showGallery: formData.get("showGallery") === "true",
    showShopPreview: formData.get("showShopPreview") === "true",
    showContact: formData.get("showContact") === "true",
  };

  const validatedFields = layoutSettingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        layoutSettings: JSON.stringify(validatedFields.data),
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "layoutUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update layout error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function updateCustomCssAction(
  customCss: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Basic CSS validation - check for potentially dangerous content
  const dangerousPatterns = [
    /javascript:/i,
    /expression\s*\(/i,
    /url\s*\(\s*["']?data:/i,
    /@import/i,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(customCss)) {
      return { messageKey: "dangerousCss", success: false };
    }
  }

  // Check max size (50KB)
  if (customCss.length > 50000) {
    return { messageKey: "cssTooLarge", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: { customCss },
    });

    revalidatePath("/customization");

    return {
      messageKey: "cssUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update CSS error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function updateMetaSettingsAction(
  _prevState: CustomizationFormState,
  formData: FormData
): Promise<CustomizationFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    metaTitle: formData.get("metaTitle") as string,
    metaDescription: formData.get("metaDescription") as string,
    metaKeywords: formData.get("metaKeywords") as string,
    faviconUrl: formData.get("faviconUrl") as string,
  };

  const validatedFields = metaSettingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        metaTitle: validatedFields.data.metaTitle || null,
        metaDescription: validatedFields.data.metaDescription || null,
        metaKeywords: validatedFields.data.metaKeywords || null,
        faviconUrl: validatedFields.data.faviconUrl || null,
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "metaUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update meta error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function applyThemePresetAction(
  themePresetId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify theme preset exists
  const preset = await prisma.dealerTheme.findUnique({
    where: { id: themePresetId },
  });

  if (!preset) {
    return { messageKey: "presetNotFound", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        themePresetId,
        // Clear custom settings when applying preset
        themeSettings: null,
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "presetApplied",
      success: true,
    };
  } catch (error) {
    console.error("Apply preset error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function clearThemePresetAction(): Promise<{
  success: boolean;
  messageKey: string;
}> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        themePresetId: null,
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "presetCleared",
      success: true,
    };
  } catch (error) {
    console.error("Clear preset error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function resetToDefaultThemeAction(): Promise<{
  success: boolean;
  messageKey: string;
}> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: session.user.dealerId },
      data: {
        themePresetId: null,
        themeSettings: null,
        layoutSettings: null,
        customCss: null,
      },
    });

    revalidatePath("/customization");

    return {
      messageKey: "resetToDefault",
      success: true,
    };
  } catch (error) {
    console.error("Reset theme error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}
