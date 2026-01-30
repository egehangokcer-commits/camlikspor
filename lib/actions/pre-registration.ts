"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logAudit } from "@/lib/logger";
import { UserRole, Permission } from "@/lib/types";
import { z } from "zod";
import { turkishPhoneSchema } from "@/lib/utils/validation";

const preRegistrationSchema = z.object({
  firstName: z.string().min(2, "Ad en az 2 karakter olmali"),
  lastName: z.string().min(2, "Soyad en az 2 karakter olmali"),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  parentName: z.string().min(2, "Veli adi en az 2 karakter olmali"),
  parentPhone: turkishPhoneSchema,
  parentEmail: z.string().email().optional().or(z.literal("")),
  branchInterest: z.string().optional(),
  notes: z.string().optional(),
  source: z.string().optional(),
});

export type PreRegistrationFormState = {
  errors?: {
    firstName?: string[];
    lastName?: string[];
    parentName?: string[];
    parentPhone?: string[];
    parentEmail?: string[];
    _form?: string[];
  };
  success?: boolean;
  message?: string;
  messageKey?: string;
  errorKey?: string;
};

export async function createPreRegistrationAction(
  _prevState: PreRegistrationFormState,
  formData: FormData
): Promise<PreRegistrationFormState> {
  const session = await auth();
  if (!session?.user) {
    return { errorKey: "sessionRequired" };
  }

  // Check permission
  const hasPermission = session.user.permissions?.includes(Permission.PRE_REGISTRATION_CREATE);
  if (!hasPermission && session.user.role !== UserRole.SUPER_ADMIN) {
    return { errorKey: "noPermission" };
  }

  const dealerId = session.user.dealerId;
  if (!dealerId) {
    return { errorKey: "dealerNotFound" };
  }

  const validatedFields = preRegistrationSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
    parentName: formData.get("parentName"),
    parentPhone: formData.get("parentPhone"),
    parentEmail: formData.get("parentEmail"),
    branchInterest: formData.get("branchInterest"),
    notes: formData.get("notes"),
    source: formData.get("source"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const data = validatedFields.data;

    // Convert "none" values to null
    const gender = data.gender && data.gender !== "none" ? data.gender : null;
    const branchInterest = data.branchInterest && data.branchInterest !== "none" ? data.branchInterest : null;
    const source = data.source && data.source !== "none" ? data.source : null;

    const preRegistration = await prisma.preRegistration.create({
      data: {
        dealerId: dealerId!,
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
        branchInterest,
        notes: data.notes || null,
        source,
      },
    });

    logAudit({
      actor: session.user.id,
      action: "CREATE",
      entity: "PreRegistration",
      entityId: preRegistration.id,
      dealerId: dealerId || undefined,
      status: "SUCCESS",
    });

    revalidatePath("/[locale]/pre-registration");
    return { success: true, messageKey: "preRegistrationCreated" };
  } catch (error) {
    console.error("Pre-registration create error:", error);
    logAudit({
      actor: session.user.id,
      action: "CREATE",
      entity: "PreRegistration",
      dealerId: dealerId || undefined,
      status: "FAILURE",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { errorKey: "preRegistrationCreateError" };
  }
}

export async function updatePreRegistrationAction(
  id: string,
  _prevState: PreRegistrationFormState,
  formData: FormData
): Promise<PreRegistrationFormState> {
  const session = await auth();
  if (!session?.user) {
    return { errorKey: "sessionRequired" };
  }

  const hasPermission = session.user.permissions?.includes(Permission.PRE_REGISTRATION_EDIT);
  if (!hasPermission && session.user.role !== UserRole.SUPER_ADMIN) {
    return { errorKey: "noPermission" };
  }

  const validatedFields = preRegistrationSchema.safeParse({
    firstName: formData.get("firstName"),
    lastName: formData.get("lastName"),
    birthDate: formData.get("birthDate"),
    gender: formData.get("gender"),
    parentName: formData.get("parentName"),
    parentPhone: formData.get("parentPhone"),
    parentEmail: formData.get("parentEmail"),
    branchInterest: formData.get("branchInterest"),
    notes: formData.get("notes"),
    source: formData.get("source"),
  });

  if (!validatedFields.success) {
    return { errors: validatedFields.error.flatten().fieldErrors };
  }

  try {
    const data = validatedFields.data;
    await prisma.preRegistration.update({
      where: { id },
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        gender: data.gender || null,
        parentName: data.parentName,
        parentPhone: data.parentPhone,
        parentEmail: data.parentEmail || null,
        branchInterest: data.branchInterest || null,
        notes: data.notes || null,
        source: data.source || null,
      },
    });

    logAudit({
      actor: session.user.id,
      action: "UPDATE",
      entity: "PreRegistration",
      entityId: id,
      dealerId: session.user.dealerId || undefined,
      status: "SUCCESS",
    });

    revalidatePath("/[locale]/pre-registration");
    return { success: true, messageKey: "preRegistrationUpdated" };
  } catch (error) {
    logAudit({
      actor: session.user.id,
      action: "UPDATE",
      entity: "PreRegistration",
      entityId: id,
      dealerId: session.user.dealerId || undefined,
      status: "FAILURE",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { errorKey: "preRegistrationUpdateError" };
  }
}

export async function deletePreRegistrationAction(id: string): Promise<{ success: boolean; errorKey?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, errorKey: "sessionRequired" };
  }

  const hasPermission = session.user.permissions?.includes(Permission.PRE_REGISTRATION_DELETE);
  if (!hasPermission && session.user.role !== UserRole.SUPER_ADMIN) {
    return { success: false, errorKey: "noPermission" };
  }

  try {
    await prisma.preRegistration.delete({
      where: { id },
    });

    logAudit({
      actor: session.user.id,
      action: "DELETE",
      entity: "PreRegistration",
      entityId: id,
      dealerId: session.user.dealerId || undefined,
      status: "SUCCESS",
    });

    revalidatePath("/[locale]/pre-registration");
    return { success: true };
  } catch (error) {
    logAudit({
      actor: session.user.id,
      action: "DELETE",
      entity: "PreRegistration",
      entityId: id,
      dealerId: session.user.dealerId || undefined,
      status: "FAILURE",
      errorMessage: error instanceof Error ? error.message : "Unknown error",
    });
    return { success: false, errorKey: "preRegistrationDeleteError" };
  }
}

export async function updatePreRegistrationStatusAction(
  id: string,
  status: string
): Promise<{ success: boolean; errorKey?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, errorKey: "sessionRequired" };
  }

  const hasPermission = session.user.permissions?.includes(Permission.PRE_REGISTRATION_EDIT);
  if (!hasPermission && session.user.role !== UserRole.SUPER_ADMIN) {
    return { success: false, errorKey: "noPermission" };
  }

  try {
    await prisma.preRegistration.update({
      where: { id },
      data: { status },
    });

    logAudit({
      actor: session.user.id,
      action: "UPDATE_STATUS",
      entity: "PreRegistration",
      entityId: id,
      dealerId: session.user.dealerId || undefined,
      newValue: { status },
      status: "SUCCESS",
    });

    revalidatePath("/[locale]/pre-registration");
    return { success: true };
  } catch (error) {
    return { success: false, errorKey: "statusUpdateError" };
  }
}
