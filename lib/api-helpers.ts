import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";

/**
 * Check if user has permission to access an API route
 * Returns null if authorized, otherwise returns error response
 */
export async function checkPermission(
  permission: Permission
): Promise<NextResponse | null> {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userRole = (user as any).role || "VIEWER";
  if (!hasPermission(userRole, permission)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  return null;
}

