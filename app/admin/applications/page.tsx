"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

interface Event {
  id: string;
  title: string;
}

interface Application {
  id: string;
  event: Event;
  formData: any;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function ApplicationsPage() {
  const [applications, setApplications] = useState<Application[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<Application | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  useEffect(() => {
    fetchApplications();
  }, [selectedEvent, selectedStatus, pagination.page]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/admin/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedEvent !== "all") {
        params.append("eventId", selectedEvent);
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/admin/applications?${params}`);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        setPagination(data.pagination || pagination);
      }
    } catch (error) {
      console.error("Error fetching applications:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Error updating application:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Bu başvuruyu silmek istediğinize emin misiniz?")) {
      return;
    }

    try {
      const response = await fetch(`/api/admin/applications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedEvent !== "all") {
        params.append("eventId", selectedEvent);
      }
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/admin/applications/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `etkinlik_basvurulari_${new Date().toISOString().split("T")[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        alert("Export işlemi başarısız oldu");
      }
    } catch (error) {
      console.error("Error exporting:", error);
      alert("Export işlemi sırasında bir hata oluştu");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="space-y-4 w-full max-w-4xl">
          <Skeleton className="h-10 w-64" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Etkinlik Başvuruları</h1>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
          📥 Excel'e Aktar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Başvuru Listesi</CardTitle>
            <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
              <Select
                value={selectedEvent}
                onValueChange={(value) => {
                  setSelectedEvent(value);
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <SelectTrigger className="w-full md:w-[200px]">
                  <SelectValue placeholder="Etkinlik Seç" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tüm Etkinlikler</SelectItem>
                  {events.map((event) => (
                    <SelectItem key={event.id} value={event.id}>
                      {event.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={selectedStatus}
                onValueChange={(value) => {
                  setSelectedStatus(value);
                  setPagination({ ...pagination, page: 1 });
                }}
              >
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="Durum Filtrele" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="pending">Beklemede</SelectItem>
                  <SelectItem value="approved">Onaylandı</SelectItem>
                  <SelectItem value="rejected">Reddedildi</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {applications.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Başvuru bulunamadı.
            </p>
          ) : (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Etkinlik</TableHead>
                      <TableHead>Tarih</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.event.title}
                        </TableCell>
                        <TableCell>
                          {new Date(application.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              application.status === "approved"
                                ? "default"
                                : application.status === "rejected"
                                ? "destructive"
                                : "secondary"
                            }
                          >
                            {application.status === "pending"
                              ? "Beklemede"
                              : application.status === "approved"
                              ? "Onaylandı"
                              : "Reddedildi"}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedApplication(application)}
                                >
                                  Detay
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>Başvuru Detayları</DialogTitle>
                                </DialogHeader>
                                {selectedApplication && (
                                  <ApplicationDetails application={selectedApplication} />
                                )}
                              </DialogContent>
                            </Dialog>
                            <Select
                              value={application.status}
                              onValueChange={(value) =>
                                handleStatusChange(application.id, value)
                              }
                            >
                              <SelectTrigger className="w-[120px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Beklemede</SelectItem>
                                <SelectItem value="approved">Onayla</SelectItem>
                                <SelectItem value="rejected">Reddet</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => handleDelete(application.id)}
                            >
                              Sil
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Mobile Card Layout */}
              <div className="md:hidden space-y-4">
                {applications.map((application) => (
                  <div
                    key={application.id}
                    className="border rounded-lg p-4 space-y-3 bg-white"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg">
                          {application.event.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(application.createdAt).toLocaleDateString("tr-TR", {
                            year: "numeric",
                            month: "2-digit",
                            day: "2-digit",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                      <Badge
                        variant={
                          application.status === "approved"
                            ? "default"
                            : application.status === "rejected"
                            ? "destructive"
                            : "secondary"
                        }
                      >
                        {application.status === "pending"
                          ? "Beklemede"
                          : application.status === "approved"
                          ? "Onaylandı"
                          : "Reddedildi"}
                      </Badge>
                    </div>
                    <div className="flex flex-col gap-2 pt-2 border-t">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button
                            variant="outline"
                            size="sm"
                            className="w-full"
                            onClick={() => setSelectedApplication(application)}
                          >
                            Detay Görüntüle
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-[95vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>Başvuru Detayları</DialogTitle>
                          </DialogHeader>
                          {selectedApplication && (
                            <ApplicationDetails application={selectedApplication} />
                          )}
                        </DialogContent>
                      </Dialog>
                      <Select
                        value={application.status}
                        onValueChange={(value) =>
                          handleStatusChange(application.id, value)
                        }
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Beklemede</SelectItem>
                          <SelectItem value="approved">Onayla</SelectItem>
                          <SelectItem value="rejected">Reddet</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="w-full"
                        onClick={() => handleDelete(application.id)}
                      >
                        Sil
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Pagination */}
          {applications.length > 0 && (
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-4 pt-4 border-t">
              <div className="text-sm text-muted-foreground text-center md:text-left">
                Toplam {pagination.total} kayıt, Sayfa {pagination.page} / {pagination.totalPages}
              </div>
              <div className="flex gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none"
                  onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                  disabled={pagination.page === 1}
                >
                  Önceki
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 md:flex-none"
                  onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                  disabled={pagination.page >= pagination.totalPages}
                >
                  Sonraki
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ApplicationDetails({ application }: { application: Application }) {
  const [fullApplication, setFullApplication] = useState<any>(null);

  useEffect(() => {
    fetchFullApplication();
  }, [application.id]);

  const fetchFullApplication = async () => {
    try {
      const response = await fetch(`/api/admin/applications/${application.id}`);
      if (response.ok) {
        const data = await response.json();
        setFullApplication(data);
      }
    } catch (error) {
      console.error("Error fetching full application:", error);
    }
  };

  if (!fullApplication) {
    return <p>Yükleniyor...</p>;
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label className="font-semibold">Etkinlik:</Label>
          <p className="text-muted-foreground">{fullApplication.event.title}</p>
        </div>
        <div>
          <Label className="font-semibold">Tarih:</Label>
          <p className="text-muted-foreground">
            {new Date(fullApplication.createdAt).toLocaleString("tr-TR")}
          </p>
        </div>
        <div>
          <Label className="font-semibold">Durum:</Label>
          <Badge
            variant={
              fullApplication.status === "approved"
                ? "default"
                : fullApplication.status === "rejected"
                ? "destructive"
                : "secondary"
            }
          >
            {fullApplication.status === "pending"
              ? "Beklemede"
              : fullApplication.status === "approved"
              ? "Onaylandı"
              : "Reddedildi"}
          </Badge>
        </div>
      </div>
      <div>
        <Label className="font-semibold">Form Verileri:</Label>
        <div className="mt-2 p-4 bg-muted rounded-lg overflow-auto">
          <pre className="text-sm whitespace-pre-wrap">
            {JSON.stringify(fullApplication.formData, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
}
