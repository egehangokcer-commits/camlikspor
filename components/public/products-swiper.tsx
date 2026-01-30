"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Heart, Eye } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: number;
  images: string | null;
  category: {
    name: string;
  };
}

interface ProductsSwiperProps {
  products: Product[];
  locale: string;
}

export function ProductsSwiper({ products, locale }: ProductsSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  // Start autoplay manually after mount
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  }, []);

  const getFirstImage = (imagesJson: string | null): string | null => {
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

  // Duplicate products if less than 8 for smooth infinite loop
  const extendedProducts = products.length < 8
    ? [...products, ...products]
    : products;

  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      modules={[Autoplay]}
      spaceBetween={24}
      slidesPerView={1}
      loop={true}
      speed={800}
      autoplay={{
        delay: 3500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        480: {
          slidesPerView: 2,
          spaceBetween: 16,
        },
        768: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      }}
      className="py-4"
    >
      {extendedProducts.map((product, index) => {
        const imageUrl = getFirstImage(product.images);
        return (
          <SwiperSlide key={`${product.id}-${index}`}>
            <Link href={`/${locale}/shop/${product.slug}`} className="block">
              <Card className="group h-full border-0 shadow-md hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 overflow-hidden bg-white dark:bg-slate-800 cursor-pointer">
                <div className="aspect-square relative bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-700 dark:to-slate-800 overflow-hidden">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt={product.name}
                      fill
                      className="object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  ) : (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <ShoppingBag className="h-16 w-16 text-slate-300" />
                    </div>
                  )}

                  {/* Category Badge */}
                  <Badge className="absolute top-3 left-3 bg-blue-600 hover:bg-blue-600 shadow-lg">
                    {product.category.name}
                  </Badge>

                  {/* Hover Actions */}
                  <div className="absolute top-3 right-3 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-4 group-hover:translate-x-0">
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full shadow-lg"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                    <Button
                      size="icon"
                      variant="secondary"
                      className="h-9 w-9 rounded-full shadow-lg"
                      onClick={(e) => e.preventDefault()}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Quick Add */}
                  <div className="absolute inset-x-4 bottom-4 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-4 group-hover:translate-y-0">
                    <Button
                      className="w-full bg-blue-600 hover:bg-blue-700 shadow-lg"
                      onClick={(e) => e.preventDefault()}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" />
                      Sepete Ekle
                    </Button>
                  </div>
                </div>

                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground mb-1 uppercase tracking-wide">
                    {product.category.name}
                  </p>
                  <h3 className="font-semibold line-clamp-2 mb-2 group-hover:text-blue-600 transition-colors">
                    {product.name}
                  </h3>
                  <p className="text-xl font-bold text-blue-600">
                    {formatPrice(product.price)}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </SwiperSlide>
        );
      })}
    </Swiper>
  );
}
