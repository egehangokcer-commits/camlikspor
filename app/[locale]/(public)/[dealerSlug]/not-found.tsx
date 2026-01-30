import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Home } from "lucide-react";

export default function DealerNotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-6xl font-bold text-primary">404</h1>
        <h2 className="text-2xl font-semibold">Sayfa Bulunamadı</h2>
        <p className="text-muted-foreground max-w-md">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir.
        </p>
      </div>
      <Link href="/">
        <Button>
          <Home className="mr-2 h-4 w-4" />
          Ana Sayfaya Dön
        </Button>
      </Link>
    </div>
  );
}
