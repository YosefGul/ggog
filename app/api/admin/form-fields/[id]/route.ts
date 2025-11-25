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
    const field = await prisma.formField.findUnique({
      where: { id },
      include: {
        eventCategory: true,
      },
    });

    if (!field) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error fetching form field:", error);
    return NextResponse.json(
      { error: "Failed to fetch form field" },
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
    if (!hasPermission(userRole, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldField = await prisma.formField.findUnique({
      where: { id },
    });

    const body = await request.json();
    const {
      eventCategoryId,
      fieldType,
      label,
      placeholder,
      isRequired,
      helpText,
      options,
      order,
    } = body;

    const field = await prisma.formField.update({
      where: { id },
      data: {
        eventCategoryId: eventCategoryId || null,
        fieldType,
        label,
        placeholder: placeholder || null,
        isRequired,
        helpText: helpText || null,
        options: options ? JSON.parse(JSON.stringify(options)) : null,
        order,
      },
    });

    // Log admin action with changes
    const changes = oldField ? getChanges(oldField, field) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "FormField",
      entityId: field.id,
      entityName: field.label,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error updating form field:", error);
    return NextResponse.json(
      { error: "Failed to update form field" },
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
    if (!hasPermission(userRole, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get field data before deletion for logging
    const field = await prisma.formField.findUnique({
      where: { id },
      select: { id: true, label: true },
    });

    await prisma.formField.delete({
      where: { id },
    });

    // Log admin action
    if (field) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "FormField",
        entityId: field.id,
        entityName: field.label,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting form field:", error);
    return NextResponse.json(
      { error: "Failed to delete form field" },
      { status: 500 }
    );
  }
}



