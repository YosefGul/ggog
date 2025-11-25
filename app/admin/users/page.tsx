"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { Permission } from "@/lib/permissions";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface User {
  id: string;
  email: string;
  name: string | null;
  role: string;
  createdAt: string;
  updatedAt: string;
}

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN: "Admin",
  EDITOR: "Editör",
  MODERATOR: "Moderatör",
  VIEWER: "Görüntüleyici",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "bg-purple-100 text-purple-800",
  ADMIN: "bg-blue-100 text-blue-800",
  EDITOR: "bg-green-100 text-green-800",
  MODERATOR: "bg-yellow-100 text-yellow-800",
  VIEWER: "bg-gray-100 text-gray-800",
};

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/admin/users");
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else if (response.status === 403) {
        router.push("/admin/forbidden");
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (userId: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchUsers();
        setDeleteDialogOpen(false);
        setUserToDelete(null);
      } else {
        const data = await response.json();
        alert(data.error || "Kullanıcı silinemedi");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <PermissionGuard permission={Permission.MANAGE_USERS}>
      <div>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <h1 className="text-2xl md:text-3xl font-bold">Kullanıcı Yönetimi</h1>
          <Button asChild className="w-full md:w-auto">
            <Link href="/admin/users/new">Yeni Kullanıcı</Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcılar</CardTitle>
            <CardDescription>
              Sistem kullanıcılarını yönetin
            </CardDescription>
          </CardHeader>
          <CardContent>
            {users.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Henüz kullanıcı bulunmamaktadır.
              </p>
            ) : (
              <>
                {/* Desktop Table */}
                <div className="hidden md:block overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>İsim</TableHead>
                        <TableHead>Rol</TableHead>
                        <TableHead>Oluşturulma</TableHead>
                        <TableHead>İşlemler</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user.id}>
                          <TableCell className="font-medium">{user.email}</TableCell>
                          <TableCell>{user.name || "-"}</TableCell>
                          <TableCell>
                            <Badge className={roleColors[user.role] || roleColors.VIEWER}>
                              {roleLabels[user.role] || user.role}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                          </TableCell>
                          <TableCell>
                            <div className="flex gap-2">
                              <Button asChild variant="outline" size="sm">
                                <Link href={`/admin/users/${user.id}`}>Düzenle</Link>
                              </Button>
                              <Dialog
                                open={deleteDialogOpen && userToDelete === user.id}
                                onOpenChange={(open) => {
                                  setDeleteDialogOpen(open);
                                  if (!open) setUserToDelete(null);
                                }}
                              >
                                <DialogTrigger asChild>
                                  <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={() => {
                                      setUserToDelete(user.id);
                                      setDeleteDialogOpen(true);
                                    }}
                                  >
                                    Sil
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Kullanıcıyı Sil</DialogTitle>
                                    <DialogDescription>
                                      Bu işlem geri alınamaz. Kullanıcıyı silmek istediğinizden emin misiniz?
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex justify-end gap-2 mt-4">
                                    <Button
                                      variant="outline"
                                      onClick={() => {
                                        setDeleteDialogOpen(false);
                                        setUserToDelete(null);
                                      }}
                                    >
                                      İptal
                                    </Button>
                                    <Button
                                      variant="destructive"
                                      onClick={() => handleDelete(user.id)}
                                    >
                                      Sil
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                {/* Mobile Card Layout */}
                <div className="md:hidden space-y-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="border rounded-lg p-4 space-y-3 bg-white"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-base">{user.email}</h3>
                          {user.name && (
                            <p className="text-sm text-muted-foreground mt-1">{user.name}</p>
                          )}
                        </div>
                        <Badge className={roleColors[user.role] || roleColors.VIEWER}>
                          {roleLabels[user.role] || user.role}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Oluşturulma: {new Date(user.createdAt).toLocaleDateString("tr-TR")}
                      </div>
                      <div className="flex flex-col gap-2 pt-2 border-t">
                        <Button asChild variant="outline" size="sm" className="w-full">
                          <Link href={`/admin/users/${user.id}`}>Düzenle</Link>
                        </Button>
                        <Dialog
                          open={deleteDialogOpen && userToDelete === user.id}
                          onOpenChange={(open) => {
                            setDeleteDialogOpen(open);
                            if (!open) setUserToDelete(null);
                          }}
                        >
                          <DialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              className="w-full"
                              onClick={() => {
                                setUserToDelete(user.id);
                                setDeleteDialogOpen(true);
                              }}
                            >
                              Sil
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Kullanıcıyı Sil</DialogTitle>
                              <DialogDescription>
                                Bu işlem geri alınamaz. Kullanıcıyı silmek istediğinizden emin misiniz?
                              </DialogDescription>
                            </DialogHeader>
                            <div className="flex justify-end gap-2 mt-4">
                              <Button
                                variant="outline"
                                onClick={() => {
                                  setDeleteDialogOpen(false);
                                  setUserToDelete(null);
                                }}
                              >
                                İptal
                              </Button>
                              <Button
                                variant="destructive"
                                onClick={() => handleDelete(user.id)}
                              >
                                Sil
                              </Button>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

