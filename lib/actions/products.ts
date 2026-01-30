"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

// Product Category Schema
const categorySchema = z.object({
  name: z.string().min(2, "Kategori adi en az 2 karakter olmali"),
  slug: z.string().min(2, "Slug en az 2 karakter olmali"),
});

// Product Schema
const productSchema = z.object({
  name: z.string().min(2, "Urun adi en az 2 karakter olmali"),
  slug: z.string().min(2, "Slug en az 2 karakter olmali"),
  description: z.string().optional(),
  price: z.number().min(0, "Fiyat 0 veya daha buyuk olmali"),
  categoryId: z.string().min(1, "Kategori secimi gerekli"),
  isActive: z.boolean().default(true),
  images: z.string().optional(), // JSON string
});

// Variant Schema
const variantSchema = z.object({
  size: z.string().min(1, "Beden gerekli"),
  color: z.string().optional(),
  stock: z.number().min(0, "Stok 0 veya daha buyuk olmali"),
  sku: z.string().optional(),
});

export type ProductFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
  productId?: string;
};

export type CategoryFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  success?: boolean;
  categoryId?: string;
};

// ============ CATEGORY ACTIONS ============

export async function createCategoryAction(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
  };

  const validatedFields = categorySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gecersiz form verisi",
      success: false,
    };
  }

  try {
    // Check if slug already exists
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        slug: validatedFields.data.slug,
        dealerId: session.user.dealerId,
      },
    });

    if (existingCategory) {
      return {
        errors: { slug: ["Bu slug zaten kullaniliyor"] },
        success: false,
      };
    }

    const category = await prisma.productCategory.create({
      data: {
        ...validatedFields.data,
        dealerId: session.user.dealerId,
      },
    });

    revalidatePath("/[locale]/products");
    revalidatePath("/[locale]/products/categories");

    return { success: true, categoryId: category.id };
  } catch (error) {
    console.error("Category creation error:", error);
    return { message: "Kategori olusturulamadi", success: false };
  }
}

export async function updateCategoryAction(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
  };

  const validatedFields = categorySchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gecersiz form verisi",
      success: false,
    };
  }

  try {
    // Check if slug already exists for another category
    const existingCategory = await prisma.productCategory.findFirst({
      where: {
        slug: validatedFields.data.slug,
        dealerId: session.user.dealerId,
        NOT: { id: categoryId },
      },
    });

    if (existingCategory) {
      return {
        errors: { slug: ["Bu slug zaten kullaniliyor"] },
        success: false,
      };
    }

    await prisma.productCategory.update({
      where: { id: categoryId },
      data: validatedFields.data,
    });

    revalidatePath("/[locale]/products");
    revalidatePath("/[locale]/products/categories");

    return { success: true, categoryId };
  } catch (error) {
    console.error("Category update error:", error);
    return { message: "Kategori guncellenemedi", success: false };
  }
}

export async function deleteCategoryAction(
  categoryId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false, message: "Yetkilendirme hatasi" };
  }

  try {
    // Check if category has products
    const productCount = await prisma.product.count({
      where: { categoryId },
    });

    if (productCount > 0) {
      return {
        success: false,
        message: "Bu kategoride urunler var, once urunleri silin veya baska kategoriye tasiyin",
      };
    }

    await prisma.productCategory.delete({
      where: { id: categoryId },
    });

    revalidatePath("/[locale]/products");
    revalidatePath("/[locale]/products/categories");

    return { success: true };
  } catch (error) {
    console.error("Category delete error:", error);
    return { success: false, message: "Kategori silinemedi" };
  }
}

// ============ PRODUCT ACTIONS ============

export async function createProductAction(
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string) || 0,
    categoryId: formData.get("categoryId") as string,
    isActive: formData.get("isActive") === "true",
    images: formData.get("images") as string,
  };

  const validatedFields = productSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gecersiz form verisi",
      success: false,
    };
  }

  try {
    // Check if slug already exists
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: validatedFields.data.slug,
        dealerId: session.user.dealerId,
      },
    });

    if (existingProduct) {
      return {
        errors: { slug: ["Bu slug zaten kullaniliyor"] },
        success: false,
      };
    }

    const product = await prisma.product.create({
      data: {
        ...validatedFields.data,
        dealerId: session.user.dealerId,
      },
    });

    // Parse and create variants if provided
    const variantsJson = formData.get("variants") as string;
    if (variantsJson) {
      try {
        const variants = JSON.parse(variantsJson);
        if (Array.isArray(variants) && variants.length > 0) {
          await prisma.productVariant.createMany({
            data: variants.map((v: { size: string; color?: string; stock: number; sku?: string }) => ({
              productId: product.id,
              size: v.size,
              color: v.color || null,
              stock: v.stock || 0,
              sku: v.sku || null,
            })),
          });
        }
      } catch (e) {
        console.error("Variant parse error:", e);
      }
    }

    revalidatePath("/[locale]/products");

    return { success: true, productId: product.id };
  } catch (error) {
    console.error("Product creation error:", error);
    return { message: "Urun olusturulamadi", success: false };
  }
}

export async function updateProductAction(
  productId: string,
  _prevState: ProductFormState,
  formData: FormData
): Promise<ProductFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    description: formData.get("description") as string,
    price: parseFloat(formData.get("price") as string) || 0,
    categoryId: formData.get("categoryId") as string,
    isActive: formData.get("isActive") === "true",
    images: formData.get("images") as string,
  };

  const validatedFields = productSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Gecersiz form verisi",
      success: false,
    };
  }

  try {
    // Check if slug already exists for another product
    const existingProduct = await prisma.product.findFirst({
      where: {
        slug: validatedFields.data.slug,
        dealerId: session.user.dealerId,
        NOT: { id: productId },
      },
    });

    if (existingProduct) {
      return {
        errors: { slug: ["Bu slug zaten kullaniliyor"] },
        success: false,
      };
    }

    await prisma.product.update({
      where: { id: productId },
      data: validatedFields.data,
    });

    // Handle variants update
    const variantsJson = formData.get("variants") as string;
    if (variantsJson) {
      try {
        const variants = JSON.parse(variantsJson);
        if (Array.isArray(variants)) {
          // Delete existing variants and recreate
          await prisma.productVariant.deleteMany({
            where: { productId },
          });

          if (variants.length > 0) {
            await prisma.productVariant.createMany({
              data: variants.map((v: { size: string; color?: string; stock: number; sku?: string }) => ({
                productId,
                size: v.size,
                color: v.color || null,
                stock: v.stock || 0,
                sku: v.sku || null,
              })),
            });
          }
        }
      } catch (e) {
        console.error("Variant parse error:", e);
      }
    }

    revalidatePath("/[locale]/products");
    revalidatePath(`/[locale]/products/${productId}`);

    return { success: true, productId };
  } catch (error) {
    console.error("Product update error:", error);
    return { message: "Urun guncellenemedi", success: false };
  }
}

export async function deleteProductAction(
  productId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false, message: "Yetkilendirme hatasi" };
  }

  try {
    // Check if product has orders
    const orderItemCount = await prisma.shopOrderItem.count({
      where: { productId },
    });

    if (orderItemCount > 0) {
      return {
        success: false,
        message: "Bu urunun siparisleri var, silinemez",
      };
    }

    // Delete variants first
    await prisma.productVariant.deleteMany({
      where: { productId },
    });

    // Delete product
    await prisma.product.delete({
      where: { id: productId },
    });

    revalidatePath("/[locale]/products");

    return { success: true };
  } catch (error) {
    console.error("Product delete error:", error);
    return { success: false, message: "Urun silinemedi" };
  }
}

export async function updateProductStatusAction(
  productId: string,
  isActive: boolean
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false, message: "Yetkilendirme hatasi" };
  }

  try {
    await prisma.product.update({
      where: { id: productId },
      data: { isActive },
    });

    revalidatePath("/[locale]/products");

    return { success: true };
  } catch (error) {
    console.error("Product status update error:", error);
    return { success: false, message: "Durum guncellenemedi" };
  }
}

// ============ ORDER ACTIONS ============

export async function updateOrderStatusAction(
  orderId: string,
  status: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false, message: "Yetkilendirme hatasi" };
  }

  try {
    await prisma.shopOrder.update({
      where: { id: orderId },
      data: { status },
    });

    revalidatePath("/[locale]/orders");

    return { success: true };
  } catch (error) {
    console.error("Order status update error:", error);
    return { success: false, message: "Siparis durumu guncellenemedi" };
  }
}

export async function deleteOrderAction(
  orderId: string
): Promise<{ success: boolean; message?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false, message: "Yetkilendirme hatasi" };
  }

  try {
    // Get order items to restore stock
    const orderItems = await prisma.shopOrderItem.findMany({
      where: { orderId },
      include: { variant: true },
    });

    // Restore stock for each item
    for (const item of orderItems) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: { stock: { increment: item.quantity } },
        });
      }
    }

    // Delete order items first
    await prisma.shopOrderItem.deleteMany({
      where: { orderId },
    });

    // Delete order
    await prisma.shopOrder.delete({
      where: { id: orderId },
    });

    revalidatePath("/[locale]/orders");

    return { success: true };
  } catch (error) {
    console.error("Order delete error:", error);
    return { success: false, message: "Siparis silinemedi" };
  }
}
