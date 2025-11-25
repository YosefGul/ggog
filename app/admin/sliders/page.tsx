"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Slider {
  id: string;
  title: string;
  description: string;
  image?: string;
  link?: string;
  linkTitle?: string;
  hasLink: boolean;
  isActive: boolean;
  order: number;
}

export default function SlidersPage() {
  const [sliders, setSliders] = useState<Slider[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSliders();
  }, []);

  const fetchSliders = async () => {
    try {
      const response = await fetch("/api/admin/sliders");
      if (response.ok) {
        const data = await response.json();
        setSliders(data);
      }
    } catch (error) {
      console.error("Error fetching sliders:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu slider'ı silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/sliders/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchSliders();
      } else {
        alert("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Error deleting slider:", error);
      alert("Bir hata oluştu");
    }
  };

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Slider'lar</h1>
        <Link
          href="/admin/sliders/new"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 w-full md:w-auto text-center"
        >
          Yeni Slider Ekle
        </Link>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sıra
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Görsel
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {sliders.map((slider) => (
                <tr key={slider.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {slider.order}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {slider.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {slider.image && (
                      <img
                        src={slider.image}
                        alt={slider.title}
                        className="h-16 w-32 object-cover rounded"
                      />
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        slider.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {slider.isActive ? "Aktif" : "Pasif"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/sliders/${slider.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(slider.id)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Sil
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="md:hidden divide-y divide-gray-200">
          {sliders.map((slider) => (
            <div key={slider.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{slider.title}</h3>
                  <p className="text-sm text-gray-500 mt-1">Sıra: {slider.order}</p>
                  {slider.description && (
                    <p className="text-sm text-gray-600 mt-2 line-clamp-2">{slider.description}</p>
                  )}
                </div>
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    slider.isActive
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {slider.isActive ? "Aktif" : "Pasif"}
                </span>
              </div>
              {slider.image && (
                <img
                  src={slider.image}
                  alt={slider.title}
                  className="w-full h-40 object-cover rounded"
                />
              )}
              <div className="flex gap-2 pt-2 border-t">
                <Link
                  href={`/admin/sliders/${slider.id}`}
                  className="flex-1 px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 text-center"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(slider.id)}
                  className="flex-1 px-4 py-2 text-sm text-red-600 border border-red-600 rounded-md hover:bg-red-50"
                >
                  Sil
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}



