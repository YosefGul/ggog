import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import * as XLSX from "xlsx";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get("eventId");
    const status = searchParams.get("status");

    const where: any = {};
    if (eventId) where.eventId = eventId;
    if (status) where.status = status;

    const applications = await prisma.eventApplication.findMany({
      where,
      include: {
        event: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    // Excel için veri hazırlama
    const excelData = applications.map((app, index) => {
      const formData = app.formData as any;
      const formFields: Record<string, any> = {};

      // Form verilerini düzleştir
      if (formData && typeof formData === "object") {
        Object.keys(formData).forEach((key) => {
          const value = formData[key];
          if (typeof value === "object" && value !== null) {
            formFields[key] = JSON.stringify(value);
          } else {
            formFields[key] = value || "";
          }
        });
      }

      return {
        "#": index + 1,
        "Etkinlik": app.event.title,
        "Durum":
          app.status === "pending"
            ? "Beklemede"
            : app.status === "approved"
            ? "Onaylandı"
            : "Reddedildi",
        "Başvuru Tarihi": new Date(app.createdAt).toLocaleString("tr-TR"),
        ...formFields,
      };
    });

    // Excel workbook oluştur
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Sütun genişliklerini ayarla
    const maxColumns = Math.max(
      4,
      ...excelData.map((row) => Object.keys(row).length)
    );
    const columnWidths = Array(maxColumns).fill({ wch: 20 });
    columnWidths[0] = { wch: 5 }; // #
    columnWidths[1] = { wch: 30 }; // Etkinlik
    columnWidths[2] = { wch: 12 }; // Durum
    columnWidths[3] = { wch: 20 }; // Başvuru Tarihi
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Etkinlik Başvuruları");

    // Excel dosyasını buffer'a çevir
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Dosya adı oluştur
    const fileName = `etkinlik_basvurulari_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting event applications:", error);
    return NextResponse.json(
      { error: "Failed to export applications" },
      { status: 500 }
    );
  }
}

