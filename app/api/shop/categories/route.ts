import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user?.dealerId) {
      return NextResponse.json(
        { message: "Yetkilendirme hatasi" },
        { status: 401 }
      );
    }

    const categories = await prisma.productCategory.findMany({
      where: {
        dealerId: session.user.dealerId,
      },
      select: {
        id: true,
        name: true,
        slug: true,
        _count: {
          select: { products: true },
        },
        createdAt: true,
      },
      orderBy: { name: "asc" },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("Categories fetch error:", error);
    return NextResponse.json(
      { message: "Kategoriler alinamadi" },
      { status: 500 }
    );
  }
}
