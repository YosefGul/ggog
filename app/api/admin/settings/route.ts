import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent, getChanges } from "@/lib/admin-logger";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.MANAGE_SETTINGS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const settings = await prisma.settings.findMany();

    return NextResponse.json(settings);
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json(
      { error: "Failed to fetch settings" },
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
    if (!hasPermission(userRole, Permission.MANAGE_SETTINGS)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { key, value, type } = body;

    // Get old setting for comparison
    const oldSetting = await prisma.settings.findUnique({
      where: { key },
    });

    const setting = await prisma.settings.upsert({
      where: { key },
      update: {
        value: JSON.parse(JSON.stringify(value)),
        type,
      },
      create: {
        key,
        value: JSON.parse(JSON.stringify(value)),
        type,
      },
    });

    // Log admin action
    const action = oldSetting ? "UPDATE" : "CREATE";
    const changes = oldSetting ? getChanges(oldSetting, setting) : undefined;
    await logAdminAction({
      userId: (user as any).id,
      action: oldSetting ? "SETTINGS_CHANGE" : "CREATE",
      entityType: "Settings",
      entityId: setting.id,
      entityName: key,
      changes,
      ipAddress: getClientIp(request),
      userAgent: getUserAgent(request),
    });

    return NextResponse.json(setting);
  } catch (error) {
    console.error("Error saving setting:", error);
    return NextResponse.json(
      { error: "Failed to save setting" },
      { status: 500 }
    );
  }
}



