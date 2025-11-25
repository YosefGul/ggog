import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showOnHomepage = searchParams.get("showOnHomepage");
    const limit = searchParams.get("limit");

    const where: any = {};
    if (showOnHomepage === "true") {
      where.showOnHomepage = true;
    }

    const events = await prisma.event.findMany({
      where,
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
          take: 1,
        },
      },
      orderBy: { order: "asc" },
      take: limit ? parseInt(limit) : undefined,
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
      { status: 500 }
    );
  }
}



