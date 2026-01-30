"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag } from "lucide-react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";

// Swiper styles
import "swiper/css";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

interface CategoriesSwiperProps {
  categories: Category[];
  locale: string;
}

export function CategoriesSwiper({ categories, locale }: CategoriesSwiperProps) {
  const swiperRef = useRef<SwiperType | null>(null);

  // Start autoplay manually after mount
  useEffect(() => {
    if (swiperRef.current && swiperRef.current.autoplay) {
      swiperRef.current.autoplay.start();
    }
  }, []);

  // Duplicate categories if less than 6 for smooth infinite loop
  const extendedCategories = categories.length < 6
    ? [...categories, ...categories, ...categories]
    : categories;

  return (
    <Swiper
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      modules={[Autoplay]}
      spaceBetween={20}
      slidesPerView={2}
      loop={true}
      speed={800}
      autoplay={{
        delay: 2500,
        disableOnInteraction: false,
        pauseOnMouseEnter: true,
      }}
      breakpoints={{
        480: {
          slidesPerView: 2,
          spaceBetween: 16,
        },
        640: {
          slidesPerView: 3,
          spaceBetween: 20,
        },
        768: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
        1024: {
          slidesPerView: 4,
          spaceBetween: 24,
        },
      }}
      className="py-4"
    >
      {extendedCategories.map((category, index) => (
        <SwiperSlide key={`${category.id}-${index}`}>
          <Link href={`/${locale}/shop?category=${category.slug}`} className="block">
            <Card className="h-full border-0 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-2 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 group cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-110 transition-transform duration-300">
                  <ShoppingBag className="h-8 w-8 text-white" />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-blue-600 transition-colors">
                  {category.name}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {category._count.products} ürün
                </p>
              </CardContent>
            </Card>
          </Link>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
