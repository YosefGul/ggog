import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";
import { UnauthorizedError, ForbiddenError } from "@/lib/error-handler";

/**
 * Check if user has permission to access an API route
 * Returns null if authorized, otherwise throws error
 */
export async function checkPermission(
  permission: Permission
): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  if (!hasPermission(user.role, permission)) {
    throw new ForbiddenError();
  }
}

