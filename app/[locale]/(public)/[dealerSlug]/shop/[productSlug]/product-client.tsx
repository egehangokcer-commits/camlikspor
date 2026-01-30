"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { useCart } from "@/lib/contexts/cart-context";

interface ProductVariant {
  id: string;
  size: string;
  color: string | null;
  stock: number;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  images: string | null;
  category: {
    name: string;
    slug: string;
  };
  variants: ProductVariant[];
}

interface ProductPageClientProps {
  product: Product;
  dealerSlug: string;
  locale: string;
  dictionary: {
    addToCart: string;
    outOfStock: string;
    size: string;
    color: string;
    quantity: string;
    inStock: string;
    description: string;
    selectSize: string;
    addedToCart: string;
    viewCart: string;
  };
}

export function ProductPageClient({
  product,
  dealerSlug,
  locale,
  dictionary,
}: ProductPageClientProps) {
  const router = useRouter();
  const { addItem, setDealerSlug } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);

  // Parse images
  const images: string[] = product.images
    ? JSON.parse(product.images)
    : [];

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.filter((v) => v.color).map((v) => v.color!))];

  // Set dealer slug for cart
  useEffect(() => {
    setDealerSlug(dealerSlug);
  }, [dealerSlug, setDealerSlug]);

  // Auto-select first available variant
  useEffect(() => {
    const availableVariant = product.variants.find((v) => v.stock > 0);
    if (availableVariant) {
      setSelectedVariant(availableVariant);
    }
  }, [product.variants]);

  const handleSizeChange = (size: string) => {
    const variant = product.variants.find(
      (v) => v.size === size && (colors.length === 0 || v.color === selectedVariant?.color)
    );
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const handleColorChange = (color: string) => {
    const variant = product.variants.find(
      (v) => v.color === color && v.size === selectedVariant?.size
    );
    setSelectedVariant(variant || null);
    setQuantity(1);
  };

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock < quantity) {
      toast.error("Lutfen gecerli bir varyant secin");
      return;
    }

    addItem({
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      price: product.price,
      quantity,
      size: selectedVariant.size,
      color: selectedVariant.color || undefined,
      image: images[0],
    });

    toast.success(dictionary.addedToCart, {
      action: {
        label: dictionary.viewCart,
        onClick: () => router.push(`/${locale}/${dealerSlug}/shop/cart`),
      },
    });
  };

  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const isOutOfStock = !selectedVariant || selectedVariant.stock === 0;
  const maxQuantity = selectedVariant?.stock || 1;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-6 text-sm text-muted-foreground">
        <Link href={`/${locale}/${dealerSlug}/shop`} className="hover:text-foreground">
          Magaza
        </Link>
        <span className="mx-2">/</span>
        <Link
          href={`/${locale}/${dealerSlug}/shop?category=${product.category.slug}`}
          className="hover:text-foreground"
        >
          {product.category.name}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{product.name}</span>
      </nav>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Image Gallery */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="aspect-square relative bg-muted rounded-lg overflow-hidden">
            {images.length > 0 ? (
              <Image
                src={images[selectedImageIndex]}
                alt={product.name}
                fill
                className="object-cover"
                priority
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <Package className="h-24 w-24 text-muted-foreground/30" />
              </div>
            )}
            {/* Navigation arrows */}
            {images.length > 1 && (
              <>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === 0 ? images.length - 1 : selectedImageIndex - 1
                    )
                  }
                  className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>
                <button
                  onClick={() =>
                    setSelectedImageIndex(
                      selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                    )
                  }
                  className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/80 rounded-full p-2 hover:bg-white"
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            )}
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((img, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImageIndex(index)}
                  className={`flex-shrink-0 w-20 h-20 rounded-md overflow-hidden border-2 ${
                    index === selectedImageIndex
                      ? "border-primary"
                      : "border-transparent"
                  }`}
                >
                  <Image
                    src={img}
                    alt={`${product.name} - ${index + 1}`}
                    width={80}
                    height={80}
                    className="object-cover w-full h-full"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <Badge variant="secondary" className="mb-2">
              {product.category.name}
            </Badge>
            <h1 className="text-3xl font-bold">{product.name}</h1>
            <p className="text-3xl font-bold text-primary mt-2">
              {formatPrice(product.price)}
            </p>
          </div>

          {product.description && (
            <div>
              <h2 className="font-semibold mb-2">{dictionary.description}</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
          )}

          <Card>
            <CardContent className="p-4 space-y-4">
              {/* Size Selection */}
              {sizes.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {dictionary.size}
                  </label>
                  <Select
                    value={selectedVariant?.size}
                    onValueChange={handleSizeChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={dictionary.selectSize} />
                    </SelectTrigger>
                    <SelectContent>
                      {sizes.map((size) => {
                        const variant = product.variants.find((v) => v.size === size);
                        const stock = variant?.stock || 0;
                        return (
                          <SelectItem
                            key={size}
                            value={size}
                            disabled={stock === 0}
                          >
                            {size} {stock === 0 && `(${dictionary.outOfStock})`}
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Color Selection */}
              {colors.length > 0 && (
                <div>
                  <label className="text-sm font-medium mb-2 block">
                    {dictionary.color}
                  </label>
                  <Select
                    value={selectedVariant?.color || ""}
                    onValueChange={handleColorChange}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Renk Secin" />
                    </SelectTrigger>
                    <SelectContent>
                      {colors.map((color) => (
                        <SelectItem key={color} value={color}>
                          {color}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Quantity */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {dictionary.quantity}
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    disabled={quantity <= 1}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <span className="text-lg font-medium w-12 text-center">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                    disabled={quantity >= maxQuantity}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  {selectedVariant && (
                    <span className="text-sm text-muted-foreground ml-2">
                      ({selectedVariant.stock} {dictionary.inStock})
                    </span>
                  )}
                </div>
              </div>

              {/* Add to Cart */}
              <Button
                size="lg"
                className="w-full"
                onClick={handleAddToCart}
                disabled={isOutOfStock}
              >
                <ShoppingCart className="mr-2 h-5 w-5" />
                {isOutOfStock ? dictionary.outOfStock : dictionary.addToCart}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
