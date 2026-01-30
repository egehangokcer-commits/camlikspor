"use client";

import { useEffect, useState, useActionState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Plus, Edit, Trash, Loader2, ArrowLeft, Tag } from "lucide-react";
import Link from "next/link";
import {
  createCategoryAction,
  updateCategoryAction,
  deleteCategoryAction,
  type CategoryFormState,
} from "@/lib/actions/products";

interface Category {
  id: string;
  name: string;
  slug: string;
  _count: {
    products: number;
  };
}

export default function CategoriesPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const initialState: CategoryFormState = {
    errors: {},
    message: undefined,
    success: false,
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/shop/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const boundAction = editingCategory
    ? updateCategoryAction.bind(null, editingCategory.id)
    : createCategoryAction;

  const [state, formAction, isPending] = useActionState(
    async (prevState: CategoryFormState, formData: FormData) => {
      const result = await boundAction(prevState, formData);

      if (result.success) {
        toast.success(editingCategory ? "Kategori guncellendi" : "Kategori olusturuldu");
        setDialogOpen(false);
        setEditingCategory(null);
        fetchCategories();
      } else if (result.message) {
        toast.error(result.message);
      }

      return result;
    },
    initialState
  );

  const handleDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      const result = await deleteCategoryAction(categoryToDelete.id);
      if (result.success) {
        toast.success("Kategori silindi");
        fetchCategories();
      } else {
        toast.error(result.message || "Bir hata olustu");
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openEditDialog = (category: Category) => {
    setEditingCategory(category);
    setDialogOpen(true);
  };

  const closeDialog = () => {
    setDialogOpen(false);
    setEditingCategory(null);
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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tr/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Kategoriler</h1>
            <p className="text-muted-foreground">Urun kategorilerini yonetin</p>
          </div>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => {
          if (!open) closeDialog();
          else setDialogOpen(true);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCategory(null)}>
              <Plus className="mr-2 h-4 w-4" />
              Kategori Ekle
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {editingCategory ? "Kategori Duzenle" : "Yeni Kategori"}
              </DialogTitle>
              <DialogDescription>
                {editingCategory
                  ? "Kategori bilgilerini guncelleyin"
                  : "Yeni bir kategori olusturun"}
              </DialogDescription>
            </DialogHeader>
            <form action={formAction}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Kategori Adi *</Label>
                  <Input
                    id="name"
                    name="name"
                    defaultValue={editingCategory?.name}
                    required
                    onChange={(e) => {
                      const slugInput = document.getElementById("slug") as HTMLInputElement;
                      if (slugInput && !editingCategory) {
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
                    defaultValue={editingCategory?.slug}
                    required
                  />
                  {state.errors?.slug && (
                    <p className="text-sm text-destructive">{state.errors.slug[0]}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                  Iptal
                </Button>
                <Button type="submit" disabled={isPending}>
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Kaydediliyor...
                    </>
                  ) : (
                    "Kaydet"
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Kayitli Kategoriler
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              Henuz kategori yok
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kategori Adi</TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Urun Sayisi</TableHead>
                  <TableHead className="text-right">Islemler</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {category.slug}
                    </TableCell>
                    <TableCell>{category._count.products}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(category)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            setCategoryToDelete(category);
                            setDeleteDialogOpen(true);
                          }}
                          disabled={category._count.products > 0}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kategoriyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              Bu islem geri alinamaz. &quot;{categoryToDelete?.name}&quot; kategorisi
              kalici olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Iptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : "Sil"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
