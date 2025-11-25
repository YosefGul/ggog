import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission, isSuperAdmin } from "@/lib/permissions";
import * as XLSX from "xlsx";

const actionLabels: Record<string, string> = {
  CREATE: "Oluşturma",
  UPDATE: "Güncelleme",
  DELETE: "Silme",
  LOGIN: "Giriş",
  LOGOUT: "Çıkış",
  SETTINGS_CHANGE: "Ayar Değişikliği",
  STATUS_CHANGE: "Durum Değişikliği",
};

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!isSuperAdmin(userRole) && userRole !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");
    const action = searchParams.get("action");
    const entityType = searchParams.get("entityType");
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");

    const where: any = {};

    if (userId) where.userId = userId;
    if (action && action !== "all") where.action = action;
    if (entityType && entityType !== "all") where.entityType = entityType;
    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.createdAt.lte = end;
      }
    }

    const logs = await prisma.adminLog.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Excel için veri hazırlama
    const excelData = logs.map((log, index) => {
      let changesText = "";
      if (log.changes && typeof log.changes === "object") {
        try {
          const changes = log.changes as any;
          if (changes.old && changes.new) {
            const changedFields: string[] = [];
            Object.keys(changes.new).forEach((key) => {
              if (JSON.stringify(changes.old[key]) !== JSON.stringify(changes.new[key])) {
                changedFields.push(
                  `${key}: "${changes.old[key]}" → "${changes.new[key]}"`
                );
              }
            });
            changesText = changedFields.join("; ");
          }
        } catch (e) {
          changesText = JSON.stringify(log.changes);
        }
      }

      return {
        "#": index + 1,
        "Tarih": new Date(log.createdAt).toLocaleString("tr-TR"),
        "Kullanıcı": log.user.name || log.user.email,
        "Kullanıcı Rolü": log.user.role,
        "Aksiyon": actionLabels[log.action] || log.action,
        "Entity Tipi": log.entityType,
        "Entity Adı": log.entityName || "",
        "Değişiklikler": changesText,
        "IP Adresi": log.ipAddress || "",
        "User Agent": log.userAgent || "",
      };
    });

    // Excel workbook oluştur
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 5 }, // #
      { wch: 20 }, // Tarih
      { wch: 25 }, // Kullanıcı
      { wch: 15 }, // Kullanıcı Rolü
      { wch: 15 }, // Aksiyon
      { wch: 20 }, // Entity Tipi
      { wch: 30 }, // Entity Adı
      { wch: 50 }, // Değişiklikler
      { wch: 18 }, // IP Adresi
      { wch: 50 }, // User Agent
    ];
    worksheet["!cols"] = columnWidths;

    // Header stilini ayarla
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4472C4" } },
      alignment: { horizontal: "center", vertical: "center" },
    };

    // İlk satırı (header) stilize et
    const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: 0, c: col });
      if (!worksheet[cellAddress]) continue;
      worksheet[cellAddress].s = headerStyle;
    }

    XLSX.utils.book_append_sheet(workbook, worksheet, "Admin Logları");

    // Excel dosyasını buffer'a çevir
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Dosya adı oluştur
    const fileName = `admin_loglari_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting logs:", error);
    return NextResponse.json(
      { error: "Failed to export logs" },
      { status: 500 }
    );
  }
}

