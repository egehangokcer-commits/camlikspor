"use client";

import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ShoppingCart,
  Menu,
  X,
  Phone,
  Mail,
  Search,
  User,
  Heart,
  ChevronDown,
  ShoppingBag,
  Store,
  ImageIcon,
  MessageCircle,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useCart } from "@/lib/contexts/cart-context";

interface PublicHeaderProps {
  dealerSlug: string;
  dealerName: string;
  dealerLogo?: string | null;
  locale: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  dictionary: {
    shop: string;
    gallery: string;
    contact: string;
    cart: string;
  };
  useRootPaths?: boolean;
}

export function PublicHeader({
  dealerSlug,
  dealerName,
  dealerLogo,
  locale,
  contactPhone,
  contactEmail,
  dictionary,
  useRootPaths = false,
}: PublicHeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { totalItems } = useCart();

  // Build paths based on whether we're using root paths or dealer-specific paths
  const basePath = useRootPaths ? `/${locale}` : `/${locale}/${dealerSlug}`;

  const navLinks = [
    { href: basePath, label: "Ana Sayfa", icon: Store },
    { href: `${basePath}/shop`, label: "Mağaza", icon: ShoppingBag },
    { href: `${basePath}/gallery`, label: "Galeri", icon: ImageIcon },
    { href: `${basePath}#contact`, label: "İletişim", icon: MessageCircle },
  ];

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <>
      {/* Top Bar */}
      <div className="hidden md:block bg-slate-900 text-white py-2">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <Phone className="h-4 w-4" />
                  <span>{contactPhone}</span>
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-2 hover:text-blue-400 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  <span>{contactEmail}</span>
                </a>
              )}
            </div>
            <div className="flex items-center gap-4">
              <span className="text-slate-400">Ücretsiz Kargo | Güvenli Ödeme</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-300 ${
          isScrolled
            ? "bg-white/95 dark:bg-slate-900/95 backdrop-blur-lg shadow-lg"
            : "bg-white dark:bg-slate-900"
        }`}
      >
        <div className="container mx-auto px-4">
          <div className="flex h-20 items-center justify-between">
            {/* Logo */}
            <Link href={basePath} className="flex items-center gap-3 group">
              {dealerLogo ? (
                <div className="relative w-12 h-12 rounded-xl overflow-hidden shadow-md group-hover:shadow-lg transition-shadow">
                  <Image
                    src={dealerLogo}
                    alt={dealerName}
                    fill
                    className="object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 text-white font-bold text-xl shadow-md group-hover:shadow-lg transition-shadow">
                  {dealerName.charAt(0)}
                </div>
              )}
              <div className="hidden sm:block">
                <span className="font-bold text-xl text-slate-900 dark:text-white group-hover:text-blue-600 transition-colors">
                  {dealerName}
                </span>
                <p className="text-xs text-slate-500">Resmi Mağaza</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="group relative px-4 py-2 rounded-lg text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all"
                  >
                    <span className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      {link.label}
                    </span>
                    <span className="absolute inset-x-4 -bottom-0.5 h-0.5 bg-blue-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left" />
                  </Link>
                );
              })}
            </nav>

            {/* Right Actions */}
            <div className="flex items-center gap-2">
              {/* Search Button */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Search className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Button>

              {/* Wishlist */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <Heart className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Button>

              {/* Cart */}
              <Link href={`${basePath}/cart`}>
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative h-10 w-10 rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20 group"
                >
                  <ShoppingCart className="h-5 w-5 text-slate-600 dark:text-slate-400 group-hover:text-blue-600 transition-colors" />
                  {totalItems > 0 && (
                    <Badge className="absolute -right-1 -top-1 h-5 w-5 flex items-center justify-center p-0 bg-blue-600 hover:bg-blue-600 text-[10px] font-bold animate-in zoom-in duration-200">
                      {totalItems > 9 ? "9+" : totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>

              {/* User Account */}
              <Button
                variant="ghost"
                size="icon"
                className="hidden md:flex h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                <User className="h-5 w-5 text-slate-600 dark:text-slate-400" />
              </Button>

              {/* Mobile Menu Toggle */}
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden h-10 w-10 rounded-full"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                {isMobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </Button>
            </div>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div
          className={`lg:hidden overflow-hidden transition-all duration-300 ${
            isMobileMenuOpen ? "max-h-96 border-t" : "max-h-0"
          }`}
        >
          <nav className="container mx-auto px-4 py-4 space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-600 transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Icon className="h-5 w-5" />
                  {link.label}
                </Link>
              );
            })}

            {/* Mobile Contact Info */}
            <div className="pt-4 mt-4 border-t space-y-3">
              {contactPhone && (
                <a
                  href={`tel:${contactPhone}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Phone className="h-4 w-4" />
                  {contactPhone}
                </a>
              )}
              {contactEmail && (
                <a
                  href={`mailto:${contactEmail}`}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-slate-600 dark:text-slate-400"
                >
                  <Mail className="h-4 w-4" />
                  {contactEmail}
                </a>
              )}
            </div>
          </nav>
        </div>
      </header>
    </>
  );
}
