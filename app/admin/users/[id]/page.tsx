"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { Permission, isSuperAdmin } from "@/lib/permissions";

const roles = [
  { value: "VIEWER", label: "Görüntüleyici" },
  { value: "MODERATOR", label: "Moderatör" },
  { value: "EDITOR", label: "Editör" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Süper Admin" },
];

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const { data: session } = useSession();
  const id = params.id as string;
  const currentUserRole = (session?.user as any)?.role || "VIEWER";

  const [formData, setFormData] = useState({
    email: "",
    name: "",
    role: "VIEWER",
    password: "",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUser();
  }, [id]);

  const fetchUser = async () => {
    try {
      const response = await fetch(`/api/admin/users/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          email: data.email || "",
          name: data.name || "",
          role: data.role || "VIEWER",
          password: "",
        });
      } else if (response.status === 403) {
        router.push("/admin/forbidden");
      }
    } catch (error) {
      console.error("Error fetching user:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const updateData: any = {
        email: formData.email,
        name: formData.name,
        role: formData.role,
      };

      // Only include password if it's provided
      if (formData.password.trim() !== "") {
        updateData.password = formData.password;
      }

      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        router.push("/admin/users");
      } else {
        const data = await response.json();
        setError(data.error || "Kullanıcı güncellenemedi");
      }
    } catch (error) {
      console.error("Error updating user:", error);
      setError("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  // Filter roles based on current user's permissions
  const availableRoles = isSuperAdmin(currentUserRole)
    ? roles
    : roles.filter((r) => r.value !== "SUPER_ADMIN");

  return (
    <PermissionGuard permission={Permission.MANAGE_USERS}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Kullanıcı Düzenle</h1>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <CardDescription>
              Kullanıcı bilgilerini güncelleyin
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <div className="p-4 bg-destructive/10 text-destructive rounded-md">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">
                  Email <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="name">İsim</Label>
                <Input
                  id="name"
                  type="text"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div>
                <Label htmlFor="role">Rol <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.role}
                  onValueChange={(value) =>
                    setFormData({ ...formData, role: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Rol seçin" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableRoles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="password">Yeni Şifre (Opsiyonel)</Label>
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="Değiştirmek istemiyorsanız boş bırakın"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  Şifreyi değiştirmek istemiyorsanız boş bırakın
                </p>
              </div>

              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.back()}
                >
                  İptal
                </Button>
                <Button type="submit" disabled={saving}>
                  {saving ? "Kaydediliyor..." : "Kaydet"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

