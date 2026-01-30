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
import { MoreHorizontal, Eye, Edit, Trash, UserPlus, Phone, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { deletePreRegistrationAction, updatePreRegistrationStatusAction } from "@/lib/actions/pre-registration";

interface PreRegistrationActionsProps {
  id: string;
  locale: string;
  dictionary: {
    common: {
      edit: string;
      delete: string;
      confirmDelete: string;
      cancel: string;
      confirm: string;
    };
    preRegistration: {
      convert: string;
      contact: string;
    };
  };
}

export function PreRegistrationActions({
  id,
  locale,
  dictionary,
}: PreRegistrationActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deletePreRegistrationAction(id);
      if (result.success) {
        toast.success("Onkayit silindi");
        router.refresh();
      } else {
        toast.error(result.errorKey || "Bir hata olustu");
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleStatusUpdate = async (status: string) => {
    try {
      const result = await updatePreRegistrationStatusAction(id, status);
      if (result.success) {
        toast.success("Durum guncellendi");
        router.refresh();
      } else {
        toast.error(result.errorKey || "Bir hata olustu");
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
            onClick={() => router.push(`/${locale}/pre-registration/${id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Goruntule
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/pre-registration/${id}/edit`)}
          >
            <Edit className="mr-2 h-4 w-4" />
            {dictionary.common.edit}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => handleStatusUpdate("CONTACTED")}>
            <Phone className="mr-2 h-4 w-4" />
            {dictionary.preRegistration.contact}
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => router.push(`/${locale}/pre-registration/${id}/convert`)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            {dictionary.preRegistration.convert}
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
              Bu islem geri alinamaz. Onkayit kalici olarak silinecektir.
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
