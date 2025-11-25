"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
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

interface MemberApplication {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  occupation?: string;
  company?: string;
  preferredRole?: string;
  status: string;
  createdAt: string;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function MemberApplicationsPage() {
  const [applications, setApplications] = useState<MemberApplication[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>("all");
  const [loading, setLoading] = useState(true);
  const [selectedApplication, setSelectedApplication] = useState<MemberApplication | null>(null);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    fetchApplications();
  }, [selectedStatus, pagination.page]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }
      params.append("page", pagination.page.toString());
      params.append("limit", pagination.limit.toString());

      const response = await fetch(`/api/admin/member-applications?${params}`);
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
      const response = await fetch(`/api/admin/member-applications/${id}`, {
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
      const response = await fetch(`/api/admin/member-applications/${id}`, {
        method: "DELETE",
      });

      if (response.ok) {
        fetchApplications();
      }
    } catch (error) {
      console.error("Error deleting application:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (selectedStatus !== "all") {
        params.append("status", selectedStatus);
      }

      const response = await fetch(`/api/admin/member-applications/export?${params}`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `uye_basvurulari_${new Date().toISOString().split("T")[0]}.xlsx`;
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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <h1 className="text-2xl md:text-3xl font-bold">Üye Başvuruları</h1>
        <Button onClick={handleExport} className="bg-green-600 hover:bg-green-700 w-full md:w-auto">
          📥 Excel'e Aktar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <CardTitle>Başvuru Listesi</CardTitle>
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
                      <TableHead>Ad Soyad</TableHead>
                      <TableHead>E-posta</TableHead>
                      <TableHead>Telefon</TableHead>
                      <TableHead>Meslek</TableHead>
                      <TableHead>Durum</TableHead>
                      <TableHead>Başvuru Tarihi</TableHead>
                      <TableHead>İşlemler</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {applications.map((application) => (
                      <TableRow key={application.id}>
                        <TableCell className="font-medium">
                          {application.firstName} {application.lastName}
                        </TableCell>
                        <TableCell>{application.email}</TableCell>
                        <TableCell>{application.phone}</TableCell>
                        <TableCell>{application.occupation || "-"}</TableCell>
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
                          {new Date(application.createdAt).toLocaleDateString("tr-TR")}
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
                                  <DialogTitle>
                                    {application.firstName} {application.lastName} - Başvuru Detayları
                                  </DialogTitle>
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
                          {application.firstName} {application.lastName}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          {application.email}
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
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-muted-foreground">Telefon:</span>
                        <p className="font-medium">{application.phone}</p>
                      </div>
                      {application.occupation && (
                        <div>
                          <span className="text-muted-foreground">Meslek:</span>
                          <p className="font-medium">{application.occupation}</p>
                        </div>
                      )}
                      <div className="col-span-2">
                        <span className="text-muted-foreground">Başvuru Tarihi:</span>
                        <p className="font-medium">
                          {new Date(application.createdAt).toLocaleDateString("tr-TR")}
                        </p>
                      </div>
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
                            <DialogTitle>
                              {application.firstName} {application.lastName} - Başvuru Detayları
                            </DialogTitle>
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

function ApplicationDetails({ application }: { application: any }) {
  const [fullApplication, setFullApplication] = useState<any>(null);

  useEffect(() => {
    fetchFullApplication();
  }, [application.id]);

  const fetchFullApplication = async () => {
    try {
      const response = await fetch(`/api/admin/member-applications/${application.id}`);
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
          <Label className="font-semibold">Ad:</Label>
          <p className="text-muted-foreground">{fullApplication.firstName}</p>
        </div>
        <div>
          <Label className="font-semibold">Soyad:</Label>
          <p className="text-muted-foreground">{fullApplication.lastName}</p>
        </div>
        <div>
          <Label className="font-semibold">E-posta:</Label>
          <p className="text-muted-foreground">{fullApplication.email}</p>
        </div>
        <div>
          <Label className="font-semibold">Telefon:</Label>
          <p className="text-muted-foreground">{fullApplication.phone}</p>
        </div>
        {fullApplication.dateOfBirth && (
          <div>
            <Label className="font-semibold">Doğum Tarihi:</Label>
            <p className="text-muted-foreground">
              {new Date(fullApplication.dateOfBirth).toLocaleDateString("tr-TR")}
            </p>
          </div>
        )}
        {fullApplication.city && (
          <div>
            <Label className="font-semibold">Şehir:</Label>
            <p className="text-muted-foreground">{fullApplication.city}</p>
          </div>
        )}
        {fullApplication.occupation && (
          <div>
            <Label className="font-semibold">Meslek:</Label>
            <p className="text-muted-foreground">{fullApplication.occupation}</p>
          </div>
        )}
        {fullApplication.company && (
          <div>
            <Label className="font-semibold">Şirket:</Label>
            <p className="text-muted-foreground">{fullApplication.company}</p>
          </div>
        )}
        {fullApplication.preferredRole && (
          <div>
            <Label className="font-semibold">Tercih Edilen Rol:</Label>
            <p className="text-muted-foreground">{fullApplication.preferredRole}</p>
          </div>
        )}
      </div>
      {fullApplication.address && (
        <div>
          <Label className="font-semibold">Adres:</Label>
          <p className="text-muted-foreground">{fullApplication.address}</p>
        </div>
      )}
      {fullApplication.experience && (
        <div>
          <Label className="font-semibold">Deneyim:</Label>
          <p className="text-muted-foreground whitespace-pre-wrap">{fullApplication.experience}</p>
        </div>
      )}
      {fullApplication.skills && (
        <div>
          <Label className="font-semibold">Yetenekler:</Label>
          <p className="text-muted-foreground whitespace-pre-wrap">{fullApplication.skills}</p>
        </div>
      )}
      {fullApplication.gameDevelopmentExperience && (
        <div>
          <Label className="font-semibold">Oyun Geliştirme Deneyimi:</Label>
          <p className="text-muted-foreground whitespace-pre-wrap">
            {fullApplication.gameDevelopmentExperience}
          </p>
        </div>
      )}
      {fullApplication.motivation && (
        <div>
          <Label className="font-semibold">Motivasyon:</Label>
          <p className="text-muted-foreground whitespace-pre-wrap">{fullApplication.motivation}</p>
        </div>
      )}
      {fullApplication.expectations && (
        <div>
          <Label className="font-semibold">Beklentiler:</Label>
          <p className="text-muted-foreground whitespace-pre-wrap">{fullApplication.expectations}</p>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        {fullApplication.portfolio && (
          <div>
            <Label className="font-semibold">Portföy:</Label>
            <a
              href={fullApplication.portfolio}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              {fullApplication.portfolio}
            </a>
          </div>
        )}
        {fullApplication.linkedin && (
          <div>
            <Label className="font-semibold">LinkedIn:</Label>
            <a
              href={fullApplication.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              {fullApplication.linkedin}
            </a>
          </div>
        )}
        {fullApplication.github && (
          <div>
            <Label className="font-semibold">GitHub:</Label>
            <a
              href={fullApplication.github}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              {fullApplication.github}
            </a>
          </div>
        )}
        {fullApplication.website && (
          <div>
            <Label className="font-semibold">Web Sitesi:</Label>
            <a
              href={fullApplication.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline block"
            >
              {fullApplication.website}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

