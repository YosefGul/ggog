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
    if (!hasPermission(userRole, Permission.MANAGE_MEMBER_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");

    const where: any = {};
    if (status && status !== "all") {
      where.status = status;
    }

    const applications = await prisma.memberApplication.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });

    // Excel için veri hazırlama
    const excelData = applications.map((app, index) => ({
      "#": index + 1,
      "Ad": app.firstName,
      "Soyad": app.lastName,
      "E-posta": app.email,
      "Telefon": app.phone,
      "Doğum Tarihi": app.dateOfBirth
        ? new Date(app.dateOfBirth).toLocaleDateString("tr-TR")
        : "",
      "Şehir": app.city || "",
      "Ülke": app.country || "",
      "Adres": app.address || "",
      "Meslek": app.occupation || "",
      "Şirket": app.company || "",
      "Tercih Edilen Rol": app.preferredRole || "",
      "Deneyim": app.experience || "",
      "Yetenekler": app.skills || "",
      "Oyun Geliştirme Deneyimi": app.gameDevelopmentExperience || "",
      "Motivasyon": app.motivation || "",
      "Beklentiler": app.expectations || "",
      "Portföy": app.portfolio || "",
      "LinkedIn": app.linkedin || "",
      "GitHub": app.github || "",
      "Web Sitesi": app.website || "",
      "Durum":
        app.status === "pending"
          ? "Beklemede"
          : app.status === "approved"
          ? "Onaylandı"
          : "Reddedildi",
      "Başvuru Tarihi": new Date(app.createdAt).toLocaleString("tr-TR"),
    }));

    // Excel workbook oluştur
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(excelData);

    // Sütun genişliklerini ayarla
    const columnWidths = [
      { wch: 5 }, // #
      { wch: 15 }, // Ad
      { wch: 15 }, // Soyad
      { wch: 25 }, // E-posta
      { wch: 15 }, // Telefon
      { wch: 12 }, // Doğum Tarihi
      { wch: 15 }, // Şehir
      { wch: 15 }, // Ülke
      { wch: 30 }, // Adres
      { wch: 20 }, // Meslek
      { wch: 20 }, // Şirket
      { wch: 20 }, // Tercih Edilen Rol
      { wch: 30 }, // Deneyim
      { wch: 30 }, // Yetenekler
      { wch: 30 }, // Oyun Geliştirme Deneyimi
      { wch: 30 }, // Motivasyon
      { wch: 30 }, // Beklentiler
      { wch: 30 }, // Portföy
      { wch: 30 }, // LinkedIn
      { wch: 30 }, // GitHub
      { wch: 30 }, // Web Sitesi
      { wch: 12 }, // Durum
      { wch: 20 }, // Başvuru Tarihi
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

    XLSX.utils.book_append_sheet(workbook, worksheet, "Üye Başvuruları");

    // Excel dosyasını buffer'a çevir
    const excelBuffer = XLSX.write(workbook, {
      type: "buffer",
      bookType: "xlsx",
    });

    // Dosya adı oluştur
    const fileName = `uye_basvurulari_${new Date().toISOString().split("T")[0]}.xlsx`;

    return new NextResponse(excelBuffer, {
      headers: {
        "Content-Type":
          "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "Content-Disposition": `attachment; filename="${fileName}"`,
      },
    });
  } catch (error) {
    console.error("Error exporting member applications:", error);
    return NextResponse.json(
      { error: "Failed to export applications" },
      { status: 500 }
    );
  }
}

