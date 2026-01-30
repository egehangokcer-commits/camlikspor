import { prisma } from "@/lib/prisma";
import type { SubDealerListItem } from "@/lib/types";

export interface SubDealerFilters {
  parentDealerId: string;
  search?: string;
  isActive?: boolean;
}

export interface SubDealerDetail {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  parentDealerId: string | null;
  hierarchyLevel: number;
  inheritParentProducts: boolean;
  canCreateOwnProducts: boolean;
  isActive: boolean;
  customDomain: string | null;
  subdomain: string | null;
  themePresetId: string | null;
  themeSettings: string | null;
  layoutSettings: string | null;
  customCss: string | null;
  createdAt: Date;
  updatedAt: Date;
  parentDealer: {
    id: string;
    name: string;
    slug: string;
  } | null;
  _count: {
    subDealers: number;
    products: number;
    orders: number;
    users: number;
  };
}

export async function getSubDealers(
  filters: SubDealerFilters,
  page: number = 1,
  limit: number = 10
): Promise<{ data: SubDealerListItem[]; total: number }> {
  const { parentDealerId, search, isActive } = filters;

  const where: Record<string, unknown> = {
    parentDealerId,
  };

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { slug: { contains: search } },
      { email: { contains: search } },
    ];
  }

  if (isActive !== undefined) {
    where.isActive = isActive;
  }

  const [data, total] = await Promise.all([
    prisma.dealer.findMany({
      where,
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isActive: true,
        hierarchyLevel: true,
        inheritParentProducts: true,
        canCreateOwnProducts: true,
        customDomain: true,
        subdomain: true,
        createdAt: true,
        _count: {
          select: {
            subDealers: true,
            products: true,
            orders: true,
          },
        },
      },
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    prisma.dealer.count({ where }),
  ]);

  return { data, total };
}

export async function getSubDealerById(
  subDealerId: string,
  parentDealerId: string
): Promise<SubDealerDetail | null> {
  const subDealer = await prisma.dealer.findFirst({
    where: {
      id: subDealerId,
      parentDealerId,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      email: true,
      phone: true,
      address: true,
      parentDealerId: true,
      hierarchyLevel: true,
      inheritParentProducts: true,
      canCreateOwnProducts: true,
      isActive: true,
      customDomain: true,
      subdomain: true,
      themePresetId: true,
      themeSettings: true,
      layoutSettings: true,
      customCss: true,
      createdAt: true,
      updatedAt: true,
      parentDealer: {
        select: {
          id: true,
          name: true,
          slug: true,
        },
      },
      _count: {
        select: {
          subDealers: true,
          products: true,
          orders: true,
          users: true,
        },
      },
    },
  });

  return subDealer;
}

export async function getSubDealerHierarchy(
  dealerId: string
): Promise<SubDealerListItem[]> {
  const getAllSubDealers = async (
    parentId: string,
    level: number = 0
  ): Promise<SubDealerListItem[]> => {
    const subDealers = await prisma.dealer.findMany({
      where: { parentDealerId: parentId },
      select: {
        id: true,
        name: true,
        slug: true,
        logo: true,
        isActive: true,
        hierarchyLevel: true,
        inheritParentProducts: true,
        canCreateOwnProducts: true,
        customDomain: true,
        subdomain: true,
        createdAt: true,
        _count: {
          select: {
            subDealers: true,
            products: true,
            orders: true,
          },
        },
      },
      orderBy: { name: "asc" },
    });

    const result: SubDealerListItem[] = [];

    for (const dealer of subDealers) {
      result.push(dealer);
      const children = await getAllSubDealers(dealer.id, level + 1);
      result.push(...children);
    }

    return result;
  };

  return getAllSubDealers(dealerId);
}

export async function getSubDealerStats(parentDealerId: string): Promise<{
  totalSubDealers: number;
  activeSubDealers: number;
  totalProducts: number;
  totalOrders: number;
}> {
  const subDealers = await prisma.dealer.findMany({
    where: { parentDealerId },
    select: {
      isActive: true,
      _count: {
        select: {
          products: true,
          orders: true,
        },
      },
    },
  });

  return {
    totalSubDealers: subDealers.length,
    activeSubDealers: subDealers.filter((d) => d.isActive).length,
    totalProducts: subDealers.reduce((sum, d) => sum + d._count.products, 0),
    totalOrders: subDealers.reduce((sum, d) => sum + d._count.orders, 0),
  };
}

export async function checkSubDealerSlugExists(
  slug: string,
  excludeId?: string
): Promise<boolean> {
  const existing = await prisma.dealer.findFirst({
    where: {
      slug,
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  return !!existing;
}
