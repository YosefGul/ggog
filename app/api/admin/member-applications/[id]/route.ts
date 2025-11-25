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
    const application = await prisma.memberApplication.findUnique({
      where: { id },
    });

    if (!application) {
      return NextResponse.json(
        { error: "Application not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(application);
  } catch (error) {
    console.error("Error fetching application:", error);
    return NextResponse.json(
      { error: "Failed to fetch application" },
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
    if (!hasPermission(userRole, Permission.MANAGE_MEMBER_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldApplication = await prisma.memberApplication.findUnique({
      where: { id },
    });

    const { status } = await request.json();

    const application = await prisma.memberApplication.update({
      where: { id },
      data: { status },
    });

    // Log admin action with changes
    const changes = oldApplication ? getChanges(oldApplication, application) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "STATUS_CHANGE",
      entityType: "MemberApplication",
      entityId: application.id,
      entityName: `${application.firstName} ${application.lastName}`,
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
    if (!hasPermission(userRole, Permission.MANAGE_MEMBER_APPLICATIONS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get application data before deletion for logging
    const application = await prisma.memberApplication.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true },
    });

    await prisma.memberApplication.delete({
      where: { id },
    });

    // Log admin action
    if (application) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "MemberApplication",
        entityId: application.id,
        entityName: `${application.firstName} ${application.lastName}`,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ message: "Application deleted" });
  } catch (error) {
    console.error("Error deleting application:", error);
    return NextResponse.json(
      { error: "Failed to delete application" },
      { status: 500 }
    );
  }
}



