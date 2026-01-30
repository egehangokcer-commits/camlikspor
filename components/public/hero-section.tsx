import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Phone, ChevronDown } from "lucide-react";

interface HeroSectionProps {
  dealerSlug: string;
  dealerName: string;
  heroImage?: string | null;
  heroTitle?: string | null;
  heroSubtitle?: string | null;
  locale: string;
  dictionary: {
    shopCta: string;
    contactCta: string;
  };
  useRootPaths?: boolean;
}

export function HeroSection({
  dealerSlug,
  dealerName,
  heroImage,
  heroTitle,
  heroSubtitle,
  locale,
  dictionary,
  useRootPaths = false,
}: HeroSectionProps) {
  const defaultHeroImage = "/images/hero-default.jpg";
  const backgroundImage = heroImage || defaultHeroImage;
  const basePath = useRootPaths ? `/${locale}` : `/${locale}/${dealerSlug}`;

  return (
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        {heroImage ? (
          <Image
            src={backgroundImage}
            alt={dealerName}
            fill
            className="object-cover"
            priority
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-primary/90 to-primary/60" />
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/50" />
      </div>

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center text-white">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Logo/Badge */}
          <div className="inline-flex items-center gap-2 rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm">
            <span className="h-2 w-2 rounded-full bg-green-400 animate-pulse" />
            Kayitlar Acik
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight">
            {heroTitle || dealerName}
          </h1>

          {/* Subtitle */}
          <p className="text-lg md:text-xl lg:text-2xl text-white/80 max-w-2xl mx-auto">
            {heroSubtitle || "Profesyonel futbol egitimi ile gelecegin yildizlarini yetistiriyoruz."}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-6">
            <Link href={`${basePath}/shop`}>
              <Button size="lg" className="text-lg px-8 py-6">
                <ShoppingBag className="mr-2 h-5 w-5" />
                {dictionary.shopCta}
              </Button>
            </Link>
            <Link href={`${basePath}#contact`}>
              <Button size="lg" variant="outline" className="text-lg px-8 py-6 bg-white/10 backdrop-blur-sm border-white/30 hover:bg-white/20">
                <Phone className="mr-2 h-5 w-5" />
                {dictionary.contactCta}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 animate-bounce">
        <ChevronDown className="h-8 w-8 text-white/60" />
      </div>
    </section>
  );
}
