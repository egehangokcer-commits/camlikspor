"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
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
import {
  MoreHorizontal,
  Eye,
  Trash,
  CheckCircle,
  Package,
  Truck,
  XCircle,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { updateOrderStatusAction, deleteOrderAction } from "@/lib/actions/products";

interface OrderActionsProps {
  id: string;
  locale: string;
  currentStatus: string;
  dictionary: {
    common: {
      delete: string;
      confirmDelete: string;
      cancel: string;
    };
  };
}

const statusOptions = [
  { value: "PENDING", label: "Bekliyor", icon: RefreshCw },
  { value: "CONFIRMED", label: "Onaylandi", icon: CheckCircle },
  { value: "PROCESSING", label: "Hazirlaniyor", icon: Package },
  { value: "SHIPPED", label: "Kargoda", icon: Truck },
  { value: "DELIVERED", label: "Teslim Edildi", icon: CheckCircle },
  { value: "CANCELLED", label: "Iptal Edildi", icon: XCircle },
];

export function OrderActions({
  id,
  locale,
  currentStatus,
  dictionary,
}: OrderActionsProps) {
  const router = useRouter();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleStatusChange = async (status: string) => {
    try {
      const result = await updateOrderStatusAction(id, status);
      if (result.success) {
        toast.success("Siparis durumu guncellendi");
        router.refresh();
      } else {
        toast.error(result.message || "Bir hata olustu");
      }
    } catch {
      toast.error("Bir hata olustu");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteOrderAction(id);
      if (result.success) {
        toast.success("Siparis silindi");
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
            onClick={() => router.push(`/${locale}/orders/${id}`)}
          >
            <Eye className="mr-2 h-4 w-4" />
            Detay
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>
              <RefreshCw className="mr-2 h-4 w-4" />
              Durum Degistir
            </DropdownMenuSubTrigger>
            <DropdownMenuSubContent>
              {statusOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  disabled={option.value === currentStatus}
                >
                  <option.icon className="mr-2 h-4 w-4" />
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuSubContent>
          </DropdownMenuSub>
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
              Bu islem geri alinamaz. Siparis kalici olarak silinecek ve stoklar geri yuklenecektir.
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
