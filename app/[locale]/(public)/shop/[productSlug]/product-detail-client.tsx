"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import {
  ShoppingCart,
  Minus,
  Plus,
  ChevronLeft,
  ChevronRight,
  Package,
  Truck,
  Shield,
  RotateCcw,
  Heart,
  Share2,
  Check,
  Home,
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

interface ProductDetailClientProps {
  product: Product;
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

export function ProductDetailClient({
  product,
  locale,
}: ProductDetailClientProps) {
  const router = useRouter();
  const { addItem } = useCart();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [isWishlisted, setIsWishlisted] = useState(false);

  // Parse images
  const images: string[] = product.images
    ? JSON.parse(product.images)
    : [];

  // Get unique sizes and colors
  const sizes = [...new Set(product.variants.map((v) => v.size))];
  const colors = [...new Set(product.variants.filter((v) => v.color).map((v) => v.color!))];

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
      toast.error("Lütfen geçerli bir varyant seçin");
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

    toast.success("Ürün sepete eklendi!", {
      action: {
        label: "Sepeti Gör",
        onClick: () => router.push(`/${locale}/cart`),
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
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Breadcrumb */}
      <div className="bg-white dark:bg-slate-800 border-b">
        <div className="container mx-auto px-4 py-3">
          <nav className="flex items-center gap-2 text-sm text-muted-foreground">
            <Link href={`/${locale}`} className="hover:text-foreground flex items-center gap-1">
              <Home className="h-4 w-4" />
              Ana Sayfa
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link href={`/${locale}/shop`} className="hover:text-foreground">
              Mağaza
            </Link>
            <ChevronRight className="h-4 w-4" />
            <Link
              href={`/${locale}/shop?category=${product.category.slug}`}
              className="hover:text-foreground"
            >
              {product.category.name}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span className="text-foreground font-medium truncate max-w-[200px]">{product.name}</span>
          </nav>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-2">
          {/* Image Gallery */}
          <div className="space-y-4">
            {/* Main Image */}
            <Card className="border-0 shadow-xl overflow-hidden">
              <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800">
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
                    <Package className="h-32 w-32 text-slate-300" />
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
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() =>
                        setSelectedImageIndex(
                          selectedImageIndex === images.length - 1 ? 0 : selectedImageIndex + 1
                        )
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-slate-800/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-slate-700 transition-colors"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </>
                )}

                {/* Image Counter */}
                {images.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                    {selectedImageIndex + 1} / {images.length}
                  </div>
                )}
              </div>
            </Card>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2">
                {images.map((img, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`flex-shrink-0 w-24 h-24 rounded-xl overflow-hidden border-2 transition-all ${
                      index === selectedImageIndex
                        ? "border-blue-600 shadow-lg shadow-blue-600/25"
                        : "border-transparent hover:border-slate-300"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`${product.name} - ${index + 1}`}
                      width={96}
                      height={96}
                      className="object-cover w-full h-full"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="space-y-6">
            {/* Header */}
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Badge className="bg-blue-600 hover:bg-blue-600">{product.category.name}</Badge>
                {!isOutOfStock && (
                  <Badge variant="outline" className="text-emerald-600 border-emerald-200 bg-emerald-50">
                    <Check className="h-3 w-3 mr-1" />
                    Stokta Var
                  </Badge>
                )}
              </div>
              <h1 className="text-3xl md:text-4xl font-bold mb-4">{product.name}</h1>
              <p className="text-4xl font-bold text-blue-600">
                {formatPrice(product.price)}
              </p>
            </div>

            {product.description && (
              <div>
                <h2 className="font-semibold text-lg mb-2">Ürün Açıklaması</h2>
                <p className="text-muted-foreground leading-relaxed">{product.description}</p>
              </div>
            )}

            <Separator />

            {/* Variants */}
            <Card className="border-0 shadow-lg">
              <CardContent className="p-6 space-y-6">
                {/* Size Selection */}
                {sizes.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Beden Seçimi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {sizes.map((size) => {
                        const variant = product.variants.find((v) => v.size === size);
                        const stock = variant?.stock || 0;
                        const isSelected = selectedVariant?.size === size;
                        return (
                          <button
                            key={size}
                            onClick={() => handleSizeChange(size)}
                            disabled={stock === 0}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : stock === 0
                                ? "border-slate-200 text-slate-300 cursor-not-allowed line-through"
                                : "border-slate-200 hover:border-blue-600 hover:text-blue-600"
                            }`}
                          >
                            {size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Color Selection */}
                {colors.length > 0 && (
                  <div>
                    <label className="text-sm font-semibold mb-3 block">
                      Renk Seçimi
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {colors.map((color) => {
                        const isSelected = selectedVariant?.color === color;
                        return (
                          <button
                            key={color}
                            onClick={() => handleColorChange(color)}
                            className={`px-4 py-2 rounded-lg border-2 font-medium transition-all ${
                              isSelected
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-200 hover:border-blue-600 hover:text-blue-600"
                            }`}
                          >
                            {color}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Quantity */}
                <div>
                  <label className="text-sm font-semibold mb-3 block">
                    Adet
                  </label>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center border-2 border-slate-200 rounded-lg overflow-hidden">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        disabled={quantity <= 1}
                        className="rounded-none"
                      >
                        <Minus className="h-4 w-4" />
                      </Button>
                      <span className="text-lg font-semibold w-14 text-center">
                        {quantity}
                      </span>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setQuantity(Math.min(maxQuantity, quantity + 1))}
                        disabled={quantity >= maxQuantity}
                        className="rounded-none"
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                    {selectedVariant && (
                      <span className="text-sm text-muted-foreground">
                        {selectedVariant.stock} adet stokta
                      </span>
                    )}
                  </div>
                </div>

                <Separator />

                {/* Add to Cart */}
                <div className="flex gap-3">
                  <Button
                    size="lg"
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-lg py-6"
                    onClick={handleAddToCart}
                    disabled={isOutOfStock}
                  >
                    <ShoppingCart className="mr-2 h-5 w-5" />
                    {isOutOfStock ? "Stokta Yok" : "Sepete Ekle"}
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="py-6"
                    onClick={() => setIsWishlisted(!isWishlisted)}
                  >
                    <Heart className={`h-5 w-5 ${isWishlisted ? "fill-red-500 text-red-500" : ""}`} />
                  </Button>
                  <Button size="lg" variant="outline" className="py-6">
                    <Share2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Features */}
            <div className="grid grid-cols-3 gap-4">
              <Card className="border-0 shadow-md p-4 text-center">
                <Truck className="h-6 w-6 mx-auto mb-2 text-blue-600" />
                <p className="text-xs font-medium">Ücretsiz Kargo</p>
              </Card>
              <Card className="border-0 shadow-md p-4 text-center">
                <Shield className="h-6 w-6 mx-auto mb-2 text-emerald-600" />
                <p className="text-xs font-medium">Güvenli Ödeme</p>
              </Card>
              <Card className="border-0 shadow-md p-4 text-center">
                <RotateCcw className="h-6 w-6 mx-auto mb-2 text-amber-600" />
                <p className="text-xs font-medium">Kolay İade</p>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
