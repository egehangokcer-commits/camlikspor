import { headers } from "next/headers";
import { prisma } from "@/lib/prisma";

// Default dealer slug for main website (can be configured via env)
const DEFAULT_DEALER_SLUG = process.env.DEFAULT_DEALER_SLUG || "demo-spor-kulubu";

interface PublicDealer {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  heroImage: string | null;
  heroTitle: string | null;
  heroSubtitle: string | null;
  features: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  contactAddress: string | null;
  socialFacebook: string | null;
  socialInstagram: string | null;
  socialTwitter: string | null;
  socialYoutube: string | null;
  themeSettings: string | null;
  layoutSettings: string | null;
  customCss: string | null;
}

/**
 * Get dealer for public pages based on:
 * 1. Custom domain (from middleware headers)
 * 2. Subdomain (from middleware headers)
 * 3. Default dealer (fallback)
 */
export async function getPublicDealer(): Promise<PublicDealer | null> {
  const headersList = await headers();
  const dealerDomain = headersList.get("x-dealer-domain");
  const dealerDomainType = headersList.get("x-dealer-domain-type");

  let dealer: PublicDealer | null = null;

  // Try to find dealer by custom domain or subdomain
  if (dealerDomain && dealerDomainType) {
    if (dealerDomainType === "custom") {
      // Find by custom domain
      dealer = await prisma.dealer.findFirst({
        where: {
          customDomain: dealerDomain,
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
          features: true,
          contactPhone: true,
          contactEmail: true,
          contactAddress: true,
          socialFacebook: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          themeSettings: true,
          layoutSettings: true,
          customCss: true,
        },
      });
    } else if (dealerDomainType === "subdomain") {
      // Find by subdomain
      dealer = await prisma.dealer.findFirst({
        where: {
          subdomain: dealerDomain,
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
          features: true,
          contactPhone: true,
          contactEmail: true,
          contactAddress: true,
          socialFacebook: true,
          socialInstagram: true,
          socialTwitter: true,
          socialYoutube: true,
          themeSettings: true,
          layoutSettings: true,
          customCss: true,
        },
      });
    }
  }

  // Fallback to default dealer
  if (!dealer) {
    dealer = await prisma.dealer.findUnique({
      where: {
        slug: DEFAULT_DEALER_SLUG,
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
        features: true,
        contactPhone: true,
        contactEmail: true,
        contactAddress: true,
        socialFacebook: true,
        socialInstagram: true,
        socialTwitter: true,
        socialYoutube: true,
        themeSettings: true,
        layoutSettings: true,
        customCss: true,
      },
    });
  }

  return dealer;
}

/**
 * Get dealer ID for queries (products, categories, etc.)
 */
export async function getPublicDealerId(): Promise<string | null> {
  const dealer = await getPublicDealer();
  return dealer?.id ?? null;
}
