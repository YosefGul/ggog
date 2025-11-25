"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface EventImage {
  id: string;
  imageUrl: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
}

interface Event {
  id: string;
  title: string;
  eventDate?: string;
  location?: string;
  acceptsApplications: boolean;
  isPastEvent: boolean;
  showOnHomepage: boolean;
  category?: Category;
  images: EventImage[];
}

export default function EventsPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | "accepting" | "past">("all");

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu etkinliği silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/events/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchEvents();
      } else {
        alert("Silme işlemi başarısız");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Bir hata oluştu");
    }
  };

  const filteredEvents = events.filter((event) => {
    if (filter === "accepting") return event.acceptsApplications;
    if (filter === "past") return event.isPastEvent;
    return true;
  });

  if (loading) {
    return <div>Yükleniyor...</div>;
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Etkinlikler</h1>
        <Link
          href="/admin/events/new"
          className="px-4 py-2 bg-primary-600 text-white rounded hover:bg-primary-700 w-full md:w-auto text-center"
        >
          Yeni Etkinlik Ekle
        </Link>
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter("all")}
          className={`px-4 py-2 rounded text-sm ${
            filter === "all"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setFilter("accepting")}
          className={`px-4 py-2 rounded text-sm ${
            filter === "accepting"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Başvuru Kabul Edenler
        </button>
        <button
          onClick={() => setFilter("past")}
          className={`px-4 py-2 rounded text-sm ${
            filter === "past"
              ? "bg-primary-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          Geçmiş Etkinlikler
        </button>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Başlık
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Tarih
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Durum
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ana Sayfa
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  İşlemler
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.map((event) => (
                <tr key={event.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {event.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.eventDate
                      ? new Date(event.eventDate).toLocaleDateString("tr-TR")
                      : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {event.category?.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col space-y-1">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          event.acceptsApplications
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.acceptsApplications ? "Başvuru Alıyor" : "Başvuru Almıyor"}
                      </span>
                      {event.isPastEvent && (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Geçmiş
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        event.showOnHomepage
                          ? "bg-purple-100 text-purple-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {event.showOnHomepage ? "Gösteriliyor" : "Gösterilmiyor"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Link
                      href={`/admin/events/${event.id}`}
                      className="text-primary-600 hover:text-primary-900 mr-4"
                    >
                      Düzenle
                    </Link>
                    <button
                      onClick={() => handleDelete(event.id)}
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
          {filteredEvents.map((event) => (
            <div key={event.id} className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-semibold text-base">{event.title}</h3>
                  <div className="mt-2 space-y-1">
                    {event.eventDate && (
                      <p className="text-sm text-gray-500">
                        Tarih: {new Date(event.eventDate).toLocaleDateString("tr-TR")}
                      </p>
                    )}
                    {event.category?.name && (
                      <p className="text-sm text-gray-500">Kategori: {event.category.name}</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.acceptsApplications
                      ? "bg-green-100 text-green-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.acceptsApplications ? "Başvuru Alıyor" : "Başvuru Almıyor"}
                </span>
                {event.isPastEvent && (
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    Geçmiş
                  </span>
                )}
                <span
                  className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    event.showOnHomepage
                      ? "bg-purple-100 text-purple-800"
                      : "bg-gray-100 text-gray-800"
                  }`}
                >
                  {event.showOnHomepage ? "Ana Sayfa" : "Gizli"}
                </span>
              </div>
              <div className="flex gap-2 pt-2 border-t">
                <Link
                  href={`/admin/events/${event.id}`}
                  className="flex-1 px-4 py-2 text-sm text-primary-600 border border-primary-600 rounded-md hover:bg-primary-50 text-center"
                >
                  Düzenle
                </Link>
                <button
                  onClick={() => handleDelete(event.id)}
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



