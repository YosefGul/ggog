import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent } from "@/lib/admin-logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_SLIDERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const sliders = await prisma.slider.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(sliders);
  } catch (error) {
    console.error("Error fetching sliders:", error);
    return NextResponse.json(
      { error: "Failed to fetch sliders" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_SLIDERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, image, link, linkTitle, hasLink, isActive, order } = body;

    const slider = await prisma.slider.create({
      data: {
        title,
        description,
        image,
        link: hasLink ? link : null,
        linkTitle: hasLink ? linkTitle : null,
        hasLink: hasLink || false,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
      },
    });

    // Log admin action
    await logAdminAction({
      userId: (user as any).id,
      action: "CREATE",
      entityType: "Slider",
      entityId: slider.id,
      entityName: slider.title,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error("Error creating slider:", error);
    return NextResponse.json(
      { error: "Failed to create slider" },
      { status: 500 }
    );
  }
}



