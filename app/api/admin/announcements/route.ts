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
    if (!hasPermission(userRole, Permission.MANAGE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const announcements = await prisma.announcement.findMany({
      orderBy: { order: "asc" },
    });

    return NextResponse.json(announcements);
  } catch (error) {
    console.error("Error fetching announcements:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcements" },
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
    if (!hasPermission(userRole, Permission.MANAGE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const {
      title,
      description,
      image,
      link,
      linkTitle,
      isActive,
      order,
      publishedAt,
    } = body;

    const announcement = await prisma.announcement.create({
      data: {
        title,
        description,
        image: image || null,
        link: link || null,
        linkTitle: linkTitle || null,
        isActive: isActive !== undefined ? isActive : true,
        order: order || 0,
        publishedAt: publishedAt ? new Date(publishedAt) : new Date(),
      },
    });

    // Log admin action
    await logAdminAction({
      userId: (user as any).id,
      action: "CREATE",
      entityType: "Announcement",
      entityId: announcement.id,
      entityName: announcement.title,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error creating announcement:", error);
    return NextResponse.json(
      { error: "Failed to create announcement" },
      { status: 500 }
    );
  }
}



