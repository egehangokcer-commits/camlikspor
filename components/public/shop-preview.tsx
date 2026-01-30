import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, ShoppingBag } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images?: string | null; // JSON array
  category: {
    name: string;
  };
}

interface ShopPreviewProps {
  products: Product[];
  dealerSlug: string;
  locale: string;
  dictionary: {
    title: string;
    viewAll: string;
    currency: string;
  };
  useRootPaths?: boolean;
}

export function ShopPreview({
  products,
  dealerSlug,
  locale,
  dictionary,
  useRootPaths = false,
}: ShopPreviewProps) {
  const basePath = useRootPaths ? `/${locale}` : `/${locale}/${dealerSlug}`;
  if (products.length === 0) {
    return null;
  }

  // Show max 4 products
  const displayProducts = products.slice(0, 4);

  const getFirstImage = (imagesJson: string | null | undefined): string | null => {
    if (!imagesJson) return null;
    try {
      const images = JSON.parse(imagesJson);
      return Array.isArray(images) && images.length > 0 ? images[0] : null;
    } catch {
      return null;
    }
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-3">
            <ShoppingBag className="h-8 w-8 text-primary" />
            <h2 className="text-3xl md:text-4xl font-bold">{dictionary.title}</h2>
          </div>
          <Link href={`${basePath}/shop`}>
            <Button variant="outline">
              {dictionary.viewAll}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 grid-cols-2 md:grid-cols-4">
          {displayProducts.map((product) => {
            const imageUrl = getFirstImage(product.images);
            return (
              <Link
                key={product.id}
                href={`${basePath}/shop/${product.slug}`}
              >
                <Card className="group h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 overflow-hidden">
                  <div className="aspect-square relative bg-muted">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product.name}
                        fill
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <ShoppingBag className="h-12 w-12 text-muted-foreground/30" />
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3" variant="secondary">
                      {product.category.name}
                    </Badge>
                  </div>
                  <CardContent className="p-4">
                    <h3 className="font-semibold text-sm line-clamp-2 mb-2 group-hover:text-primary transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-lg font-bold text-primary">
                      {formatPrice(product.price)}
                    </p>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}
