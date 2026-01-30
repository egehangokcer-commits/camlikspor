import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { match as matchLocale } from "@formatjs/intl-localematcher";
import Negotiator from "negotiator";
import { i18n } from "@/lib/i18n/config";

// Edge-compatible auth (no Prisma)
const { auth } = NextAuth(authConfig);

// Main domain for subdomain detection
const MAIN_DOMAIN = process.env.MAIN_DOMAIN || "localhost:3000";

// Protected route prefixes (dashboard routes)
const PROTECTED_ROUTES = [
  "dashboard",
  "students",
  "trainers",
  "groups",
  "branches",
  "locations",
  "facilities",
  "periods",
  "pre-registration",
  "payments",
  "cash",
  "sms",
  "settings",
  "users",
  "audit-logs",
  "reports",
  "products",
  "orders",
  "gallery-admin",
  "sub-dealers",
  "customization",
  "commissions",
];

// Auth routes
const AUTH_ROUTES = ["login", "forgot-password"];

// Domain detection helper
function getDealerFromHost(host: string): {
  type: "custom" | "subdomain" | null;
  value: string | null;
} {
  // Remove port if present
  const hostWithoutPort = host.split(":")[0];
  const mainDomainWithoutPort = MAIN_DOMAIN.split(":")[0];

  // Skip localhost and main domain
  if (
    hostWithoutPort === "localhost" ||
    hostWithoutPort === mainDomainWithoutPort ||
    hostWithoutPort === `www.${mainDomainWithoutPort}`
  ) {
    return { type: null, value: null };
  }

  // Check for custom domain (not ending with main domain)
  if (!hostWithoutPort.endsWith(mainDomainWithoutPort)) {
    return { type: "custom", value: hostWithoutPort };
  }

  // Check for subdomain (e.g., bayiadi.example.com)
  const subdomain = hostWithoutPort.replace(`.${mainDomainWithoutPort}`, "");
  if (subdomain && subdomain !== "www" && subdomain !== "app") {
    return { type: "subdomain", value: subdomain };
  }

  return { type: null, value: null };
}

function getLocale(request: NextRequest): string {
  const negotiatorHeaders: Record<string, string> = {};
  request.headers.forEach((value, key) => {
    negotiatorHeaders[key] = value;
  });

  const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
  try {
    return matchLocale(languages, i18n.locales, i18n.defaultLocale);
  } catch {
    return i18n.defaultLocale;
  }
}

// Check if a route is protected (requires auth)
function isProtectedRoute(pathAfterLocale: string): boolean {
  const firstSegment = pathAfterLocale.split("/")[0];
  return PROTECTED_ROUTES.includes(firstSegment);
}

// Check if a route is an auth page
function isAuthRoute(pathAfterLocale: string): boolean {
  const firstSegment = pathAfterLocale.split("/")[0];
  return AUTH_ROUTES.includes(firstSegment);
}

// Security headers
const securityHeaders = {
  "X-Frame-Options": "DENY",
  "X-Content-Type-Options": "nosniff",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin",
  "Permissions-Policy": "camera=(), microphone=(), geolocation=()",
};

export default auth(async function middleware(request) {
  const pathname = request.nextUrl.pathname;
  const host = request.headers.get("host") || "";

  // Skip static files and API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname.startsWith("/favicon")
  ) {
    return NextResponse.next();
  }

  // Domain-based dealer detection
  const dealerDetection = getDealerFromHost(host);

  // If custom domain or subdomain detected, add headers for downstream use
  if (dealerDetection.type && dealerDetection.value) {
    const locale = getLocale(request);

    // For root path on custom domain, redirect to the shop
    if (pathname === "/" || pathname === `/${locale}`) {
      // Set dealer info in headers and let the page handle it
      const response = NextResponse.next();
      response.headers.set("x-dealer-domain", dealerDetection.value);
      response.headers.set("x-dealer-domain-type", dealerDetection.type);
      Object.entries(securityHeaders).forEach(([key, value]) => {
        response.headers.set(key, value);
      });
      return response;
    }

    // For other paths, add headers
    const response = NextResponse.next();
    response.headers.set("x-dealer-domain", dealerDetection.value);
    response.headers.set("x-dealer-domain-type", dealerDetection.type);
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Handle root path (no custom domain) - redirect to public shop
  if (pathname === "/") {
    const locale = getLocale(request);
    // Redirect to public homepage (e-commerce)
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Check if pathname has locale
  const pathnameHasLocale = i18n.locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Redirect to locale if missing
  if (!pathnameHasLocale) {
    const locale = getLocale(request);
    const newUrl = new URL(`/${locale}${pathname}`, request.url);
    newUrl.search = request.nextUrl.search;
    return NextResponse.redirect(newUrl);
  }

  // Get current locale from path
  const currentLocale = pathname.split("/")[1];
  const pathAfterLocale = pathname.slice(currentLocale.length + 2); // e.g., "dashboard" or "akademi-x/shop"

  // Handle locale-only path (e.g., /tr, /en) - show public homepage
  if (pathname === `/${currentLocale}`) {
    // Let the public homepage render
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Get session from auth wrapper
  const session = request.auth;
  const isProtected = isProtectedRoute(pathAfterLocale);
  const isAuth = isAuthRoute(pathAfterLocale);

  // Public routes (dealer landing pages, shop, etc.) - allow without auth
  if (!isProtected && !isAuth) {
    const response = NextResponse.next();
    Object.entries(securityHeaders).forEach(([key, value]) => {
      response.headers.set(key, value);
    });
    return response;
  }

  // Redirect unauthenticated users to login (for protected routes)
  if (!session && isProtected) {
    const loginUrl = new URL(`/${currentLocale}/login`, request.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect authenticated users away from auth pages
  if (session && isAuth) {
    return NextResponse.redirect(
      new URL(`/${currentLocale}/dashboard`, request.url)
    );
  }

  // Add security headers
  const response = NextResponse.next();
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value);
  });

  return response;
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|icons|manifest).*)"],
};
