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

    const { id } = await params;
    const stat = await prisma.aboutStats.findUnique({
      where: { id },
    });

    if (!stat) {
      return NextResponse.json({ error: "Stat not found" }, { status: 404 });
    }

    return NextResponse.json(stat);
  } catch (error) {
    console.error("Error fetching stat:", error);
    return NextResponse.json(
      { error: "Failed to fetch stat" },
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
    if (!hasPermission(userRole, Permission.MANAGE_STATS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldStat = await prisma.aboutStats.findUnique({
      where: { id },
    });

    const body = await request.json();
    const { title, value, icon, order } = body;

    const stat = await prisma.aboutStats.update({
      where: { id },
      data: {
        title,
        value,
        icon,
        order,
      },
    });

    // Log admin action with changes
    const changes = oldStat ? getChanges(oldStat, stat) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "Stats",
      entityId: stat.id,
      entityName: stat.title,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(stat);
  } catch (error) {
    console.error("Error updating stat:", error);
    return NextResponse.json(
      { error: "Failed to update stat" },
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
    if (!hasPermission(userRole, Permission.MANAGE_STATS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get stat data before deletion for logging
    const stat = await prisma.aboutStats.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    await prisma.aboutStats.delete({
      where: { id },
    });

    // Log admin action
    if (stat) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "Stats",
        entityId: stat.id,
        entityName: stat.title,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting stat:", error);
    return NextResponse.json(
      { error: "Failed to delete stat" },
      { status: 500 }
    );
  }
}



