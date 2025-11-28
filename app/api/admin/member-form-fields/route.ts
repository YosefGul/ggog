import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user.role, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const fields = await prisma.formField.findMany({
      where: {
        isMemberForm: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    return NextResponse.json(fields);
  } catch (error) {
    return handleError(error, "Failed to fetch member form fields");
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user.role, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { fieldType, label, placeholder, isRequired, helpText, options, order } = body;

    if (!fieldType || !label) {
      return NextResponse.json(
        { error: "fieldType and label are required" },
        { status: 400 }
      );
    }

    const field = await prisma.formField.create({
      data: {
        isMemberForm: true,
        fieldType,
        label,
        placeholder: placeholder || null,
        isRequired: isRequired || false,
        helpText: helpText || null,
        options: options ? JSON.parse(JSON.stringify(options)) : null,
        order: order || 0,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    return handleError(error, "Failed to create member form field");
  }
}


