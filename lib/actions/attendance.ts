"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export type AttendanceStatus = "PRESENT" | "ABSENT" | "LATE" | "EXCUSED";

export type AttendanceFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  success?: boolean;
};

interface AttendanceRecord {
  studentId: string;
  status: AttendanceStatus;
  notes?: string;
}

export async function createAttendanceSessionAction(
  groupId: string,
  trainerId: string,
  date: Date,
  attendances: AttendanceRecord[]
): Promise<AttendanceFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  if (!groupId || !trainerId || !date || attendances.length === 0) {
    return { message: "Eksik bilgi", success: false };
  }

  try {
    // Check if session already exists for this group and date
    const existingSession = await prisma.attendanceSession.findUnique({
      where: {
        groupId_date: {
          groupId,
          date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        },
      },
    });

    if (existingSession) {
      return {
        message: "Bu tarih icin yoklama zaten alinmis",
        success: false,
        errors: { date: ["Bu tarih icin yoklama zaten alinmis"] },
      };
    }

    // Create attendance session with all attendances
    await prisma.attendanceSession.create({
      data: {
        groupId,
        trainerId,
        date: new Date(date.getFullYear(), date.getMonth(), date.getDate()),
        attendances: {
          create: attendances.map((a: AttendanceRecord) => ({
            studentId: a.studentId,
            status: a.status,
            notes: a.notes || null,
          })),
        },
      },
    });

    revalidatePath("/[locale]/attendance");
    return { message: "Yoklama basariyla kaydedildi", success: true };
  } catch (error) {
    console.error("Create attendance error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export async function updateAttendanceSessionAction(
  sessionId: string,
  attendances: AttendanceRecord[]
): Promise<AttendanceFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { message: "Yetkilendirme hatasi", success: false };
  }

  try {
    // Delete existing attendances and create new ones
    await prisma.$transaction([
      prisma.attendance.deleteMany({
        where: { sessionId },
      }),
      ...attendances.map((a: AttendanceRecord) =>
        prisma.attendance.create({
          data: {
            sessionId,
            studentId: a.studentId,
            status: a.status,
            notes: a.notes || null,
          },
        })
      ),
    ]);

    revalidatePath("/[locale]/attendance");
    return { message: "Yoklama guncellendi", success: true };
  } catch (error) {
    console.error("Update attendance error:", error);
    return { message: "Bir hata olustu", success: false };
  }
}

export interface GroupStudent {
  id: string;
  firstName: string;
  lastName: string;
  photoUrl: string | null;
}

export async function getGroupStudents(groupId: string): Promise<GroupStudent[]> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return [];
  }

  const students = await prisma.student.findMany({
    where: {
      isActive: true,
      groups: {
        some: { groupId },
      },
    },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      photoUrl: true,
    },
    orderBy: [{ firstName: "asc" }, { lastName: "asc" }],
  });

  return students;
}
