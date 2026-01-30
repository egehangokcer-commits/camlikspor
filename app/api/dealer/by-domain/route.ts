import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Cache dealer lookups for 5 minutes
const CACHE_TTL = 300;

// Default dealer slug for main website
const DEFAULT_DEALER_SLUG = process.env.DEFAULT_DEALER_SLUG || "demo-spor-kulubu";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const domain = searchParams.get("domain");

  try {
    let dealer: { id: string; slug: string; name: string } | null = null;

    // If domain provided, look up by domain
    if (domain) {
      // First check Dealer table for customDomain or subdomain
      dealer = await prisma.dealer.findFirst({
        where: {
          OR: [
            { customDomain: domain },
            { subdomain: domain },
          ],
          isActive: true,
          isPublicPageActive: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      });

      // If not found, check DealerDomain table
      if (!dealer) {
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
                name: true,
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
          dealer = {
            id: dealerDomain.dealer.id,
            slug: dealerDomain.dealer.slug,
            name: dealerDomain.dealer.name,
          };
        }
      }
    }

    // If no domain or dealer not found by domain, return default dealer
    if (!dealer) {
      dealer = await prisma.dealer.findUnique({
        where: {
          slug: DEFAULT_DEALER_SLUG,
          isActive: true,
          isPublicPageActive: true,
        },
        select: {
          id: true,
          slug: true,
          name: true,
        },
      });
    }

    if (!dealer) {
      return NextResponse.json(
        { error: "Dealer not found" },
        { status: 404 }
      );
    }

    const response = NextResponse.json(dealer);

    // Set cache headers
    response.headers.set(
      "Cache-Control",
      `public, s-maxage=${CACHE_TTL}, stale-while-revalidate=${CACHE_TTL * 2}`
    );

    return response;
  } catch (error) {
    console.error("Domain lookup error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
