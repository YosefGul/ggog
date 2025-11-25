"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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
import { Permission } from "@/lib/permissions";

const roles = [
  { value: "VIEWER", label: "Görüntüleyici" },
  { value: "MODERATOR", label: "Moderatör" },
  { value: "EDITOR", label: "Editör" },
  { value: "ADMIN", label: "Admin" },
  { value: "SUPER_ADMIN", label: "Süper Admin" },
];

export default function NewUserPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "VIEWER",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/users");
      } else {
        const data = await response.json();
        setError(data.error || "Kullanıcı oluşturulamadı");
      }
    } catch (error) {
      console.error("Error creating user:", error);
      setError("Bir hata oluştu");
    } finally {
      setSaving(false);
    }
  };

  return (
    <PermissionGuard permission={Permission.MANAGE_USERS}>
      <div>
        <h1 className="text-3xl font-bold mb-6">Yeni Kullanıcı</h1>

        <Card>
          <CardHeader>
            <CardTitle>Kullanıcı Bilgileri</CardTitle>
            <CardDescription>
              Yeni bir kullanıcı oluşturun
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
                  placeholder="ornek@email.com"
                />
              </div>

              <div>
                <Label htmlFor="password">
                  Şifre <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="password"
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                  placeholder="En az 6 karakter"
                  minLength={6}
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
                  placeholder="Kullanıcı adı"
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
                    {roles.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
                  {saving ? "Oluşturuluyor..." : "Oluştur"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </PermissionGuard>
  );
}

