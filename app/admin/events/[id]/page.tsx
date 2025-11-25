"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import RichTextEditor from "@/components/admin/RichTextEditor";
import MultiImageUpload from "@/components/admin/MultiImageUpload";

interface Category {
  id: string;
  name: string;
}

interface ImageItem {
  url: string;
  order: number;
}

export default function EventFormPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const isNew = id === "new";

  const [categories, setCategories] = useState<Category[]>([]);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    location: "",
    eventType: "",
    participantLimit: "",
    applicationDeadline: "",
    categoryId: "",
    acceptsApplications: false,
    isPastEvent: false,
    driveLink: "",
    details: "",
    showOnHomepage: false,
    order: 0,
    images: [] as ImageItem[],
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchCategories();
      if (!isNew) {
        await fetchEvent();
      }
      setLoading(false);
    };
    loadData();
  }, [id, isNew]);

  const fetchCategories = async () => {
    try {
      const response = await fetch("/api/admin/categories");
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchEvent = async () => {
    try {
      const response = await fetch(`/api/admin/events/${id}`);
      if (response.ok) {
        const data = await response.json();
        setFormData({
          title: data.title || "",
          description: data.description || "",
          eventDate: data.eventDate
            ? new Date(data.eventDate).toISOString().split("T")[0]
            : "",
          location: data.location || "",
          eventType: data.eventType || "",
          participantLimit: data.participantLimit?.toString() || "",
          applicationDeadline: data.applicationDeadline
            ? new Date(data.applicationDeadline).toISOString().split("T")[0]
            : "",
          categoryId: data.categoryId || "",
          acceptsApplications: data.acceptsApplications === true,
          isPastEvent: data.isPastEvent === true,
          driveLink: data.driveLink || "",
          details: data.details || "",
          showOnHomepage: data.showOnHomepage === true,
          order: data.order || 0,
          images:
            data.images?.map((img: any) => ({
              url: img.imageUrl,
              order: img.order,
            })) || [],
        });
      } else {
        console.error("Failed to fetch event:", response.statusText);
      }
    } catch (error) {
      console.error("Error fetching event:", error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const url = isNew ? "/api/admin/events" : `/api/admin/events/${id}`;
      const method = isNew ? "POST" : "PUT";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        router.push("/admin/events");
      } else {
        alert("Kayıt başarısız");
      }
    } catch (error) {
      console.error("Error saving event:", error);
      alert("Bir hata oluştu");
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

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">
        {isNew ? "Yeni Etkinlik" : "Etkinlik Düzenle"}
      </h1>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Başlık *
            </label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) =>
                setFormData({ ...formData, title: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Kategori
            </label>
            <select
              value={formData.categoryId}
              onChange={(e) =>
                setFormData({ ...formData, categoryId: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Kategori Seçin</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Tarihi
            </label>
            <input
              type="date"
              value={formData.eventDate}
              onChange={(e) =>
                setFormData({ ...formData, eventDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Lokasyon
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) =>
                setFormData({ ...formData, location: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Etkinlik Türü
            </label>
            <input
              type="text"
              value={formData.eventType}
              onChange={(e) =>
                setFormData({ ...formData, eventType: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Katılımcı Sınırı
            </label>
            <input
              type="number"
              value={formData.participantLimit}
              onChange={(e) =>
                setFormData({ ...formData, participantLimit: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Son Başvuru Tarihi
            </label>
            <input
              type="date"
              value={formData.applicationDeadline}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  applicationDeadline: e.target.value,
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Sıra
            </label>
            <input
              type="number"
              value={formData.order}
              onChange={(e) =>
                setFormData({ ...formData, order: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>
        </div>

        <div>
          <RichTextEditor
            value={formData.description}
            onChange={(content) =>
              setFormData({ ...formData, description: content })
            }
            label="Etkinlik Hakkında *"
          />
        </div>

        <div className="space-y-4">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.acceptsApplications}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  acceptsApplications: e.target.checked,
                })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Başvuru kabul ediyor
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.isPastEvent}
              onChange={(e) =>
                setFormData({ ...formData, isPastEvent: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Geçmiş etkinlik
            </span>
          </label>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={formData.showOnHomepage}
              onChange={(e) =>
                setFormData({ ...formData, showOnHomepage: e.target.checked })
              }
              className="mr-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Ana sayfada göster
            </span>
          </label>
        </div>

        {formData.isPastEvent && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Drive Link
              </label>
              <input
                type="url"
                value={formData.driveLink}
                onChange={(e) =>
                  setFormData({ ...formData, driveLink: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <RichTextEditor
                value={formData.details}
                onChange={(content) =>
                  setFormData({ ...formData, details: content })
                }
                label="Etkinlik Detayları"
              />
            </div>
          </>
        )}

        <div>
          <MultiImageUpload
            value={formData.images}
            onChange={(images) => setFormData({ ...formData, images })}
            label="Etkinlik Görselleri"
            maxImages={10}
          />
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 disabled:opacity-50"
          >
            {saving ? "Kaydediliyor..." : "Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}

