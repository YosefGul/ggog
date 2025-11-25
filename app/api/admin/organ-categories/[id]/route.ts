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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_CATEGORIES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const category = await prisma.organCategory.findUnique({
      where: { id },
      include: {
        members: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!category) {
      return NextResponse.json(
        { error: "Category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error fetching organ category:", error);
    return NextResponse.json(
      { error: "Failed to fetch category" },
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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_CATEGORIES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldCategory = await prisma.organCategory.findUnique({
      where: { id },
    });

    const body = await request.json();
    const { name, description, order, isActive } = body;

    const category = await prisma.organCategory.update({
      where: { id },
      data: {
        name,
        description,
        order,
        isActive,
      },
    });

    // Log admin action with changes
    const changes = oldCategory ? getChanges(oldCategory, category) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "OrganCategory",
      entityId: category.id,
      entityName: category.name,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(category);
  } catch (error) {
    console.error("Error updating organ category:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
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
    if (!hasPermission(userRole, Permission.MANAGE_ORGAN_CATEGORIES)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get category data before deletion for logging
    const category = await prisma.organCategory.findUnique({
      where: { id },
      select: { id: true, name: true },
    });

    await prisma.organCategory.delete({
      where: { id },
    });

    // Log admin action
    if (category) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "OrganCategory",
        entityId: category.id,
        entityName: category.name,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting organ category:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}



