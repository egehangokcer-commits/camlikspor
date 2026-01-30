"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { ChevronLeft, ChevronRight, X, ArrowRight } from "lucide-react";

interface GalleryImage {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
}

interface GallerySectionProps {
  images: GalleryImage[];
  dealerSlug: string;
  locale: string;
  dictionary: {
    title: string;
    viewAll: string;
  };
  useRootPaths?: boolean;
}

export function GallerySection({
  images,
  dealerSlug,
  locale,
  dictionary,
  useRootPaths = false,
}: GallerySectionProps) {
  const basePath = useRootPaths ? `/${locale}` : `/${locale}/${dealerSlug}`;
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  // Show max 6 images in the section
  const displayImages = images.slice(0, 6);

  const openLightbox = (index: number) => {
    setSelectedIndex(index);
  };

  const closeLightbox = () => {
    setSelectedIndex(null);
  };

  const goToPrevious = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === 0 ? images.length - 1 : selectedIndex - 1);
    }
  };

  const goToNext = () => {
    if (selectedIndex !== null) {
      setSelectedIndex(selectedIndex === images.length - 1 ? 0 : selectedIndex + 1);
    }
  };

  if (images.length === 0) {
    return null;
  }

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-12">
          <h2 className="text-3xl md:text-4xl font-bold">{dictionary.title}</h2>
          {images.length > 6 && (
            <Link href={`${basePath}/gallery`}>
              <Button variant="outline">
                {dictionary.viewAll}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>

        {/* Gallery Grid */}
        <div className="grid gap-4 grid-cols-2 md:grid-cols-3">
          {displayImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => openLightbox(index)}
              className="group relative aspect-square overflow-hidden rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <Image
                src={image.url}
                alt={image.title || `Gallery image ${index + 1}`}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-300" />
              {image.title && (
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-sm font-medium">{image.title}</p>
                </div>
              )}
            </button>
          ))}
        </div>

        {/* Lightbox */}
        <Dialog open={selectedIndex !== null} onOpenChange={closeLightbox}>
          <DialogContent className="max-w-5xl p-0 border-0 bg-transparent">
            <div className="relative">
              {/* Close button */}
              <button
                onClick={closeLightbox}
                className="absolute right-4 top-4 z-50 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation buttons */}
              <button
                onClick={goToPrevious}
                className="absolute left-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>
              <button
                onClick={goToNext}
                className="absolute right-4 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/50 p-2 text-white hover:bg-black/70"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Image */}
              {selectedIndex !== null && images[selectedIndex] && (
                <div className="relative aspect-video w-full">
                  <Image
                    src={images[selectedIndex].url}
                    alt={images[selectedIndex].title || "Gallery image"}
                    fill
                    className="object-contain"
                  />
                </div>
              )}

              {/* Caption */}
              {selectedIndex !== null && images[selectedIndex]?.title && (
                <div className="absolute bottom-0 inset-x-0 bg-black/70 p-4 text-white text-center">
                  <p className="font-medium">{images[selectedIndex].title}</p>
                  {images[selectedIndex].description && (
                    <p className="text-sm text-white/70 mt-1">
                      {images[selectedIndex].description}
                    </p>
                  )}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
