"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkSubDealerSlugExists } from "@/lib/data/sub-dealers";

const subDealerSchema = z.object({
  name: z.string().min(2, "İsim en az 2 karakter olmalı"),
  slug: z
    .string()
    .min(2, "Slug en az 2 karakter olmalı")
    .regex(
      /^[a-z0-9-]+$/,
      "Slug sadece küçük harf, rakam ve tire içerebilir"
    ),
  email: z.string().email("Geçerli bir email giriniz").optional().or(z.literal("")),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
  inheritParentProducts: z.boolean().default(true),
  canCreateOwnProducts: z.boolean().default(true),
  customDomain: z.string().optional(),
  subdomain: z.string().optional(),
});

export type SubDealerFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
};

export async function createSubDealerAction(
  _prevState: SubDealerFormState,
  formData: FormData
): Promise<SubDealerFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    logo: formData.get("logo") as string,
    inheritParentProducts: formData.get("inheritParentProducts") === "true",
    canCreateOwnProducts: formData.get("canCreateOwnProducts") === "true",
    customDomain: formData.get("customDomain") as string,
    subdomain: formData.get("subdomain") as string,
  };

  const validatedFields = subDealerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  // Check if slug exists
  const slugExists = await checkSubDealerSlugExists(validatedFields.data.slug);
  if (slugExists) {
    return {
      errors: { slug: ["Bu slug zaten kullanılıyor"] },
      messageKey: "slugExists",
      success: false,
    };
  }

  // Get parent dealer's hierarchy level
  const parentDealer = await prisma.dealer.findUnique({
    where: { id: session.user.dealerId },
    select: { hierarchyLevel: true },
  });

  try {
    await prisma.dealer.create({
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        email: validatedFields.data.email || null,
        phone: validatedFields.data.phone || null,
        address: validatedFields.data.address || null,
        logo: validatedFields.data.logo || null,
        parentDealerId: session.user.dealerId,
        hierarchyLevel: (parentDealer?.hierarchyLevel || 0) + 1,
        inheritParentProducts: validatedFields.data.inheritParentProducts,
        canCreateOwnProducts: validatedFields.data.canCreateOwnProducts,
        customDomain: validatedFields.data.customDomain || null,
        subdomain: validatedFields.data.subdomain || null,
        isActive: true,
        isPublicPageActive: true,
      },
    });

    revalidatePath("/sub-dealers");

    return {
      messageKey: "subDealerCreated",
      success: true,
    };
  } catch (error) {
    console.error("Create sub-dealer error:", error);
    return {
      messageKey: "createError",
      success: false,
    };
  }
}

export async function updateSubDealerAction(
  subDealerId: string,
  _prevState: SubDealerFormState,
  formData: FormData
): Promise<SubDealerFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify sub-dealer belongs to this dealer
  const existingSubDealer = await prisma.dealer.findFirst({
    where: {
      id: subDealerId,
      parentDealerId: session.user.dealerId,
    },
  });

  if (!existingSubDealer) {
    return { messageKey: "notFound", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    email: formData.get("email") as string,
    phone: formData.get("phone") as string,
    address: formData.get("address") as string,
    logo: formData.get("logo") as string,
    inheritParentProducts: formData.get("inheritParentProducts") === "true",
    canCreateOwnProducts: formData.get("canCreateOwnProducts") === "true",
    customDomain: formData.get("customDomain") as string,
    subdomain: formData.get("subdomain") as string,
  };

  const validatedFields = subDealerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  // Check if slug exists (excluding current)
  if (validatedFields.data.slug !== existingSubDealer.slug) {
    const slugExists = await checkSubDealerSlugExists(
      validatedFields.data.slug,
      subDealerId
    );
    if (slugExists) {
      return {
        errors: { slug: ["Bu slug zaten kullanılıyor"] },
        messageKey: "slugExists",
        success: false,
      };
    }
  }

  try {
    await prisma.dealer.update({
      where: { id: subDealerId },
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        email: validatedFields.data.email || null,
        phone: validatedFields.data.phone || null,
        address: validatedFields.data.address || null,
        logo: validatedFields.data.logo || null,
        inheritParentProducts: validatedFields.data.inheritParentProducts,
        canCreateOwnProducts: validatedFields.data.canCreateOwnProducts,
        customDomain: validatedFields.data.customDomain || null,
        subdomain: validatedFields.data.subdomain || null,
      },
    });

    revalidatePath("/sub-dealers");
    revalidatePath(`/sub-dealers/${subDealerId}`);

    return {
      messageKey: "subDealerUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update sub-dealer error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function deleteSubDealerAction(
  subDealerId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify sub-dealer belongs to this dealer
  const subDealer = await prisma.dealer.findFirst({
    where: {
      id: subDealerId,
      parentDealerId: session.user.dealerId,
    },
    include: {
      _count: {
        select: {
          subDealers: true,
          orders: true,
          users: true,
        },
      },
    },
  });

  if (!subDealer) {
    return { messageKey: "notFound", success: false };
  }

  // Check if has sub-dealers
  if (subDealer._count.subDealers > 0) {
    return { messageKey: "hasSubDealers", success: false };
  }

  // Check if has orders
  if (subDealer._count.orders > 0) {
    return { messageKey: "hasOrders", success: false };
  }

  try {
    await prisma.dealer.delete({
      where: { id: subDealerId },
    });

    revalidatePath("/sub-dealers");

    return {
      messageKey: "subDealerDeleted",
      success: true,
    };
  } catch (error) {
    console.error("Delete sub-dealer error:", error);
    return {
      messageKey: "deleteError",
      success: false,
    };
  }
}

export async function toggleSubDealerStatusAction(
  subDealerId: string,
  isActive: boolean
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify sub-dealer belongs to this dealer
  const subDealer = await prisma.dealer.findFirst({
    where: {
      id: subDealerId,
      parentDealerId: session.user.dealerId,
    },
  });

  if (!subDealer) {
    return { messageKey: "notFound", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: subDealerId },
      data: { isActive },
    });

    revalidatePath("/sub-dealers");

    return {
      messageKey: isActive ? "subDealerActivated" : "subDealerDeactivated",
      success: true,
    };
  } catch (error) {
    console.error("Toggle sub-dealer status error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function updateProductInheritanceAction(
  subDealerId: string,
  inheritParentProducts: boolean
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  // Verify sub-dealer belongs to this dealer
  const subDealer = await prisma.dealer.findFirst({
    where: {
      id: subDealerId,
      parentDealerId: session.user.dealerId,
    },
  });

  if (!subDealer) {
    return { messageKey: "notFound", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id: subDealerId },
      data: { inheritParentProducts },
    });

    revalidatePath("/sub-dealers");
    revalidatePath(`/sub-dealers/${subDealerId}`);

    return {
      messageKey: "inheritanceUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Update product inheritance error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}
