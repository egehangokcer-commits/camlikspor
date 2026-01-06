import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";
import { startOfMonth, endOfMonth } from "date-fns";

export interface DashboardStats {
  totalStudents: number;
  totalTrainers: number;
  totalGroups: number;
  monthlyIncome: number;
  pendingPayments: number;
  todayAttendance: {
    present: number;
    absent: number;
    total: number;
  };
  upcomingBirthdays: {
    id: string;
    name: string;
    birthDate: Date;
  }[];
  recentPreRegistrations: {
    id: string;
    studentName: string;
    createdAt: Date;
  }[];
}

export async function getDashboardStats(dealerId?: string | null): Promise<DashboardStats> {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const endOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  // Build where clauses with proper types
  const studentWhere: Prisma.StudentWhereInput = {
    isActive: true,
    ...(dealerId ? { dealerId } : {}),
  };

  const trainerWhere: Prisma.TrainerWhereInput = {
    isActive: true,
    ...(dealerId ? { dealerId } : {}),
  };

  const groupWhere: Prisma.GroupWhereInput = {
    isActive: true,
    ...(dealerId ? { dealerId } : {}),
  };

  const paymentWhereCompleted: Prisma.PaymentWhereInput = {
    status: "COMPLETED",
    paidAt: {
      gte: startOfMonth(today),
      lte: endOfMonth(today),
    },
    ...(dealerId ? { dealerId } : {}),
  };

  const paymentWherePending: Prisma.PaymentWhereInput = {
    status: "PENDING",
    dueDate: { lt: today },
    ...(dealerId ? { dealerId } : {}),
  };

  // Attendance uses session relation for date
  const attendanceWhere: Prisma.AttendanceWhereInput = {
    session: {
      date: {
        gte: startOfToday,
        lte: endOfToday,
      },
      ...(dealerId ? { group: { dealerId } } : {}),
    },
  };

  const preRegistrationWhere: Prisma.PreRegistrationWhereInput = {
    status: "PENDING",
    ...(dealerId ? { dealerId } : {}),
  };

  // Get counts in parallel
  const [
    totalStudents,
    totalTrainers,
    totalGroups,
    monthlyPayments,
    pendingPaymentsCount,
    todayAttendances,
    upcomingBirthdaysRaw,
    recentPreRegistrations,
  ] = await Promise.all([
    prisma.student.count({ where: studentWhere }),
    prisma.trainer.count({ where: trainerWhere }),
    prisma.group.count({ where: groupWhere }),
    prisma.payment.aggregate({
      where: paymentWhereCompleted,
      _sum: { amount: true },
    }),
    prisma.payment.count({ where: paymentWherePending }),
    prisma.attendance.groupBy({
      by: ["status"],
      where: attendanceWhere,
      _count: true,
    }),
    prisma.student.findMany({
      where: studentWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        birthDate: true,
      },
      orderBy: { birthDate: "asc" },
    }),
    prisma.preRegistration.findMany({
      where: preRegistrationWhere,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    }),
  ]);

  type AttendanceGroup = (typeof todayAttendances)[number];
  type StudentBirthday = (typeof upcomingBirthdaysRaw)[number];
  type PreRegistrationItem = (typeof recentPreRegistrations)[number];

  // Calculate today's attendance stats
  const attendanceStats = {
    present: 0,
    absent: 0,
    total: 0,
  };
  todayAttendances.forEach((a: AttendanceGroup) => {
    if (a.status === "PRESENT" || a.status === "LATE") {
      attendanceStats.present += a._count;
    } else if (a.status === "ABSENT") {
      attendanceStats.absent += a._count;
    }
    attendanceStats.total += a._count;
  });

  // Filter upcoming birthdays (within next 7 days)
  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);
  const upcomingBirthdays = upcomingBirthdaysRaw
    .filter((student: StudentBirthday) => {
      if (!student.birthDate) return false;
      const bday = new Date(student.birthDate);
      bday.setFullYear(today.getFullYear());
      return bday >= today && bday <= nextWeek;
    })
    .slice(0, 5)
    .map((s: StudentBirthday) => ({
      id: s.id,
      name: `${s.firstName} ${s.lastName}`,
      birthDate: s.birthDate,
    }));

  return {
    totalStudents,
    totalTrainers,
    totalGroups,
    monthlyIncome: monthlyPayments._sum.amount ?? 0,
    pendingPayments: pendingPaymentsCount,
    todayAttendance: attendanceStats,
    upcomingBirthdays,
    recentPreRegistrations: recentPreRegistrations.map((r: PreRegistrationItem) => ({
      id: r.id,
      studentName: `${r.firstName} ${r.lastName}`,
      createdAt: r.createdAt,
    })),
  };
}
