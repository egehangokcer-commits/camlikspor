"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import {
  turkishPhoneSchema,
  tcKimlikOptionalSchema,
} from "@/lib/utils/validation";

const trainerSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmali"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmali"),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  tcKimlikNo: tcKimlikOptionalSchema,
  phone: turkishPhoneSchema,
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  taskDefinitionId: z.string().optional(),
  salary: z.number().min(0).default(0),
  salaryType: z.string().optional(),
  bankName: z.string().optional(),
  bankAccount: z.string().optional(),
  notes: z.string().optional(),
  branchIds: z.array(z.string()).optional(),
});

export type TrainerFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
};

export async function createTrainerAction(
  _prevState: TrainerFormState,
  formData: FormData
): Promise<TrainerFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const branchIds = formData.getAll("branchIds") as string[];

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    gender: formData.get("gender") as string,
    tcKimlikNo: formData.get("tcKimlikNo") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    taskDefinitionId: formData.get("taskDefinitionId") as string,
    salary: parseFloat(formData.get("salary") as string) || 0,
    salaryType: formData.get("salaryType") as string,
    bankName: formData.get("bankName") as string,
    bankAccount: formData.get("bankAccount") as string,
    notes: formData.get("notes") as string,
    branchIds,
  };

  const validatedFields = trainerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    const trainer = await prisma.trainer.create({
      data: {
        dealerId: session.user.dealerId,
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        birthDate: validatedFields.data.birthDate
          ? new Date(validatedFields.data.birthDate)
          : null,
        gender: validatedFields.data.gender || null,
        tcKimlikNo: validatedFields.data.tcKimlikNo || null,
        phone: validatedFields.data.phone,
        email: validatedFields.data.email || null,
        address: validatedFields.data.address || null,
        taskDefinitionId: validatedFields.data.taskDefinitionId && validatedFields.data.taskDefinitionId !== "none" ? validatedFields.data.taskDefinitionId : null,
        salary: validatedFields.data.salary,
        salaryType: validatedFields.data.salaryType || null,
        bankName: validatedFields.data.bankName || null,
        bankAccount: validatedFields.data.bankAccount || null,
        notes: validatedFields.data.notes || null,
      },
    });

    if (branchIds.length > 0) {
      await prisma.trainerBranch.createMany({
        data: branchIds.map((branchId) => ({
          trainerId: trainer.id,
          branchId,
        })),
      });
    }

    revalidatePath("/[locale]/trainers");
    return { messageKey: "trainerCreated", success: true };
  } catch (error) {
    console.error("Create trainer error:", error);
    return { messageKey: "trainerCreateError", success: false };
  }
}

export async function updateTrainerAction(
  id: string,
  _prevState: TrainerFormState,
  formData: FormData
): Promise<TrainerFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const branchIds = formData.getAll("branchIds") as string[];

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    gender: formData.get("gender") as string,
    tcKimlikNo: formData.get("tcKimlikNo") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    taskDefinitionId: formData.get("taskDefinitionId") as string,
    salary: parseFloat(formData.get("salary") as string) || 0,
    salaryType: formData.get("salaryType") as string,
    bankName: formData.get("bankName") as string,
    bankAccount: formData.get("bankAccount") as string,
    notes: formData.get("notes") as string,
    branchIds,
  };

  const validatedFields = trainerSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    await prisma.trainer.update({
      where: { id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        birthDate: validatedFields.data.birthDate
          ? new Date(validatedFields.data.birthDate)
          : null,
        gender: validatedFields.data.gender || null,
        tcKimlikNo: validatedFields.data.tcKimlikNo || null,
        phone: validatedFields.data.phone,
        email: validatedFields.data.email || null,
        address: validatedFields.data.address || null,
        taskDefinitionId: validatedFields.data.taskDefinitionId && validatedFields.data.taskDefinitionId !== "none" ? validatedFields.data.taskDefinitionId : null,
        salary: validatedFields.data.salary,
        salaryType: validatedFields.data.salaryType || null,
        bankName: validatedFields.data.bankName || null,
        bankAccount: validatedFields.data.bankAccount || null,
        notes: validatedFields.data.notes || null,
      },
    });

    await prisma.trainerBranch.deleteMany({ where: { trainerId: id } });

    if (branchIds.length > 0) {
      await prisma.trainerBranch.createMany({
        data: branchIds.map((branchId) => ({
          trainerId: id,
          branchId,
        })),
      });
    }

    revalidatePath("/[locale]/trainers");
    revalidatePath(`/[locale]/trainers/${id}`);
    return { messageKey: "trainerUpdated", success: true };
  } catch (error) {
    console.error("Update trainer error:", error);
    return { messageKey: "trainerUpdateError", success: false };
  }
}

export async function deleteTrainerAction(id: string): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    await prisma.trainer.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    revalidatePath("/[locale]/trainers");
    return { messageKey: "trainerDeleted", success: true };
  } catch (error) {
    console.error("Delete trainer error:", error);
    return { messageKey: "trainerDeleteError", success: false };
  }
}
