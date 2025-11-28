"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import PermissionGuard from "@/components/admin/PermissionGuard";
import { Permission, isSuperAdmin } from "@/lib/permissions";
import { useSession } from "next-auth/react";

interface AdminLog {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  entityName: string | null;
  changes: any;
  ipAddress: string | null;
  userAgent: string | null;
  metadata: any;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string | null;
    role: string;
  };
}

interface LogsResponse {
  logs: AdminLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const actionLabels: Record<string, string> = {
  CREATE: "Oluşturma",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
  LOGIN: "Giriş",
  LOGOUT: "Çıkış",
  SETTINGS_CHANGE: "Ayar Değişikliği",
  STATUS_CHANGE: "Durum Değişikliği",
};

const actionColors: Record<string, string> = {
  CREATE: "bg-green-100 text-green-800",
  UPDATE: "bg-blue-100 text-blue-800",
  DELETE: "bg-red-100 text-red-800",
  LOGIN: "bg-purple-100 text-purple-800",
  LOGOUT: "bg-gray-100 text-gray-800",
  SETTINGS_CHANGE: "bg-yellow-100 text-yellow-800",
  STATUS_CHANGE: "bg-orange-100 text-orange-800",
};

export default function AdminLogsPage() {
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";
  const canViewLogs = isSuperAdmin(userRole) || userRole === "ADMIN";

  if (!canViewLogs) {
    return (
      <PermissionGuard permission={Permission.MANAGE_USERS}>
        <div>Bu sayfaya erişim yetkiniz yok.</div>
      </PermissionGuard>
    );
  }

  return <AdminLogsPageContent />;
}

function AdminLogsPageContent() {
  const [logs, setLogs] = useState<AdminLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    userId: "",
    action: "",
    entityType: "",
    startDate: "",
    endDate: "",
  });
  const [selectedLog, setSelectedLog] = useState<AdminLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, filters]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (filters.userId) params.append("userId", filters.userId);
      if (filters.action) params.append("action", filters.action);
      if (filters.entityType) params.append("entityType", filters.entityType);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/admin/logs?${params.toString()}`);
      if (response.ok) {
        const data: LogsResponse = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters({ ...filters, [key]: value });
    setPagination({ ...pagination, page: 1 });
  };

  const handleViewDetails = (log: AdminLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const formatChanges = (changes: any) => {
    if (!changes || !changes.old || !changes.new) {
      return null;
    }

    const oldData = changes.old;
    const newData = changes.new;
    const changedFields: Array<{ field: string; old: any; new: any }> = [];

    for (const key in newData) {
      if (JSON.stringify(oldData[key]) !== JSON.stringify(newData[key])) {
        changedFields.push({
          field: key,
          old: oldData[key],
          new: newData[key],
        });
      }
    }

    return changedFields;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold">Admin Logları</h1>
        <p className="text-muted-foreground mt-1">
          Tüm admin işlemlerinin kayıtları
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtreler</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div>
              <Label htmlFor="action">Aksiyon</Label>
              <Select
                value={filters.action || "all"}
                onValueChange={(value) => handleFilterChange("action", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  {Object.entries(actionLabels).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="entityType">Entity Tipi</Label>
              <Select
                value={filters.entityType || "all"}
                onValueChange={(value) => handleFilterChange("entityType", value === "all" ? "" : value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Tümü" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tümü</SelectItem>
                  <SelectItem value="Event">Event</SelectItem>
                  <SelectItem value="Announcement">Announcement</SelectItem>
                  <SelectItem value="User">User</SelectItem>
                  <SelectItem value="Settings">Settings</SelectItem>
                  <SelectItem value="Slider">Slider</SelectItem>
                  <SelectItem value="Partner">Partner</SelectItem>
                  <SelectItem value="Category">Category</SelectItem>
                  <SelectItem value="OrganCategory">OrganCategory</SelectItem>
                  <SelectItem value="OrganMember">OrganMember</SelectItem>
                  <SelectItem value="Stats">Stats</SelectItem>
                  <SelectItem value="FormField">FormField</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="startDate">Başlangıç Tarihi</Label>
              <Input
                id="startDate"
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange("startDate", e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="endDate">Bitiş Tarihi</Label>
              <Input
                id="endDate"
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange("endDate", e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setFilters({
                    userId: "",
                    action: "",
                    entityType: "",
                    startDate: "",
                    endDate: "",
                  });
                  setPagination({ ...pagination, page: 1 });
                }}
                className="w-full"
              >
                Filtreleri Temizle
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <CardTitle>Log Kayıtları</CardTitle>
              <CardDescription>
                Toplam {pagination.total} kayıt bulundu
              </CardDescription>
            </div>
            <Button
              className="w-full md:w-auto bg-green-600 hover:bg-green-700"
              onClick={async () => {
                try {
                  const params = new URLSearchParams({
                    page: pagination.page.toString(),
                    limit: pagination.limit.toString(),
                  });

                  if (filters.userId) params.append("userId", filters.userId);
                  if (filters.action && filters.action !== "all")
                    params.append("action", filters.action);
                  if (filters.entityType && filters.entityType !== "all")
                    params.append("entityType", filters.entityType);
                  if (filters.startDate) params.append("startDate", filters.startDate);
                  if (filters.endDate) params.append("endDate", filters.endDate);

                  const response = await fetch(`/api/admin/logs/export?${params}`);
                  if (response.ok) {
                    const blob = await response.blob();
                    const url = window.URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `admin_loglari_${new Date().toISOString().split("T")[0]}.xlsx`;
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
              }}
            >
              📥 Excel'e Aktar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {logs.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Log kaydı bulunamadı.
            </p>
          ) : (
            <div className="space-y-4">
              <div className="space-y-2">
                {logs.map((log) => (
                  <div
                    key={log.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Badge
                            className={
                              actionColors[log.action] ||
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {actionLabels[log.action] || log.action}
                          </Badge>
                          <span className="text-sm font-medium">
                            {log.entityType}
                          </span>
                          {log.entityName && (
                            <span className="text-sm text-muted-foreground">
                              - {log.entityName}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          <span className="font-medium">{log.user.name || log.user.email}</span>
                          {" • "}
                          {new Date(log.createdAt).toLocaleString("tr-TR")}
                          {log.ipAddress && ` • ${log.ipAddress}`}
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleViewDetails(log)}
                      >
                        Detay
                      </Button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Pagination */}
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 pt-4">
                <div className="text-sm text-muted-foreground text-center md:text-left">
                  Sayfa {pagination.page} / {pagination.totalPages}
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-none"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page - 1 })
                    }
                    disabled={pagination.page === 1}
                  >
                    Önceki
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 md:flex-none"
                    onClick={() =>
                      setPagination({ ...pagination, page: pagination.page + 1 })
                    }
                    disabled={pagination.page >= pagination.totalPages}
                  >
                    Sonraki
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog open={detailDialogOpen} onOpenChange={setDetailDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Log Detayları</DialogTitle>
            <DialogDescription>
              {selectedLog?.action} - {selectedLog?.entityType}
            </DialogDescription>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold mb-2">Genel Bilgiler</h3>
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">Kullanıcı:</span>{" "}
                    {selectedLog.user.name || selectedLog.user.email} ({selectedLog.user.role})
                  </div>
                  <div>
                    <span className="font-medium">Aksiyon:</span>{" "}
                    {actionLabels[selectedLog.action] || selectedLog.action}
                  </div>
                  <div>
                    <span className="font-medium">Entity:</span> {selectedLog.entityType}
                    {selectedLog.entityName && ` - ${selectedLog.entityName}`}
                  </div>
                  <div>
                    <span className="font-medium">Tarih:</span>{" "}
                    {new Date(selectedLog.createdAt).toLocaleString("tr-TR")}
                  </div>
                  {selectedLog.ipAddress && (
                    <div>
                      <span className="font-medium">IP Adresi:</span>{" "}
                      {selectedLog.ipAddress}
                    </div>
                  )}
                  {selectedLog.userAgent && (
                    <div>
                      <span className="font-medium">User Agent:</span>{" "}
                      {selectedLog.userAgent}
                    </div>
                  )}
                </div>
              </div>

              {selectedLog.changes && (
                <div>
                  <h3 className="font-semibold mb-2">Değişiklikler</h3>
                  <div className="space-y-2">
                    {formatChanges(selectedLog.changes)?.map((change, index) => (
                      <div
                        key={index}
                        className="border rounded p-3 bg-muted/50"
                      >
                        <div className="font-medium mb-1">{change.field}</div>
                        <div className="grid grid-cols-2 gap-2 text-sm">
                          <div>
                            <span className="text-red-600 font-medium">Eski:</span>
                            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto">
                              {JSON.stringify(change.old, null, 2)}
                            </pre>
                          </div>
                          <div>
                            <span className="text-green-600 font-medium">Yeni:</span>
                            <pre className="mt-1 text-xs bg-white p-2 rounded overflow-auto">
                              {JSON.stringify(change.new, null, 2)}
                            </pre>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <h3 className="font-semibold mb-2">Metadata</h3>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

