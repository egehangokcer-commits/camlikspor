"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import { MoreHorizontal, Eye, Edit, Trash, ToggleLeft, ToggleRight } from "lucide-react";
import { toast } from "sonner";
import { deleteProductAction, updateProductStatusAction } from "@/lib/actions/products";

interface ProductActionsProps {
  id: string;
  locale: string;
  isActive: boolean;
  dictionary: {
    common: {
      edit: string;
      delete: string;
      confirmDelete: string;
      cancel: string;
    };
  };
}

export function ProductActions({
  id,
  locale,
  isActive,
  dictionary,
}: ProductActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteProductAction(id);
      if (result.success) {
        toast.success("Urun silindi");
        router.refresh();
      } else {
        toast.error(result.message || "Bir hata olustu");
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    try {
      const result = await updateProductStatusAction(id, !isActive);
      if (result.success) {
        toast.success(isActive ? "Urun pasif yapildi" : "Urun aktif yapildi");
        router.refresh();
      } else {
        toast.error(result.message || "Bir hata olustu");
      }
    } catch {
      toast.error("Bir hata olustu");
    }
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Menu</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/products/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {dictionary.common.edit}
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleStatus}>
            {isActive ? (
              <>
                <ToggleLeft className="mr-2 h-4 w-4" />
                Pasif Yap
              </>
            ) : (
              <>
                <ToggleRight className="mr-2 h-4 w-4" />
                Aktif Yap
              </>
            )}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            className="text-destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            <Trash className="mr-2 h-4 w-4" />
            {dictionary.common.delete}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{dictionary.common.confirmDelete}</AlertDialogTitle>
            <AlertDialogDescription>
              Bu islem geri alinamaz. Urun kalici olarak silinecektir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>
              {dictionary.common.cancel}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Siliniyor..." : dictionary.common.delete}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
