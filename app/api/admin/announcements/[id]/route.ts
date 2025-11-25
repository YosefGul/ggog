import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent, getChanges } from "@/lib/admin-logger";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const announcement = await prisma.announcement.findUnique({
      where: { id },
    });

    if (!announcement) {
      return NextResponse.json(
        { error: "Announcement not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error fetching announcement:", error);
    return NextResponse.json(
      { error: "Failed to fetch announcement" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldAnnouncement = await prisma.announcement.findUnique({
      where: { id },
    });

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

    const announcement = await prisma.announcement.update({
      where: { id },
      data: {
        title,
        description,
        image: image || null,
        link: link || null,
        linkTitle: linkTitle || null,
        isActive,
        order,
        publishedAt: publishedAt ? new Date(publishedAt) : undefined,
      },
    });

    // Log admin action with changes
    const changes = oldAnnouncement ? getChanges(oldAnnouncement, announcement) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "Announcement",
      entityId: announcement.id,
      entityName: announcement.title,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(announcement);
  } catch (error) {
    console.error("Error updating announcement:", error);
    return NextResponse.json(
      { error: "Failed to update announcement" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_ANNOUNCEMENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get announcement data before deletion for logging
    const announcement = await prisma.announcement.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    await prisma.announcement.delete({
      where: { id },
    });

    // Log admin action
    if (announcement) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "Announcement",
        entityId: announcement.id,
        entityName: announcement.title,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting announcement:", error);
    return NextResponse.json(
      { error: "Failed to delete announcement" },
      { status: 500 }
    );
  }
}



