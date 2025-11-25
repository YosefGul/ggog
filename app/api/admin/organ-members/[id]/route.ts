import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_MEMBERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const member = await prisma.organMember.findUnique({
      where: { id },
      include: {
        category: true,
      },
    });

    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error fetching organ member:", error);
    return NextResponse.json(
      { error: "Failed to fetch member" },
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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_MEMBERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldMember = await prisma.organMember.findUnique({
      where: { id },
    });

    const body = await request.json();
    const { categoryId, firstName, lastName, department, role, imageUrl, order, isActive } = body;

    const member = await prisma.organMember.update({
      where: { id },
      data: {
        categoryId,
        firstName,
        lastName,
        department,
        role,
        imageUrl: imageUrl || null,
        order,
        isActive,
      },
    });

    // Log admin action with changes
    const changes = oldMember ? getChanges(oldMember, member) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "OrganMember",
      entityId: member.id,
      entityName: `${member.firstName} ${member.lastName}`,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(member);
  } catch (error) {
    console.error("Error updating organ member:", error);
    return NextResponse.json(
      { error: "Failed to update member" },
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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_MEMBERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get member data before deletion for logging
    const member = await prisma.organMember.findUnique({
      where: { id },
      select: { id: true, firstName: true, lastName: true },
    });

    await prisma.organMember.delete({
      where: { id },
    });

    // Log admin action
    if (member) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "OrganMember",
        entityId: member.id,
        entityName: `${member.firstName} ${member.lastName}`,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organ member:", error);
    return NextResponse.json(
      { error: "Failed to delete member" },
      { status: 500 }
    );
  }
}



