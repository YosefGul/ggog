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

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_SLIDERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const slider = await prisma.slider.findUnique({
      where: { id },
    });

    if (!slider) {
      return NextResponse.json({ error: "Slider not found" }, { status: 404 });
    }

    return NextResponse.json(slider);
  } catch (error) {
    console.error("Error fetching slider:", error);
    return NextResponse.json(
      { error: "Failed to fetch slider" },
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
    if (!hasPermission(userRole, Permission.MANAGE_SLIDERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get old data for comparison
    const oldSlider = await prisma.slider.findUnique({
      where: { id },
    });

    const body = await request.json();
    const { title, description, image, link, linkTitle, hasLink, isActive, order } = body;

    const slider = await prisma.slider.update({
      where: { id },
      data: {
        title,
        description,
        image,
        link: hasLink ? link : null,
        linkTitle: hasLink ? linkTitle : null,
        hasLink: hasLink || false,
        isActive,
        order,
      },
    });

    // Log admin action with changes
    const changes = oldSlider ? getChanges(oldSlider, slider) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "Slider",
      entityId: slider.id,
      entityName: slider.title,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(slider);
  } catch (error) {
    console.error("Error updating slider:", error);
    return NextResponse.json(
      { error: "Failed to update slider" },
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
    if (!hasPermission(userRole, Permission.MANAGE_SLIDERS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get slider data before deletion for logging
    const slider = await prisma.slider.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    await prisma.slider.delete({
      where: { id },
    });

    // Log admin action
    if (slider) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "Slider",
        entityId: slider.id,
        entityName: slider.title,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting slider:", error);
    return NextResponse.json(
      { error: "Failed to delete slider" },
      { status: 500 }
    );
  }
}



