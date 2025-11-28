import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const fields = await prisma.formField.findMany({
      where: {
        isMemberForm: true,
      },
      orderBy: {
        order: "asc",
      },
    });

    // Transform options from JSON to array
    const transformedFields = fields.map((field) => ({
      id: field.id,
      fieldType: field.fieldType,
      label: field.label,
      placeholder: field.placeholder || undefined,
      isRequired: field.isRequired,
      helpText: field.helpText || undefined,
      options: field.options ? (Array.isArray(field.options) ? field.options : []) : undefined,
    }));

    return NextResponse.json(transformedFields);
  } catch (error) {
    console.error("Error fetching member form fields:", error);
    return NextResponse.json(
      { error: "Failed to fetch form fields" },
      { status: 500 }
    );
  }
}


