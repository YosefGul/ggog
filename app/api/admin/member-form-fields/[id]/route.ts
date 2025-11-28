import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { hasPermission, Permission } from "@/lib/permissions";
import { handleError } from "@/lib/error-handler";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (!hasPermission(user.role, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const field = await prisma.formField.findUnique({
      where: { id },
    });

    if (!field || !field.isMemberForm) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    return NextResponse.json(field);
  } catch (error) {
    return handleError(error, "Failed to fetch member form field");
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

    if (!hasPermission(user.role, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const { fieldType, label, placeholder, isRequired, helpText, options, order } = body;

    const existingField = await prisma.formField.findUnique({
      where: { id },
    });

    if (!existingField || !existingField.isMemberForm) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    const field = await prisma.formField.update({
      where: { id },
      data: {
        fieldType: fieldType || existingField.fieldType,
        label: label || existingField.label,
        placeholder: placeholder !== undefined ? placeholder : existingField.placeholder,
        isRequired: isRequired !== undefined ? isRequired : existingField.isRequired,
        helpText: helpText !== undefined ? helpText : existingField.helpText,
        options: options !== undefined ? JSON.parse(JSON.stringify(options)) : existingField.options,
        order: order !== undefined ? order : existingField.order,
      },
    });

    return NextResponse.json(field);
  } catch (error) {
    return handleError(error, "Failed to update member form field");
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

    if (!hasPermission(user.role, Permission.MANAGE_FORM_FIELDS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const existingField = await prisma.formField.findUnique({
      where: { id },
    });

    if (!existingField || !existingField.isMemberForm) {
      return NextResponse.json({ error: "Field not found" }, { status: 404 });
    }

    await prisma.formField.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleError(error, "Failed to delete member form field");
  }
}


