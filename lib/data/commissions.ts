import { prisma } from "@/lib/prisma";
import type { CommissionSettings, CommissionTransactionItem, CommissionReport } from "@/lib/types";

export async function getCommissionSettings(
  parentDealerId: string,
  childDealerId: string
): Promise<CommissionSettings | null> {
  const commission = await prisma.dealerCommission.findUnique({
    where: {
      parentDealerId_childDealerId: {
        parentDealerId,
        childDealerId,
      },
    },
  });

  return commission;
}

export async function getCommissionsByParent(
  parentDealerId: string
): Promise<
  (CommissionSettings & {
    childDealer: { id: string; name: string; slug: string };
  })[]
> {
  const commissions = await prisma.dealerCommission.findMany({
    where: { parentDealerId },
    include: {
      childDealer: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return commissions;
}

export async function getCommissionTransactions(
  parentDealerId: string,
  filters?: {
    childDealerId?: string;
    status?: string;
    startDate?: Date;
    endDate?: Date;
  },
  page: number = 1,
  limit: number = 20
): Promise<{ data: CommissionTransactionItem[]; total: number }> {
  const where: Record<string, unknown> = {
    commission: {
      parentDealerId,
    },
  };

  if (filters?.childDealerId) {
    where.commission = {
      ...((where.commission as Record<string, unknown>) || {}),
      childDealerId: filters.childDealerId,
    };
  }

  if (filters?.status) {
    where.status = filters.status;
  }

  if (filters?.startDate || filters?.endDate) {
    where.createdAt = {};
    if (filters.startDate) {
      (where.createdAt as Record<string, unknown>).gte = filters.startDate;
    }
    if (filters.endDate) {
      (where.createdAt as Record<string, unknown>).lte = filters.endDate;
    }
  }

  const [transactions, total] = await Promise.all([
    prisma.commissionTransaction.findMany({
      where,
      include: {
        order: {
          select: {
            orderNumber: true,
          },
        },
        commission: {
          include: {
            childDealer: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.commissionTransaction.count({ where }),
  ]);

  const data: CommissionTransactionItem[] = transactions.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    orderNumber: t.order.orderNumber,
    orderTotal: t.orderTotal,
    commissionAmount: t.commissionAmount,
    commissionRate: t.commissionRate,
    status: t.status,
    paidAt: t.paidAt,
    createdAt: t.createdAt,
    childDealerName: t.commission.childDealer.name,
  }));

  return { data, total };
}

export async function getCommissionReport(
  parentDealerId: string,
  startDate?: Date,
  endDate?: Date
): Promise<CommissionReport> {
  const where: Record<string, unknown> = {
    commission: {
      parentDealerId,
    },
  };

  if (startDate || endDate) {
    where.createdAt = {};
    if (startDate) {
      (where.createdAt as Record<string, unknown>).gte = startDate;
    }
    if (endDate) {
      (where.createdAt as Record<string, unknown>).lte = endDate;
    }
  }

  const transactions = await prisma.commissionTransaction.findMany({
    where,
    include: {
      order: {
        select: {
          orderNumber: true,
        },
      },
      commission: {
        include: {
          childDealer: {
            select: {
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalCommission = transactions.reduce(
    (sum, t) => sum + t.commissionAmount,
    0
  );
  const pendingCommission = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.commissionAmount, 0);
  const paidCommission = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.commissionAmount, 0);

  const transactionItems: CommissionTransactionItem[] = transactions.map((t) => ({
    id: t.id,
    orderId: t.orderId,
    orderNumber: t.order.orderNumber,
    orderTotal: t.orderTotal,
    commissionAmount: t.commissionAmount,
    commissionRate: t.commissionRate,
    status: t.status,
    paidAt: t.paidAt,
    createdAt: t.createdAt,
    childDealerName: t.commission.childDealer.name,
  }));

  return {
    totalCommission,
    pendingCommission,
    paidCommission,
    transactionCount: transactions.length,
    transactions: transactionItems,
  };
}

export async function getPendingPayouts(
  parentDealerId: string
): Promise<
  {
    childDealerId: string;
    childDealerName: string;
    pendingAmount: number;
    transactionCount: number;
    minimumPayout: number;
    canPayout: boolean;
  }[]
> {
  const commissions = await prisma.dealerCommission.findMany({
    where: { parentDealerId, isActive: true },
    include: {
      childDealer: {
        select: {
          id: true,
          name: true,
        },
      },
      transactions: {
        where: { status: "PENDING" },
      },
    },
  });

  return commissions.map((c) => {
    const pendingAmount = c.transactions.reduce(
      (sum, t) => sum + t.commissionAmount,
      0
    );
    return {
      childDealerId: c.childDealerId,
      childDealerName: c.childDealer.name,
      pendingAmount,
      transactionCount: c.transactions.length,
      minimumPayout: c.minimumPayout,
      canPayout: pendingAmount >= c.minimumPayout,
    };
  });
}

export async function getCommissionStats(parentDealerId: string): Promise<{
  totalEarned: number;
  pendingPayouts: number;
  paidPayouts: number;
  activeSubDealers: number;
}> {
  const [transactions, activeSubDealers] = await Promise.all([
    prisma.commissionTransaction.findMany({
      where: {
        commission: { parentDealerId },
      },
      select: {
        commissionAmount: true,
        status: true,
      },
    }),
    prisma.dealerCommission.count({
      where: { parentDealerId, isActive: true },
    }),
  ]);

  const totalEarned = transactions.reduce(
    (sum, t) => sum + t.commissionAmount,
    0
  );
  const pendingPayouts = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.commissionAmount, 0);
  const paidPayouts = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.commissionAmount, 0);

  return {
    totalEarned,
    pendingPayouts,
    paidPayouts,
    activeSubDealers,
  };
}
