import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import ExcelJS from "exceljs";
import { handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const subscriptions = await prisma.newsletterSubscription.findMany({
      orderBy: { subscribedAt: "desc" },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Newsletter Aboneleri");

    // Stil tanımlamaları
    const headerStyle = {
      font: { bold: true, color: { argb: "FFFFFFFF" } },
      fill: {
        type: "pattern" as const,
        pattern: "solid" as const,
        fgColor: { argb: "FF2563EB" },
      },
      alignment: { horizontal: "center" as const, vertical: "middle" as const },
      border: {
        top: { style: "thin" as const },
        left: { style: "thin" as const },
        bottom: { style: "thin" as const },
        right: { style: "thin" as const },
      },
    };

    // Başlık satırı
    worksheet.addRow(["E-posta", "Abone Olma Tarihi", "Durum"]);
    const headerRow = worksheet.getRow(1);
    headerRow.font = headerStyle.font;
    headerRow.fill = headerStyle.fill;
    headerRow.alignment = headerStyle.alignment;
    headerRow.border = headerStyle.border;
    headerRow.height = 25;

    // Veri satırları
    subscriptions.forEach((sub) => {
      const row = worksheet.addRow([
        sub.email,
        new Date(sub.subscribedAt).toLocaleString("tr-TR"),
        sub.isActive ? "Aktif" : "Pasif",
      ]);
      row.height = 20;
      row.getCell(3).font = {
        color: { argb: sub.isActive ? "FF16A34A" : "FFDC2626" },
      };
    });

    // Sütun genişlikleri
    worksheet.getColumn(1).width = 40;
    worksheet.getColumn(2).width = 25;
    worksheet.getColumn(3).width = 15;

    // Tüm hücrelere border ekle
    worksheet.eachRow((row, rowNumber) => {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: "thin" },
          left: { style: "thin" },
          bottom: { style: "thin" },
          right: { style: "thin" },
        };
        if (rowNumber > 1) {
          cell.alignment = { vertical: "middle" };
        }
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();

    return new NextResponse(buffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="newsletter_aboneleri_${new Date().toISOString().split("T")[0]}.xlsx"`,
      },
    });
  } catch (error) {
    return handleError(error);
  }
}


