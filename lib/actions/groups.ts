"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const groupSchema = z.object({
  name: z.string().min(2, "Grup adi en az 2 karakter olmali"),
  description: z.string().optional(),
  branchId: z.string().min(1, "Brans secimi gerekli"),
  facilityId: z.string().min(1, "Tesis secimi gerekli"),
  periodId: z.string().min(1, "Donem secimi gerekli"),
  maxCapacity: z.number().min(1).default(20),
});

export type GroupFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  success?: boolean;
};

export async function createGroupAction(
  _prevState: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    branchId: formData.get("branchId") as string,
    facilityId: formData.get("facilityId") as string,
    periodId: formData.get("periodId") as string,
    maxCapacity: parseInt(formData.get("maxCapacity") as string) || 20,
  };

  const validatedFields = groupSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  try {
    await prisma.group.create({
      data: {
        dealerId: session.user.dealerId,
        name: validatedFields.data.name,
        description: validatedFields.data.description || null,
        branchId: validatedFields.data.branchId,
        facilityId: validatedFields.data.facilityId,
        periodId: validatedFields.data.periodId,
        maxCapacity: validatedFields.data.maxCapacity,
      },
    });

    revalidatePath("/[locale]/groups");
    return { message: "Grup basariyla eklendi", success: true };
  } catch (error) {
    console.error("Create group error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export async function updateGroupAction(
  id: string,
  _prevState: GroupFormState,
  formData: FormData
): Promise<GroupFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  const rawData = {
    name: formData.get("name") as string,
    description: formData.get("description") as string,
    branchId: formData.get("branchId") as string,
    facilityId: formData.get("facilityId") as string,
    periodId: formData.get("periodId") as string,
    maxCapacity: parseInt(formData.get("maxCapacity") as string) || 20,
  };

  const validatedFields = groupSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      message: "Lutfen formu kontrol edin",
      success: false,
    };
  }

  try {
    await prisma.group.update({
      where: { id },
      data: {
        name: validatedFields.data.name,
        description: validatedFields.data.description || null,
        branchId: validatedFields.data.branchId,
        facilityId: validatedFields.data.facilityId,
        periodId: validatedFields.data.periodId,
        maxCapacity: validatedFields.data.maxCapacity,
      },
    });

    revalidatePath("/[locale]/groups");
    revalidatePath(`/[locale]/groups/${id}`);
    return { message: "Grup basariyla guncellendi", success: true };
  } catch (error) {
    console.error("Update group error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export async function deleteGroupAction(id: string): Promise<{ success: boolean; message: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  try {
    // Check if group has active students
    const studentCount = await prisma.studentGroup.count({
      where: { groupId: id, isActive: true },
    });

    if (studentCount > 0) {
      return {
        message: `Bu grupta ${studentCount} aktif ogrenci var. Once ogrencileri baska gruplara aktarin.`,
        success: false,
      };
    }

    await prisma.group.update({
      where: { id },
      data: { isActive: false },
    });

    revalidatePath("/[locale]/groups");
    return { message: "Grup silindi", success: true };
  } catch (error) {
    console.error("Delete group error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export async function copyGroupAction(
  groupId: string
): Promise<{ success: boolean; message: string; newGroupId?: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  try {
    const originalGroup = await prisma.group.findUnique({
      where: { id: groupId },
      include: {
        schedules: true,
        trainers: true,
      },
    });

    if (!originalGroup) {
      return { message: "Grup bulunamadi", success: false };
    }

    type Schedule = (typeof originalGroup.schedules)[number];
    type TrainerGroup = (typeof originalGroup.trainers)[number];

    // Create new group with copied data
    const newGroup = await prisma.group.create({
      data: {
        dealerId: originalGroup.dealerId,
        name: `${originalGroup.name} (Kopya)`,
        branchId: originalGroup.branchId,
        facilityId: originalGroup.facilityId,
        periodId: originalGroup.periodId,
        description: originalGroup.description,
        maxCapacity: originalGroup.maxCapacity,
        schedules: {
          create: originalGroup.schedules.map((s: Schedule) => ({
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
          })),
        },
        trainers: {
          create: originalGroup.trainers.map((t: TrainerGroup) => ({
            trainerId: t.trainerId,
            isPrimary: t.isPrimary,
          })),
        },
      },
    });

    revalidatePath("/[locale]/groups");
    return {
      message: "Grup basariyla kopyalandi",
      success: true,
      newGroupId: newGroup.id,
    };
  } catch (error) {
    console.error("Copy group error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}
