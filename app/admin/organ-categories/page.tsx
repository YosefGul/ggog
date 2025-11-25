"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { Permission } from "@/lib/permissions";

interface OrganCategory {
  id: string;
  name: string;
  description: string | null;
  order: number;
  isActive: boolean;
  _count: {
    members: number;
  };
}

export default function OrganCategoriesPage() {
  return (
    <PermissionGuard permission={Permission.MANAGE_ORGAN_CATEGORIES}>
      <OrganCategoriesPageContent />
    </PermissionGuard>
  );
}

function OrganCategoriesPageContent() {
  const router = useRouter();
  const [categories, setCategories] = useState<OrganCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/organ-categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu kategoriyi silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/organ-categories/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchCategories();
      } else {
        alert("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Error deleting category:", error);
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
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Organ Kategorileri</h1>
        <Link
          href="/admin/organ-categories/new"
          className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 w-full md:w-auto text-center"
        >
          Yeni Kategori
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Sıra
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                İsim
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Açıklama
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Üye Sayısı
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Durum
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                İşlemler
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {categories.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                  Henüz kategori eklenmemiş
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {category.name}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {category.description || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {category._count?.members || 0}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        category.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {category.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <Link
                      href={`/admin/organ-categories/${category.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(category.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-gray-200">
          {categories.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Henüz kategori eklenmemiş
            </div>
          ) : (
            categories.map((category) => (
              <div key={category.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-base">{category.name}</h3>
                    <div className="mt-2 space-y-1 text-sm">
                      <p className="text-gray-500">Sıra: {category.order}</p>
                      {category.description && (
                        <p className="text-gray-600">{category.description}</p>
                      )}
                      <p className="text-gray-500">Üye Sayısı: {category._count?.members || 0}</p>
                    </div>
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      category.isActive
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {category.isActive ? "Aktif" : "Pasif"}
                  </span>
                </div>
                <div className="flex gap-2 pt-2 border-t">
                  <Link
                    href={`/admin/organ-categories/${category.id}`}
                    className="flex-1 px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 text-center"
                  >
                    Düzenle
                  </Link>
                  <button
                    onClick={() => handleDelete(category.id)}
                    className="flex-1 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                  >
                    Sil
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}



