"use client";

import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, X, Package } from "lucide-react";
import {
  createProductAction,
  updateProductAction,
  type ProductFormState,
} from "@/lib/actions/products";

interface Variant {
  id?: string;
  size: string;
  color: string;
  stock: number;
  sku: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductFormProps {
  locale: string;
  categories: Category[];
  initialData?: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    price: number;
    categoryId: string;
    isActive: boolean;
    images: string | null;
    variants: Variant[];
  };
  dictionary: {
    common: {
      save: string;
      cancel: string;
      loading: string;
    };
  };
}

const SIZES = ["XS", "S", "M", "L", "XL", "XXL", "3XL", "4XL", "5XL"];

export function ProductForm({
  locale,
  categories,
  initialData,
  dictionary,
}: ProductFormProps) {
  const router = useRouter();
  const isEdit = !!initialData;

  const [variants, setVariants] = useState<Variant[]>(
    initialData?.variants || [{ size: "", color: "", stock: 0, sku: "" }]
  );
  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);
  const [images, setImages] = useState<string[]>(() => {
    if (initialData?.images) {
      try {
        return JSON.parse(initialData.images);
      } catch {
        return [];
      }
    }
    return [];
  });
  const [imageInput, setImageInput] = useState("");

  const initialState: ProductFormState = {
    errors: {},
    message: undefined,
    success: false,
  };

  const boundAction = isEdit
    ? updateProductAction.bind(null, initialData.id)
    : createProductAction;

  const [state, formAction, isPending] = useActionState(
    async (prevState: ProductFormState, formData: FormData) => {
      // Add variants as JSON
      formData.set("variants", JSON.stringify(variants));
      formData.set("isActive", String(isActive));
      formData.set("images", JSON.stringify(images));

      const result = await boundAction(prevState, formData);

      if (result.success) {
        toast.success(isEdit ? "Urun guncellendi" : "Urun olusturuldu");
        router.push(`/${locale}/products`);
      } else if (result.message) {
        toast.error(result.message);
      }

      return result;
    },
    initialState
  );

  const addVariant = () => {
    setVariants([...variants, { size: "", color: "", stock: 0, sku: "" }]);
  };

  const removeVariant = (index: number) => {
    setVariants(variants.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof Variant, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setVariants(newVariants);
  };

  const addImage = () => {
    if (imageInput.trim()) {
      setImages([...images, imageInput.trim()]);
      setImageInput("");
    }
  };

  const removeImage = (index: number) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();
  };

  return (
    <form action={formAction} className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle>Urun Bilgileri</CardTitle>
          <CardDescription>Urun temel bilgilerini girin</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Urun Adi *</Label>
              <Input
                id="name"
                name="name"
                defaultValue={initialData?.name}
                required
                onChange={(e) => {
                  const slugInput = document.getElementById("slug") as HTMLInputElement;
                  if (slugInput && !initialData) {
                    slugInput.value = generateSlug(e.target.value);
                  }
                }}
              />
              {state.errors?.name && (
                <p className="text-sm text-destructive">{state.errors.name[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug *</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={initialData?.slug}
                required
              />
              {state.errors?.slug && (
                <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Aciklama</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={initialData?.description || ""}
              rows={4}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="categoryId">Kategori *</Label>
              <Select name="categoryId" defaultValue={initialData?.categoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Kategori secin" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {state.errors?.categoryId && (
                <p className="text-sm text-destructive">{state.errors.categoryId[0]}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="price">Fiyat (TL) *</Label>
              <Input
                id="price"
                name="price"
                type="number"
                step="0.01"
                min="0"
                defaultValue={initialData?.price || 0}
                required
              />
              {state.errors?.price && (
                <p className="text-sm text-destructive">{state.errors.price[0]}</p>
              )}
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isActive"
              checked={isActive}
              onCheckedChange={setIsActive}
            />
            <Label htmlFor="isActive">Aktif</Label>
          </div>
        </CardContent>
      </Card>

      {/* Images */}
      <Card>
        <CardHeader>
          <CardTitle>Gorseller</CardTitle>
          <CardDescription>Urun gorsellerini ekleyin (URL)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-2">
            <Input
              placeholder="Gorsel URL'si"
              value={imageInput}
              onChange={(e) => setImageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addImage();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addImage}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {images.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {images.map((img, index) => (
                <div
                  key={index}
                  className="relative group rounded-md overflow-hidden border"
                >
                  <img
                    src={img}
                    alt={`Image ${index + 1}`}
                    className="h-20 w-20 object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Variants */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Varyantlar</CardTitle>
              <CardDescription>Beden, renk ve stok bilgilerini girin</CardDescription>
            </div>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <Plus className="mr-2 h-4 w-4" />
              Varyant Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div
                key={index}
                className="flex flex-wrap items-end gap-4 p-4 border rounded-lg"
              >
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>Beden</Label>
                  <Select
                    value={variant.size}
                    onValueChange={(value) => updateVariant(index, "size", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Beden" />
                    </SelectTrigger>
                    <SelectContent>
                      {SIZES.map((size) => (
                        <SelectItem key={size} value={size}>
                          {size}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>Renk</Label>
                  <Input
                    placeholder="Renk"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                  />
                </div>
                <div className="flex-1 min-w-[100px] space-y-2">
                  <Label>Stok</Label>
                  <Input
                    type="number"
                    min="0"
                    placeholder="Stok"
                    value={variant.stock}
                    onChange={(e) =>
                      updateVariant(index, "stock", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
                <div className="flex-1 min-w-[120px] space-y-2">
                  <Label>SKU</Label>
                  <Input
                    placeholder="SKU"
                    value={variant.sku}
                    onChange={(e) => updateVariant(index, "sku", e.target.value)}
                  />
                </div>
                {variants.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => removeVariant(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Form Actions */}
      <div className="flex justify-end gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push(`/${locale}/products`)}
        >
          {dictionary.common.cancel}
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              {dictionary.common.loading}
            </>
          ) : (
            dictionary.common.save
          )}
        </Button>
      </div>
    </form>
  );
}
