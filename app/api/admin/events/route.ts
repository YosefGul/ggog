import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent } from "@/lib/admin-logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_EVENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      include: {
        category: true,
        images: {
          orderBy: { order: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(events);
  } catch (error) {
    console.error("Error fetching events:", error);
    return NextResponse.json(
      { error: "Failed to fetch events" },
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
    if (!hasPermission(userRole, Permission.MANAGE_EVENTS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

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

    const event = await prisma.event.create({
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
        acceptsApplications: acceptsApplications || false,
        isPastEvent: isPastEvent || false,
        driveLink: driveLink || null,
        details: details || null,
        showOnHomepage: showOnHomepage || false,
        order: order || 0,
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

    // Log admin action
    await logAdminAction({
      userId: (user as any).id,
      action: "CREATE",
      entityType: "Event",
      entityId: event.id,
      entityName: event.title,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    return NextResponse.json(
      { error: "Failed to create event" },
      { status: 500 }
    );
  }
}



