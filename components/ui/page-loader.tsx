"use client";

import { Loader2 } from "lucide-react";

interface PageLoaderProps {
  text?: string;
}

export function PageLoader({ text = "Yükleniyor..." }: PageLoaderProps) {
  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <p className="text-muted-foreground">{text}</p>
      </div>
    </div>
  );
}
