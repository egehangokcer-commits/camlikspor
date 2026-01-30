import { prisma } from "@/lib/prisma";
import type { DealerDomainInfo, DealerPublicInfo } from "@/lib/types";

export async function getDealerByDomain(
  domain: string
): Promise<{ id: string; slug: string } | null> {
  // First check custom domain
  let dealer = await prisma.dealer.findFirst({
    where: {
      OR: [{ customDomain: domain }, { subdomain: domain }],
      isActive: true,
      isPublicPageActive: true,
    },
    select: {
      id: true,
      slug: true,
    },
  });

  if (dealer) {
    return dealer;
  }

  // Then check DealerDomain table
  const dealerDomain = await prisma.dealerDomain.findFirst({
    where: {
      domain,
      verified: true,
      isActive: true,
    },
    select: {
      dealer: {
        select: {
          id: true,
          slug: true,
          isActive: true,
          isPublicPageActive: true,
        },
      },
    },
  });

  if (
    dealerDomain?.dealer.isActive &&
    dealerDomain?.dealer.isPublicPageActive
  ) {
    return {
      id: dealerDomain.dealer.id,
      slug: dealerDomain.dealer.slug,
    };
  }

  return null;
}

export async function getDealerBySlug(
  slug: string
): Promise<DealerPublicInfo | null> {
  const dealer = await prisma.dealer.findFirst({
    where: {
      slug,
      isActive: true,
      isPublicPageActive: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      logo: true,
      heroImage: true,
      heroTitle: true,
      heroSubtitle: true,
      aboutText: true,
      contactAddress: true,
      contactEmail: true,
      contactPhone: true,
      socialFacebook: true,
      socialInstagram: true,
      socialTwitter: true,
      socialYoutube: true,
      features: true,
      themeSettings: true,
      layoutSettings: true,
      customCss: true,
      faviconUrl: true,
      metaTitle: true,
      metaDescription: true,
      themePreset: true,
    },
  });

  return dealer;
}

export async function getDealerDomains(
  dealerId: string
): Promise<DealerDomainInfo[]> {
  const domains = await prisma.dealerDomain.findMany({
    where: { dealerId },
    orderBy: [{ isPrimary: "desc" }, { createdAt: "desc" }],
  });

  return domains;
}

export async function getDealerDomainById(
  domainId: string,
  dealerId: string
): Promise<DealerDomainInfo | null> {
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      id: domainId,
      dealerId,
    },
  });

  return domain;
}

export async function checkDomainAvailability(
  domain: string,
  excludeId?: string
): Promise<{ available: boolean; reason?: string }> {
  // Check in Dealer table
  const dealerWithDomain = await prisma.dealer.findFirst({
    where: {
      OR: [{ customDomain: domain }, { subdomain: domain }],
      ...(excludeId && { id: { not: excludeId } }),
    },
  });

  if (dealerWithDomain) {
    return { available: false, reason: "Domain is already in use by another dealer" };
  }

  // Check in DealerDomain table
  const existingDomain = await prisma.dealerDomain.findFirst({
    where: {
      domain,
      ...(excludeId && { dealerId: { not: excludeId } }),
    },
  });

  if (existingDomain) {
    return { available: false, reason: "Domain is already registered" };
  }

  return { available: true };
}

export async function getPrimaryDomain(
  dealerId: string
): Promise<DealerDomainInfo | null> {
  const domain = await prisma.dealerDomain.findFirst({
    where: {
      dealerId,
      isPrimary: true,
      verified: true,
      isActive: true,
    },
  });

  return domain;
}

export async function getVerifiedDomains(
  dealerId: string
): Promise<DealerDomainInfo[]> {
  const domains = await prisma.dealerDomain.findMany({
    where: {
      dealerId,
      verified: true,
      isActive: true,
    },
    orderBy: [{ isPrimary: "desc" }, { domain: "asc" }],
  });

  return domains;
}

export function generateVerificationToken(): string {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let token = "";
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

export function getDnsVerificationRecord(
  domain: string,
  token: string
): { type: string; name: string; value: string } {
  return {
    type: "TXT",
    name: `_verify.${domain}`,
    value: `futbol-okullari-verify=${token}`,
  };
}

export function getFileVerificationPath(token: string): {
  path: string;
  content: string;
} {
  return {
    path: `/.well-known/futbol-okullari-verify.txt`,
    content: token,
  };
}
