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
    const partner = await prisma.partner.findUnique({
      where: { id },
    });

    if (!partner) {
      return NextResponse.json({ error: "Partner not found" }, { status: 404 });
    }

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error fetching partner:", error);
    return NextResponse.json(
      { error: "Failed to fetch partner" },
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
    if (!hasPermission(userRole, Permission.MANAGE_PARTNERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldPartner = await prisma.partner.findUnique({
      where: { id },
    });

    const body = await request.json();
    const { name, logo, order, isActive } = body;

    const partner = await prisma.partner.update({
      where: { id },
      data: {
        name,
        logo,
        order,
        isActive,
      },
    });

    // Log admin action with changes
    const changes = oldPartner ? getChanges(oldPartner, partner) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "Partner",
      entityId: partner.id,
      entityName: partner.name,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(partner);
  } catch (error) {
    console.error("Error updating partner:", error);
    return NextResponse.json(
      { error: "Failed to update partner" },
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
    if (!hasPermission(userRole, Permission.MANAGE_PARTNERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get partner data before deletion for logging
    const partner = await prisma.partner.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    await prisma.partner.delete({
      where: { id },
    });

    // Log admin action
    if (partner) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "Partner",
        entityId: partner.id,
        entityName: partner.name,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting partner:", error);
    return NextResponse.json(
      { error: "Failed to delete partner" },
      { status: 500 }
    );
  }
}



