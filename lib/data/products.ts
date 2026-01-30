import { prisma } from "@/lib/prisma";

export interface ProductListItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string | null;
  isActive: boolean;
  category: {
    id: string;
    name: string;
  };
  _count: {
    variants: number;
  };
  createdAt: Date;
}

export interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string | null;
  isActive: boolean;
  categoryId: string;
  category: {
    id: string;
    name: string;
    slug: string;
  };
  variants: {
    id: string;
    size: string;
    color: string | null;
    stock: number;
    sku: string | null;
  }[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CategoryListItem {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
  createdAt: Date;
}

export interface OrderListItem {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: string;
  paymentStatus: string;
  total: number;
  _count: {
    items: number;
  };
  createdAt: Date;
}

export interface OrderDetail {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string | null;
  status: string;
  paymentStatus: string;
  subtotal: number;
  shippingCost: number;
  total: number;
  notes: string | null;
  items: {
    id: string;
    quantity: number;
    unitPrice: number;
    total: number;
    product: {
      id: string;
      name: string;
      slug: string;
    };
    variant: {
      id: string;
      size: string;
      color: string | null;
    } | null;
  }[];
  student: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  createdAt: Date;
  updatedAt: Date;
}

// ============ PRODUCTS ============

export async function getProducts(
  filters: {
    dealerId?: string;
    categoryId?: string;
    search?: string;
    isActive?: boolean;
  },
  page: number = 1,
  limit: number = 10
): Promise<{ data: ProductListItem[]; total: number }> {
  const where: Record<string, unknown> = {};

  if (filters.dealerId) {
    where.dealerId = filters.dealerId;
  }

  if (filters.categoryId) {
    where.categoryId = filters.categoryId;
  }

  if (filters.search) {
    where.OR = [
      { name: { contains: filters.search } },
      { slug: { contains: filters.search } },
    ];
  }

  if (filters.isActive !== undefined) {
    where.isActive = filters.isActive;
  }

  const [data, total] = await Promise.all([
    prisma.product.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        images: true,
        isActive: true,
        category: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: { variants: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ]);

  return { data, total };
}

export async function getProductById(
  productId: string,
  dealerId?: string
): Promise<ProductDetail | null> {
  const where: Record<string, unknown> = { id: productId };
  if (dealerId) {
    where.dealerId = dealerId;
  }

  return prisma.product.findFirst({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      price: true,
      images: true,
      isActive: true,
      categoryId: true,
      category: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      variants: {
        select: {
          id: true,
          size: true,
          color: true,
          stock: true,
          sku: true,
        },
        orderBy: { size: "asc" },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}

// ============ CATEGORIES ============

export async function getCategories(
  dealerId?: string
): Promise<CategoryListItem[]> {
  const where: Record<string, unknown> = {};

  if (dealerId) {
    where.dealerId = dealerId;
  }

  return prisma.productCategory.findMany({
    where,
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
}

export async function getCategoryById(
  categoryId: string,
  dealerId?: string
): Promise<CategoryListItem | null> {
  const where: Record<string, unknown> = { id: categoryId };
  if (dealerId) {
    where.dealerId = dealerId;
  }

  return prisma.productCategory.findFirst({
    where,
    select: {
      id: true,
      name: true,
      slug: true,
      _count: {
        select: { products: true },
      },
      createdAt: true,
    },
  });
}

// ============ ORDERS ============

export async function getOrders(
  filters: {
    dealerId?: string;
    status?: string;
    search?: string;
  },
  page: number = 1,
  limit: number = 10
): Promise<{ data: OrderListItem[]; total: number }> {
  const where: Record<string, unknown> = {};

  if (filters.dealerId) {
    where.dealerId = filters.dealerId;
  }

  if (filters.status) {
    where.status = filters.status;
  }

  if (filters.search) {
    where.OR = [
      { orderNumber: { contains: filters.search } },
      { customerName: { contains: filters.search } },
      { customerEmail: { contains: filters.search } },
      { customerPhone: { contains: filters.search } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.shopOrder.findMany({
      where,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        customerEmail: true,
        customerPhone: true,
        status: true,
        paymentStatus: true,
        total: true,
        _count: {
          select: { items: true },
        },
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.shopOrder.count({ where }),
  ]);

  return { data, total };
}

export async function getOrderById(
  orderId: string,
  dealerId?: string
): Promise<OrderDetail | null> {
  const where: Record<string, unknown> = { id: orderId };
  if (dealerId) {
    where.dealerId = dealerId;
  }

  return prisma.shopOrder.findFirst({
    where,
    select: {
      id: true,
      orderNumber: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      shippingAddress: true,
      status: true,
      paymentStatus: true,
      subtotal: true,
      shippingCost: true,
      total: true,
      notes: true,
      items: {
        select: {
          id: true,
          quantity: true,
          unitPrice: true,
          total: true,
          product: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          variant: {
            select: {
              id: true,
              size: true,
              color: true,
            },
          },
        },
      },
      student: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
      createdAt: true,
      updatedAt: true,
    },
  });
}

// ============ STATS ============

export async function getProductStats(dealerId: string): Promise<{
  totalProducts: number;
  activeProducts: number;
  totalCategories: number;
  lowStockVariants: number;
}> {
  const [totalProducts, activeProducts, totalCategories, lowStockVariants] =
    await Promise.all([
      prisma.product.count({ where: { dealerId } }),
      prisma.product.count({ where: { dealerId, isActive: true } }),
      prisma.productCategory.count({ where: { dealerId } }),
      prisma.productVariant.count({
        where: {
          product: { dealerId },
          stock: { lte: 5 },
        },
      }),
    ]);

  return {
    totalProducts,
    activeProducts,
    totalCategories,
    lowStockVariants,
  };
}

export async function getOrderStats(dealerId: string): Promise<{
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
}> {
  const [totalOrders, pendingOrders, revenueResult] = await Promise.all([
    prisma.shopOrder.count({ where: { dealerId } }),
    prisma.shopOrder.count({ where: { dealerId, status: "PENDING" } }),
    prisma.shopOrder.aggregate({
      where: { dealerId, paymentStatus: "PAID" },
      _sum: { total: true },
    }),
  ]);

  return {
    totalOrders,
    pendingOrders,
    totalRevenue: revenueResult._sum.total || 0,
  };
}
