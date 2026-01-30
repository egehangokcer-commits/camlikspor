"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { generateStudentNumber } from "@/lib/data/students";
import {
  turkishPhoneSchema,
  turkishPhoneOptionalSchema,
  tcKimlikOptionalSchema,
} from "@/lib/utils/validation";

const studentSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmali"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmali"),
  birthDate: z.string().min(1, "Dogum tarihi gerekli"),
  gender: z.string().min(1, "Cinsiyet gerekli"),
  tcKimlikNo: tcKimlikOptionalSchema,
  phone: turkishPhoneOptionalSchema,
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().optional(),
  parentName: z.string().min(2, "Veli adi gerekli"),
  parentPhone: turkishPhoneSchema,
  parentEmail: z.string().email().optional().or(z.literal("")),
  parentTcKimlik: tcKimlikOptionalSchema,
  emergencyContact: z.string().optional(),
  emergencyPhone: turkishPhoneOptionalSchema,
  branchId: z.string().min(1, "Brans secimi gerekli"),
  locationId: z.string().min(1, "Sube secimi gerekli"),
  facilityId: z.string().min(1, "Tesis secimi gerekli"),
  monthlyFee: z.number().min(0).default(0),
  registrationFee: z.number().min(0).default(0),
  discountTypeId: z.string().optional(),
  notes: z.string().optional(),
});

export type StudentFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
};

export async function createStudentAction(
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    gender: formData.get("gender") as string,
    tcKimlikNo: formData.get("tcKimlikNo") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    parentName: formData.get("parentName") as string,
    parentPhone: formData.get("parentPhone") as string,
    parentEmail: formData.get("parentEmail") as string,
    parentTcKimlik: formData.get("parentTcKimlik") as string,
    emergencyContact: formData.get("emergencyContact") as string,
    emergencyPhone: formData.get("emergencyPhone") as string,
    branchId: formData.get("branchId") as string,
    locationId: formData.get("locationId") as string,
    facilityId: formData.get("facilityId") as string,
    monthlyFee: parseFloat(formData.get("monthlyFee") as string) || 0,
    registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
    discountTypeId: formData.get("discountTypeId") as string,
    notes: formData.get("notes") as string,
  };

  const validatedFields = studentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    const studentNumber = await generateStudentNumber(session.user.dealerId);

    await prisma.student.create({
      data: {
        dealerId: session.user.dealerId,
        studentNumber,
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        birthDate: new Date(validatedFields.data.birthDate),
        gender: validatedFields.data.gender,
        tcKimlikNo: validatedFields.data.tcKimlikNo || null,
        phone: validatedFields.data.phone || null,
        email: validatedFields.data.email || null,
        address: validatedFields.data.address || null,
        parentName: validatedFields.data.parentName,
        parentPhone: validatedFields.data.parentPhone,
        parentEmail: validatedFields.data.parentEmail || null,
        parentTcKimlik: validatedFields.data.parentTcKimlik || null,
        emergencyContact: validatedFields.data.emergencyContact || null,
        emergencyPhone: validatedFields.data.emergencyPhone || null,
        branchId: validatedFields.data.branchId,
        locationId: validatedFields.data.locationId,
        facilityId: validatedFields.data.facilityId,
        monthlyFee: validatedFields.data.monthlyFee,
        registrationFee: validatedFields.data.registrationFee,
        discountTypeId: validatedFields.data.discountTypeId && validatedFields.data.discountTypeId !== "none" ? validatedFields.data.discountTypeId : null,
        notes: validatedFields.data.notes || null,
      },
    });

    revalidatePath("/[locale]/students");
    return { messageKey: "studentCreated", success: true };
  } catch (error) {
    console.error("Create student error:", error);
    return { messageKey: "studentCreateError", success: false };
  }
}

export async function updateStudentAction(
  id: string,
  _prevState: StudentFormState,
  formData: FormData
): Promise<StudentFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    firstName: formData.get("firstName") as string,
    lastName: formData.get("lastName") as string,
    birthDate: formData.get("birthDate") as string,
    gender: formData.get("gender") as string,
    tcKimlikNo: formData.get("tcKimlikNo") as string,
    phone: formData.get("phone") as string,
    email: formData.get("email") as string,
    address: formData.get("address") as string,
    parentName: formData.get("parentName") as string,
    parentPhone: formData.get("parentPhone") as string,
    parentEmail: formData.get("parentEmail") as string,
    parentTcKimlik: formData.get("parentTcKimlik") as string,
    emergencyContact: formData.get("emergencyContact") as string,
    emergencyPhone: formData.get("emergencyPhone") as string,
    branchId: formData.get("branchId") as string,
    locationId: formData.get("locationId") as string,
    facilityId: formData.get("facilityId") as string,
    monthlyFee: parseFloat(formData.get("monthlyFee") as string) || 0,
    registrationFee: parseFloat(formData.get("registrationFee") as string) || 0,
    discountTypeId: formData.get("discountTypeId") as string,
    notes: formData.get("notes") as string,
  };

  const validatedFields = studentSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  try {
    await prisma.student.update({
      where: { id },
      data: {
        firstName: validatedFields.data.firstName,
        lastName: validatedFields.data.lastName,
        birthDate: new Date(validatedFields.data.birthDate),
        gender: validatedFields.data.gender,
        tcKimlikNo: validatedFields.data.tcKimlikNo || null,
        phone: validatedFields.data.phone || null,
        email: validatedFields.data.email || null,
        address: validatedFields.data.address || null,
        parentName: validatedFields.data.parentName,
        parentPhone: validatedFields.data.parentPhone,
        parentEmail: validatedFields.data.parentEmail || null,
        parentTcKimlik: validatedFields.data.parentTcKimlik || null,
        emergencyContact: validatedFields.data.emergencyContact || null,
        emergencyPhone: validatedFields.data.emergencyPhone || null,
        branchId: validatedFields.data.branchId,
        locationId: validatedFields.data.locationId,
        facilityId: validatedFields.data.facilityId,
        monthlyFee: validatedFields.data.monthlyFee,
        registrationFee: validatedFields.data.registrationFee,
        discountTypeId: validatedFields.data.discountTypeId && validatedFields.data.discountTypeId !== "none" ? validatedFields.data.discountTypeId : null,
        notes: validatedFields.data.notes || null,
      },
    });

    revalidatePath("/[locale]/students");
    revalidatePath(`/[locale]/students/${id}`);
    return { messageKey: "studentUpdated", success: true };
  } catch (error) {
    console.error("Update student error:", error);
    return { messageKey: "studentUpdateError", success: false };
  }
}

export async function deleteStudentAction(id: string): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    await prisma.student.update({
      where: { id },
      data: { isActive: false, deletedAt: new Date() },
    });

    revalidatePath("/[locale]/students");
    return { messageKey: "studentDeleted", success: true };
  } catch (error) {
    console.error("Delete student error:", error);
    return { messageKey: "studentDeleteError", success: false };
  }
}
