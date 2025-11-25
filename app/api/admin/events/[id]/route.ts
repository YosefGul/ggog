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
    if (!hasPermission(userRole, Permission.MANAGE_EVENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    return NextResponse.json(
      { error: "Failed to fetch event" },
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
    if (!hasPermission(userRole, Permission.MANAGE_EVENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();
    const {
      title,
      description,
      eventDate,
      location,
      eventType,
      participantLimit,
      applicationDeadline,
      categoryId,
      acceptsApplications,
      isPastEvent,
      driveLink,
      details,
      showOnHomepage,
      order,
      images,
    } = body;

    // Get old data for comparison
    const oldEvent = await prisma.event.findUnique({
      where: { id },
    });

    // Delete existing images
    await prisma.eventImage.deleteMany({
      where: { eventId: id },
    });

    const event = await prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        eventDate: eventDate ? new Date(eventDate) : null,
        location,
        eventType,
        participantLimit: participantLimit ? parseInt(participantLimit) : null,
        applicationDeadline: applicationDeadline
          ? new Date(applicationDeadline)
          : null,
        categoryId: categoryId || null,
        acceptsApplications,
        isPastEvent,
        driveLink: driveLink || null,
        details: details || null,
        showOnHomepage,
        order,
        images: {
          create: (images || []).map((img: { url: string; order: number }, index: number) => ({
            imageUrl: img.url,
            order: img.order !== undefined ? img.order : index,
          })),
        },
      },
      include: {
        images: true,
        category: true,
      },
    });

    // Log admin action with changes
    const changes = oldEvent ? getChanges(oldEvent, event) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: "UPDATE",
      entityType: "Event",
      entityId: event.id,
      entityName: event.title,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    return NextResponse.json(
      { error: "Failed to update event" },
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
    if (!hasPermission(userRole, Permission.MANAGE_EVENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id } = await params;
    // Get event data before deletion for logging
    const event = await prisma.event.findUnique({
      where: { id },
      select: { id: true, title: true },
    });

    await prisma.event.delete({
      where: { id },
    });

    // Log admin action
    if (event) {
      await logAdminAction({
        userId: (user as any).id,
        action: "DELETE",
        entityType: "Event",
        entityId: event.id,
        entityName: event.title,
        ipAddress: getClientIp(request),
        userAgent: getUserAgent(request),
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting event:", error);
    return NextResponse.json(
      { error: "Failed to delete event" },
      { status: 500 }
    );
  }
}



