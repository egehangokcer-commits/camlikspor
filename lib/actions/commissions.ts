"use server";

import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

const commissionSettingsSchema = z.object({
  childDealerId: z.string().min(1, "Alt-bayi seçimi gerekli"),
  productCommissionRate: z.number().min(0).max(100).default(0),
  orderCommissionRate: z.number().min(0).max(100).default(0),
  fixedOrderCommission: z.number().min(0).default(0),
  minimumPayout: z.number().min(0).default(100),
  payoutFrequency: z.enum(["weekly", "monthly", "on-demand"]).default("monthly"),
});

export type CommissionFormState = {
  errors?: {
    [key: string]: string[];
  };
  message?: string;
  messageKey?: string;
  success?: boolean;
};

export async function createOrUpdateCommissionSettingsAction(
  _prevState: CommissionFormState,
  formData: FormData
): Promise<CommissionFormState> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  const rawData = {
    childDealerId: formData.get("childDealerId") as string,
    productCommissionRate:
      parseFloat(formData.get("productCommissionRate") as string) || 0,
    orderCommissionRate:
      parseFloat(formData.get("orderCommissionRate") as string) || 0,
    fixedOrderCommission:
      parseFloat(formData.get("fixedOrderCommission") as string) || 0,
    minimumPayout:
      parseFloat(formData.get("minimumPayout") as string) || 100,
    payoutFrequency: formData.get("payoutFrequency") as string || "monthly",
  };

  const validatedFields = commissionSettingsSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
      messageKey: "formValidationError",
      success: false,
    };
  }

  // Verify sub-dealer belongs to this dealer
  const subDealer = await prisma.dealer.findFirst({
    where: {
      id: validatedFields.data.childDealerId,
      parentDealerId: session.user.dealerId,
    },
  });

  if (!subDealer) {
    return { messageKey: "subDealerNotFound", success: false };
  }

  try {
    await prisma.dealerCommission.upsert({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: session.user.dealerId,
          childDealerId: validatedFields.data.childDealerId,
        },
      },
      create: {
        parentDealerId: session.user.dealerId,
        childDealerId: validatedFields.data.childDealerId,
        productCommissionRate: validatedFields.data.productCommissionRate,
        orderCommissionRate: validatedFields.data.orderCommissionRate,
        fixedOrderCommission: validatedFields.data.fixedOrderCommission,
        minimumPayout: validatedFields.data.minimumPayout,
        payoutFrequency: validatedFields.data.payoutFrequency,
      },
      update: {
        productCommissionRate: validatedFields.data.productCommissionRate,
        orderCommissionRate: validatedFields.data.orderCommissionRate,
        fixedOrderCommission: validatedFields.data.fixedOrderCommission,
        minimumPayout: validatedFields.data.minimumPayout,
        payoutFrequency: validatedFields.data.payoutFrequency,
      },
    });

    revalidatePath("/commissions");
    revalidatePath(`/sub-dealers/${validatedFields.data.childDealerId}`);

    return {
      messageKey: "commissionSettingsUpdated",
      success: true,
    };
  } catch (error) {
    console.error("Commission settings error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function toggleCommissionStatusAction(
  childDealerId: string,
  isActive: boolean
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    await prisma.dealerCommission.update({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: session.user.dealerId,
          childDealerId,
        },
      },
      data: { isActive },
    });

    revalidatePath("/commissions");

    return {
      messageKey: isActive ? "commissionActivated" : "commissionDeactivated",
      success: true,
    };
  } catch (error) {
    console.error("Toggle commission status error:", error);
    return {
      messageKey: "updateError",
      success: false,
    };
  }
}

export async function processCommissionPayoutAction(
  childDealerId: string
): Promise<{ success: boolean; messageKey: string; paidAmount?: number }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    // Get commission settings
    const commission = await prisma.dealerCommission.findUnique({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: session.user.dealerId,
          childDealerId,
        },
      },
    });

    if (!commission) {
      return { messageKey: "commissionNotFound", success: false };
    }

    // Get pending transactions
    const pendingTransactions = await prisma.commissionTransaction.findMany({
      where: {
        commissionId: commission.id,
        status: "PENDING",
      },
    });

    if (pendingTransactions.length === 0) {
      return { messageKey: "noPendingTransactions", success: false };
    }

    const totalAmount = pendingTransactions.reduce(
      (sum, t) => sum + t.commissionAmount,
      0
    );

    if (totalAmount < commission.minimumPayout) {
      return { messageKey: "belowMinimumPayout", success: false };
    }

    // Mark all as paid
    await prisma.commissionTransaction.updateMany({
      where: {
        commissionId: commission.id,
        status: "PENDING",
      },
      data: {
        status: "PAID",
        paidAt: new Date(),
      },
    });

    revalidatePath("/commissions");

    return {
      messageKey: "payoutProcessed",
      success: true,
      paidAmount: totalAmount,
    };
  } catch (error) {
    console.error("Process payout error:", error);
    return {
      messageKey: "payoutError",
      success: false,
    };
  }
}

export async function calculateOrderCommissionAction(
  orderId: string
): Promise<{ success: boolean; commissionAmount?: number }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { success: false };
  }

  try {
    // Get order with dealer info
    const order = await prisma.shopOrder.findUnique({
      where: { id: orderId },
      include: {
        dealer: {
          select: {
            id: true,
            parentDealerId: true,
          },
        },
      },
    });

    if (!order || !order.dealer.parentDealerId) {
      return { success: false };
    }

    // Get commission settings
    const commission = await prisma.dealerCommission.findUnique({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: order.dealer.parentDealerId,
          childDealerId: order.dealer.id,
        },
      },
    });

    if (!commission || !commission.isActive) {
      return { success: false };
    }

    // Calculate commission
    let commissionAmount = 0;

    // Order commission rate
    if (commission.orderCommissionRate > 0) {
      commissionAmount += (order.total * commission.orderCommissionRate) / 100;
    }

    // Fixed order commission
    if (commission.fixedOrderCommission > 0) {
      commissionAmount += commission.fixedOrderCommission;
    }

    if (commissionAmount > 0) {
      // Create transaction
      await prisma.commissionTransaction.create({
        data: {
          commissionId: commission.id,
          orderId: order.id,
          orderTotal: order.total,
          commissionAmount,
          commissionRate: commission.orderCommissionRate,
          status: "PENDING",
        },
      });
    }

    return { success: true, commissionAmount };
  } catch (error) {
    console.error("Calculate commission error:", error);
    return { success: false };
  }
}

export async function deleteCommissionSettingsAction(
  childDealerId: string
): Promise<{ success: boolean; messageKey: string }> {
  const session = await auth();

  if (!session?.user?.dealerId) {
    return { messageKey: "authError", success: false };
  }

  try {
    // Check for pending transactions
    const commission = await prisma.dealerCommission.findUnique({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: session.user.dealerId,
          childDealerId,
        },
      },
      include: {
        _count: {
          select: {
            transactions: {
              where: { status: "PENDING" },
            },
          },
        },
      },
    });

    if (!commission) {
      return { messageKey: "notFound", success: false };
    }

    if (commission._count.transactions > 0) {
      return { messageKey: "hasPendingTransactions", success: false };
    }

    await prisma.dealerCommission.delete({
      where: {
        parentDealerId_childDealerId: {
          parentDealerId: session.user.dealerId,
          childDealerId,
        },
      },
    });

    revalidatePath("/commissions");

    return {
      messageKey: "commissionDeleted",
      success: true,
    };
  } catch (error) {
    console.error("Delete commission error:", error);
    return {
      messageKey: "deleteError",
      success: false,
    };
  }
}
