import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent } from "@/lib/admin-logger";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("categoryId");

    const where = categoryId ? { eventCategoryId: categoryId } : {};

    const fields = await prisma.formField.findMany({
      where,
      include: {
        eventCategory: true,
      },
      orderBy: { order: "asc" },
    });

    return NextResponse.json(fields);
  } catch (error) {
    console.error("Error fetching form fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch form fields" },
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
    if (!hasPermission(userRole, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    const field = await prisma.formField.create({
      data: {
        eventCategoryId: eventCategoryId || null,
        fieldType,
        label,
        placeholder: placeholder || null,
        isRequired: isRequired || false,
        helpText: helpText || null,
        options: options ? JSON.parse(JSON.stringify(options)) : null,
        order: order || 0,
      },
    });

    // Log admin action
    await logAdminAction({
      userId: (user as any).id,
      action: "CREATE",
      entityType: "FormField",
      entityId: field.id,
      entityName: field.label,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(field);
  } catch (error) {
    console.error("Error creating form field:", error);
    return NextResponse.json(
      { error: "Failed to create form field" },
      { status: 500 }
    );
  }
}



