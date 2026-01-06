"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { Key, Loader2, User, UserPlus, Trash2 } from "lucide-react";
import {
  resetDealerUserPasswordAction,
  createDealerUserAction,
  deleteDealerUserAction
} from "@/lib/actions/dealers";

interface DealerUser {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface PasswordResetCardProps {
  users: DealerUser[];
  dealerId: string;
}

export function PasswordResetCard({ users, dealerId }: PasswordResetCardProps) {
  const router = useRouter();
  const [selectedUser, setSelectedUser] = useState<DealerUser | null>(null);
  const [newPassword, setNewPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Add user state
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserRole, setNewUserRole] = useState<"DEALER_ADMIN" | "TRAINER">("DEALER_ADMIN");

  // Delete user state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<DealerUser | null>(null);

  const handleResetPassword = async () => {
    if (!selectedUser || !newPassword) return;

    setIsLoading(true);
    try {
      const result = await resetDealerUserPasswordAction(selectedUser.id, newPassword);
      if (result.success) {
        toast.success(result.message);
        setDialogOpen(false);
        setNewPassword("");
        setSelectedUser(null);
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async () => {
    setIsLoading(true);
    try {
      const result = await createDealerUserAction(dealerId, {
        name: newUserName,
        email: newUserEmail,
        password: newUserPassword,
        role: newUserRole,
      });
      if (result.success) {
        toast.success(result.message);
        setAddUserOpen(false);
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setNewUserRole("DEALER_ADMIN");
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) return;

    setIsLoading(true);
    try {
      const result = await deleteDealerUserAction(userToDelete.id);
      if (result.success) {
        toast.success(result.message);
        setDeleteDialogOpen(false);
        setUserToDelete(null);
        router.refresh();
      } else {
        toast.error(result.message);
      }
    } catch {
      toast.error("Bir hata olustu");
    } finally {
      setIsLoading(false);
    }
  };

  const openResetDialog = (user: DealerUser) => {
    setSelectedUser(user);
    setNewPassword("");
    setDialogOpen(true);
  };

  const openDeleteDialog = (user: DealerUser) => {
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "DEALER_ADMIN":
        return <Badge>Admin</Badge>;
      case "TRAINER":
        return <Badge variant="secondary">Antrenor</Badge>;
      default:
        return <Badge variant="outline">{role}</Badge>;
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Kullanicilar
              </CardTitle>
              <CardDescription>
                Bayi kullanicilarini yonetin
              </CardDescription>
            </div>
            <Button onClick={() => setAddUserOpen(true)}>
              <UserPlus className="h-4 w-4 mr-2" />
              Kullanici Ekle
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {users.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              Bu bayiye ait kullanici bulunmuyor
            </div>
          ) : (
            <div className="space-y-3">
              {users.map((user: DealerUser) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-muted-foreground">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getRoleBadge(user.role)}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openResetDialog(user)}
                    >
                      <Key className="h-4 w-4 mr-1" />
                      Sifre
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      onClick={() => openDeleteDialog(user)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Reset Password Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Sifre Sifirla</DialogTitle>
            <DialogDescription>
              {selectedUser?.name} ({selectedUser?.email}) icin yeni sifre belirleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPassword">Yeni Sifre</Label>
              <Input
                id="newPassword"
                type="password"
                placeholder="En az 6 karakter"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={isLoading}
            >
              Iptal
            </Button>
            <Button
              onClick={handleResetPassword}
              disabled={isLoading || newPassword.length < 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sifreyi Guncelle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add User Dialog */}
      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Kullanici Ekle</DialogTitle>
            <DialogDescription>
              Bayiye yeni bir kullanici ekleyin
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="userName">Ad Soyad</Label>
              <Input
                id="userName"
                placeholder="Kullanici adi"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userEmail">E-posta</Label>
              <Input
                id="userEmail"
                type="email"
                placeholder="kullanici@example.com"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userPassword">Sifre</Label>
              <Input
                id="userPassword"
                type="password"
                placeholder="En az 6 karakter"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="userRole">Rol</Label>
              <Select value={newUserRole} onValueChange={(v) => setNewUserRole(v as "DEALER_ADMIN" | "TRAINER")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="DEALER_ADMIN">Admin</SelectItem>
                  <SelectItem value="TRAINER">Antrenor</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setAddUserOpen(false)}
              disabled={isLoading}
            >
              Iptal
            </Button>
            <Button
              onClick={handleAddUser}
              disabled={isLoading || !newUserName || !newUserEmail || newUserPassword.length < 6}
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Kullanici Ekle
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Kullaniciyi Sil</AlertDialogTitle>
            <AlertDialogDescription>
              {userToDelete?.name} ({userToDelete?.email}) kullanicisini silmek istediginizden emin misiniz?
              Bu islem geri alinamaz.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Iptal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isLoading}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Sil
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
