import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Facebook,
  Instagram,
  Twitter,
  Youtube,
  Phone,
  Mail,
  MapPin,
  Send,
  ShieldCheck,
  Truck,
  CreditCard,
  HeadphonesIcon,
  ChevronRight,
} from "lucide-react";

interface PublicFooterProps {
  dealerSlug: string;
  dealerName: string;
  locale: string;
  contactPhone?: string | null;
  contactEmail?: string | null;
  contactAddress?: string | null;
  socialFacebook?: string | null;
  socialInstagram?: string | null;
  socialTwitter?: string | null;
  socialYoutube?: string | null;
  dictionary: {
    shop: string;
    gallery: string;
    contact: string;
    allRightsReserved: string;
    quickLinks: string;
    followUs: string;
  };
  useRootPaths?: boolean;
}

export function PublicFooter({
  dealerSlug,
  dealerName,
  locale,
  contactPhone,
  contactEmail,
  contactAddress,
  socialFacebook,
  socialInstagram,
  socialTwitter,
  socialYoutube,
  dictionary,
  useRootPaths = false,
}: PublicFooterProps) {
  // Build paths based on whether we're using root paths or dealer-specific paths
  const basePath = useRootPaths ? `/${locale}` : `/${locale}/${dealerSlug}`;

  const quickLinks = [
    { href: basePath, label: "Ana Sayfa" },
    { href: `${basePath}/shop`, label: "Mağaza" },
    { href: `${basePath}/gallery`, label: "Galeri" },
    { href: `${basePath}#contact`, label: "İletişim" },
  ];

  const shopLinks = [
    { href: `${basePath}/shop`, label: "Tüm Ürünler" },
    { href: `${basePath}/shop?category=forma`, label: "Formalar" },
    { href: `${basePath}/shop?category=esofman`, label: "Eşofmanlar" },
    { href: `${basePath}/shop?category=aksesuar`, label: "Aksesuarlar" },
  ];

  const hasSocialLinks = socialFacebook || socialInstagram || socialTwitter || socialYoutube;
  const hasContactInfo = contactPhone || contactEmail || contactAddress;

  return (
    <footer className="bg-slate-900 text-white">
      {/* Features Bar */}
      <div className="border-b border-slate-800">
        <div className="container mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600/20 flex items-center justify-center flex-shrink-0">
                <Truck className="h-6 w-6 text-blue-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Ücretsiz Kargo</h4>
                <p className="text-xs text-slate-400">Tüm siparişlerde</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/20 flex items-center justify-center flex-shrink-0">
                <ShieldCheck className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Güvenli Ödeme</h4>
                <p className="text-xs text-slate-400">256-bit SSL</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-600/20 flex items-center justify-center flex-shrink-0">
                <CreditCard className="h-6 w-6 text-amber-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">Taksit İmkanı</h4>
                <p className="text-xs text-slate-400">12 aya kadar</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-purple-600/20 flex items-center justify-center flex-shrink-0">
                <HeadphonesIcon className="h-6 w-6 text-purple-400" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">7/24 Destek</h4>
                <p className="text-xs text-slate-400">Her zaman yanınızda</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          {/* Brand & Newsletter */}
          <div className="lg:col-span-1 space-y-6">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-white font-bold text-xl">
                  {dealerName.charAt(0)}
                </div>
                <span className="text-xl font-bold">{dealerName}</span>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed">
                Profesyonel futbol okulu eğitimi ile geleceğin yıldızlarını yetiştiriyoruz.
                Kaliteli spor malzemeleri ve formalarla sizlere hizmet veriyoruz.
              </p>
            </div>

            {/* Newsletter */}
            <div className="space-y-3">
              <h4 className="font-semibold">Bültenimize Abone Olun</h4>
              <p className="text-xs text-slate-400">
                Yeni ürünler ve kampanyalardan haberdar olun
              </p>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="E-posta adresiniz"
                  className="bg-slate-800 border-slate-700 text-white placeholder:text-slate-500 focus:border-blue-500"
                />
                <Button size="icon" className="bg-blue-600 hover:bg-blue-700 flex-shrink-0">
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Hızlı Bağlantılar</h3>
            <ul className="space-y-3">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Shop Categories */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Mağaza</h3>
            <ul className="space-y-3">
              {shopLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="group flex items-center gap-2 text-sm text-slate-400 hover:text-white transition-colors"
                  >
                    <ChevronRight className="h-4 w-4 text-blue-500 group-hover:translate-x-1 transition-transform" />
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">İletişim</h3>
            {hasContactInfo && (
              <ul className="space-y-4">
                {contactPhone && (
                  <li>
                    <a
                      href={`tel:${contactPhone}`}
                      className="group flex items-start gap-3 text-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">Telefon</span>
                        <span className="text-white font-medium">{contactPhone}</span>
                      </div>
                    </a>
                  </li>
                )}
                {contactEmail && (
                  <li>
                    <a
                      href={`mailto:${contactEmail}`}
                      className="group flex items-start gap-3 text-sm"
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-colors">
                        <Mail className="h-4 w-4" />
                      </div>
                      <div>
                        <span className="text-slate-400 text-xs block">E-posta</span>
                        <span className="text-white font-medium">{contactEmail}</span>
                      </div>
                    </a>
                  </li>
                )}
                {contactAddress && (
                  <li className="flex items-start gap-3 text-sm">
                    <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-slate-400 text-xs block">Adres</span>
                      <span className="text-white">{contactAddress}</span>
                    </div>
                  </li>
                )}
              </ul>
            )}

            {/* Social Links */}
            {hasSocialLinks && (
              <div className="pt-4">
                <h4 className="text-sm font-medium mb-3">Bizi Takip Edin</h4>
                <div className="flex gap-3">
                  {socialFacebook && (
                    <a
                      href={socialFacebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-blue-600 transition-colors"
                    >
                      <Facebook className="h-5 w-5" />
                    </a>
                  )}
                  {socialInstagram && (
                    <a
                      href={socialInstagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 transition-all"
                    >
                      <Instagram className="h-5 w-5" />
                    </a>
                  )}
                  {socialTwitter && (
                    <a
                      href={socialTwitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-sky-500 transition-colors"
                    >
                      <Twitter className="h-5 w-5" />
                    </a>
                  )}
                  {socialYoutube && (
                    <a
                      href={socialYoutube}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center hover:bg-red-600 transition-colors"
                    >
                      <Youtube className="h-5 w-5" />
                    </a>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-1 text-sm text-slate-400">
              <span>&copy; {new Date().getFullYear()} {dealerName}.</span>
              <span>Tüm hakları saklıdır.</span>
            </div>

            {/* Payment Icons */}
            <div className="flex items-center gap-4">
              <span className="text-xs text-slate-500">Güvenli Ödeme:</span>
              <div className="flex items-center gap-2">
                <div className="px-3 py-1.5 bg-slate-800 rounded text-xs font-medium">
                  VISA
                </div>
                <div className="px-3 py-1.5 bg-slate-800 rounded text-xs font-medium">
                  MasterCard
                </div>
                <div className="px-3 py-1.5 bg-slate-800 rounded text-xs font-medium">
                  Troy
                </div>
              </div>
            </div>

            <a
              href="https://cosmos.web.tr"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-400 hover:text-white transition-colors"
            >
              Web Tasarım: <span className="font-semibold">COSMOS</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
