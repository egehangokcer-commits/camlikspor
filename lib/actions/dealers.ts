"use server";

import { z } from "zod";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { UserRole, Permission } from "@/lib/types";
import { turkishPhoneOptionalSchema } from "@/lib/utils/validation";
import bcrypt from "bcryptjs";
import { getDefaultPermissionsForRole } from "@/lib/utils/permissions";

type TransactionClient = Omit<typeof prisma, "$connect" | "$disconnect" | "$on" | "$transaction" | "$use" | "$extends">;

const dealerSchema = z.object({
  name: z.string().min(2, "Bayi adi en az 2 karakter olmali"),
  slug: z.string().min(2, "Slug en az 2 karakter olmali")
    .regex(/^[a-z0-9-]+$/, "Slug sadece kucuk harf, rakam ve tire icermelidir"),
  address: z.string().optional(),
  phone: turkishPhoneOptionalSchema,
  email: z.string().email().optional().or(z.literal("")),
  taxNumber: z.string().optional(),
  // Admin user fields (only for creation)
  adminName: z.string().min(2, "Admin adi en az 2 karakter olmali").optional(),
  adminEmail: z.string().email("Gecerli bir e-posta giriniz").optional(),
  adminPassword: z.string().min(6, "Sifre en az 6 karakter olmali").optional(),
});

export type DealerFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createDealerAction(
  _prevState: DealerFormState,
  formData: FormData
): Promise<DealerFormState> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    taxNumber: formData.get("taxNumber") as string,
    adminName: formData.get("adminName") as string,
    adminEmail: formData.get("adminEmail") as string,
    adminPassword: formData.get("adminPassword") as string,
  };

  // Validate admin fields are provided for new dealer
  if (!rawData.adminName || !rawData.adminEmail || !rawData.adminPassword) {
    return {
      errors: {
        adminName: !rawData.adminName ? ["Admin adi zorunludur"] : [],
        adminEmail: !rawData.adminEmail ? ["Admin e-posta zorunludur"] : [],
        adminPassword: !rawData.adminPassword ? ["Sifre zorunludur"] : [],
      },
      message: "Bayi admin bilgilerini girin",
      success: false,
    };
  }

  const validatedFields = dealerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  const existingDealer = await prisma.dealer.findUnique({
    where: { slug: validatedFields.data.slug },
  });

  if (existingDealer) {
    return {
      errors: { slug: ["Bu slug zaten kullaniliyor"] },
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  // Check if admin email is already in use
  const existingUser = await prisma.user.findUnique({
    where: { email: validatedFields.data.adminEmail },
  });

  if (existingUser) {
    return {
      errors: { adminEmail: ["Bu e-posta adresi zaten kullaniliyor"] },
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  try {
    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedFields.data.adminPassword!, 10);

    // Get default permissions for DEALER_ADMIN
    const defaultPermissions = getDefaultPermissionsForRole(UserRole.DEALER_ADMIN);

    // Create dealer and admin user in a transaction
    await prisma.$transaction(async (tx: TransactionClient) => {
      // Create dealer
      const dealer = await tx.dealer.create({
        data: {
          name: validatedFields.data.name,
          slug: validatedFields.data.slug,
          address: validatedFields.data.address || null,
          phone: validatedFields.data.phone || null,
          email: validatedFields.data.email || null,
          taxNumber: validatedFields.data.taxNumber || null,
        },
      });

      // Create admin user for the dealer
      await tx.user.create({
        data: {
          name: validatedFields.data.adminName!,
          email: validatedFields.data.adminEmail!,
          passwordHash: hashedPassword,
          role: UserRole.DEALER_ADMIN,
          dealerId: dealer.id,
          isActive: true,
          permissions: {
            create: defaultPermissions.map((p: Permission) => ({ permission: p })),
          },
        },
      });

      // Create default dealer settings
      await tx.dealerSettings.create({
        data: {
          dealerId: dealer.id,
        },
      });
    });

    revalidatePath("/[locale]/dealers");
    return { message: "Bayi ve admin kullanici basariyla olusturuldu", success: true };
  } catch (error) {
    console.error("Create dealer error:", error);
    const errorMessage = error instanceof Error ? error.message : "Bir hata olustu";
    return { message: errorMessage, success: false };
  }
}

export async function updateDealerAction(
  id: string,
  _prevState: DealerFormState,
  formData: FormData
): Promise<DealerFormState> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    slug: formData.get("slug") as string,
    address: formData.get("address") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    taxNumber: formData.get("taxNumber") as string,
  };

  const validatedFields = dealerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  const existingDealer = await prisma.dealer.findFirst({
    where: {
      slug: validatedFields.data.slug,
      NOT: { id },
    },
  });

  if (existingDealer) {
    return {
      errors: { slug: ["Bu slug zaten kullaniliyor"] },
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  try {
    await prisma.dealer.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        slug: validatedFields.data.slug,
        address: validatedFields.data.address || null,
        phone: validatedFields.data.phone || null,
        email: validatedFields.data.email || null,
        taxNumber: validatedFields.data.taxNumber || null,
      },
    });

    revalidatePath("/[locale]/dealers");
    revalidatePath(`/[locale]/dealers/${id}`);
    return { message: "Bayi basariyla guncellendi", success: true };
  } catch (error) {
    console.error("Update dealer error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export async function deleteDealerAction(id: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  try {
    await prisma.dealer.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    revalidatePath("/[locale]/dealers");
    return { message: "Bayi silindi", success: true };
  } catch (error) {
    console.error("Delete dealer error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

// Reset password for a dealer user
export async function resetDealerUserPasswordAction(
  userId: string,
  newPassword: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  if (!newPassword || newPassword.length < 6) {
    return { message: "Sifre en az 6 karakter olmali", success: false };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { message: "Kullanici bulunamadi", success: false };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: hashedPassword },
    });

    return { message: "Sifre basariyla guncellendi", success: true };
  } catch (error) {
    console.error("Reset password error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

// Get dealer users for password management
export async function getDealerUsersAction(dealerId: string) {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return [];
  }

  try {
    const users = await prisma.user.findMany({
      where: { dealerId, isActive: true },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
      orderBy: { name: "asc" },
    });

    return users;
  } catch (error) {
    console.error("Get dealer users error:", error);
    return [];
  }
}

// Create a new user for a dealer
export async function createDealerUserAction(
  dealerId: string,
  data: {
    name: string;
    email: string;
    password: string;
    role: "DEALER_ADMIN" | "TRAINER";
  }
): Promise<{ success: boolean; message: string }> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  if (!data.name || data.name.length < 2) {
    return { message: "Kullanici adi en az 2 karakter olmali", success: false };
  }

  if (!data.email || !data.email.includes("@")) {
    return { message: "Gecerli bir e-posta adresi giriniz", success: false };
  }

  if (!data.password || data.password.length < 6) {
    return { message: "Sifre en az 6 karakter olmali", success: false };
  }

  try {
    // Check if dealer exists
    const dealer = await prisma.dealer.findUnique({
      where: { id: dealerId },
    });

    if (!dealer) {
      return { message: "Bayi bulunamadi", success: false };
    }

    // Check if email is already in use
    const existingUser = await prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existingUser) {
      return { message: "Bu e-posta adresi zaten kullaniliyor", success: false };
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);
    const role = data.role === "TRAINER" ? UserRole.TRAINER : UserRole.DEALER_ADMIN;
    const defaultPermissions = getDefaultPermissionsForRole(role);

    await prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash: hashedPassword,
        role: role,
        dealerId: dealerId,
        isActive: true,
        permissions: {
          create: defaultPermissions.map((p: Permission) => ({ permission: p })),
        },
      },
    });

    revalidatePath(`/[locale]/dealers/${dealerId}`);
    revalidatePath(`/[locale]/dealers/${dealerId}/edit`);
    return { message: "Kullanici basariyla olusturuldu", success: true };
  } catch (error) {
    console.error("Create dealer user error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

// Delete/deactivate a dealer user
export async function deleteDealerUserAction(
  userId: string
): Promise<{ success: boolean; message: string }> {
  const session = await auth();

  if (session?.user?.role !== UserRole.SUPER_ADMIN) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return { message: "Kullanici bulunamadi", success: false };
    }

    await prisma.user.update({
      where: { id: userId },
      data: { isActive: false },
    });

    revalidatePath(`/[locale]/dealers/${user.dealerId}`);
    revalidatePath(`/[locale]/dealers/${user.dealerId}/edit`);
    return { message: "Kullanici silindi", success: true };
  } catch (error) {
    console.error("Delete dealer user error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}
