import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const orderItemSchema = z.object({
  productId: z.string(),
  variantId: z.string().optional(),
  quantity: z.number().min(1),
  unitPrice: z.number().min(0),
});

const orderSchema = z.object({
  dealerSlug: z.string(),
  customerName: z.string().min(1),
  customerEmail: z.string().email(),
  customerPhone: z.string().min(1),
  shippingAddress: z.string().optional(),
  notes: z.string().optional(),
  items: z.array(orderItemSchema).min(1),
});

function generateOrderNumber(): string {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `ORD-${timestamp}-${random}`;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = orderSchema.parse(body);

    // Find dealer
    const dealer = await prisma.dealer.findUnique({
      where: {
        slug: validatedData.dealerSlug,
        isActive: true,
      },
      select: { id: true },
    });

    if (!dealer) {
      return NextResponse.json(
        { message: "Bayi bulunamadi" },
        { status: 404 }
      );
    }

    // Validate products and variants exist
    const productIds = validatedData.items.map((item) => item.productId);
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        dealerId: dealer.id,
        isActive: true,
      },
      include: {
        variants: true,
      },
    });

    if (products.length !== productIds.length) {
      return NextResponse.json(
        { message: "Bazi urunler bulunamadi" },
        { status: 400 }
      );
    }

    // Calculate totals and validate stock
    let subtotal = 0;
    const orderItems: {
      productId: string;
      variantId: string | null;
      quantity: number;
      unitPrice: number;
      total: number;
    }[] = [];

    for (const item of validatedData.items) {
      const product = products.find((p) => p.id === item.productId);
      if (!product) {
        return NextResponse.json(
          { message: `Urun bulunamadi: ${item.productId}` },
          { status: 400 }
        );
      }

      // Check variant if provided
      if (item.variantId) {
        const variant = product.variants.find((v) => v.id === item.variantId);
        if (!variant) {
          return NextResponse.json(
            { message: `Varyant bulunamadi: ${item.variantId}` },
            { status: 400 }
          );
        }

        if (variant.stock < item.quantity) {
          return NextResponse.json(
            { message: `Yetersiz stok: ${product.name} (${variant.size})` },
            { status: 400 }
          );
        }
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        productId: item.productId,
        variantId: item.variantId || null,
        quantity: item.quantity,
        unitPrice: product.price,
        total: itemTotal,
      });
    }

    // Create order
    const orderNumber = generateOrderNumber();
    const order = await prisma.shopOrder.create({
      data: {
        orderNumber,
        dealerId: dealer.id,
        customerName: validatedData.customerName,
        customerEmail: validatedData.customerEmail,
        customerPhone: validatedData.customerPhone,
        shippingAddress: validatedData.shippingAddress || null,
        notes: validatedData.notes || null,
        subtotal,
        shippingCost: 0, // Free shipping
        total: subtotal,
        status: "PENDING",
        paymentStatus: "PENDING",
        items: {
          create: orderItems,
        },
      },
    });

    // Update stock for variants
    for (const item of validatedData.items) {
      if (item.variantId) {
        await prisma.productVariant.update({
          where: { id: item.variantId },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });
      }
    }

    return NextResponse.json({
      success: true,
      orderNumber: order.orderNumber,
      orderId: order.id,
    });
  } catch (error) {
    console.error("Order creation error:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Gecersiz veri", errors: error.issues },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Siparis olusturulamadi" },
      { status: 500 }
    );
  }
}
