import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent, getChanges } from "@/lib/admin-logger";

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
    if (!hasPermission(userRole, Permission.MANAGE_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldApplication = await prisma.eventApplication.findUnique({
      where: { id },
      include: { event: { select: { title: true } } },
    });

    const body = await request.json();
    const { status } = body;

    const application = await prisma.eventApplication.update({
      where: { id },
      data: { status },
      include: { event: { select: { title: true } } },
    });

    // Log admin action with changes
    const changes = oldApplication ? getChanges(oldApplication, application) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "STATUS_CHANGE",
      entityType: "EventApplication",
      entityId: application.id,
      entityName: oldApplication?.event?.title || "Event Application",
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
      metadata: { newStatus: status },
    });

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error updating application:", error);
    return NextResponse.json(
      { error: "Failed to update application" },
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
    if (!hasPermission(userRole, Permission.MANAGE_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get application data before deletion for logging
    const application = await prisma.eventApplication.findUnique({
      where: { id },
      include: { event: { select: { title: true } } },
    });

    await prisma.eventApplication.delete({
      where: { id },
    });

    // Log admin action
    if (application) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "EventApplication",
        entityId: application.id,
        entityName: application.event?.title || "Event Application",
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}



