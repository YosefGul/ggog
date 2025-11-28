import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, isSuperAdmin } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent, getChanges } from "@/lib/admin-logger";
import { updateUserSchema, validateRequestBody, idSchema } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { withErrorHandling, NotFoundError, ForbiddenError, ValidationError, UnauthorizedError } from "@/lib/error-handler";
import { checkPermission } from "@/lib/api-helpers";

export const GET = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await checkPermission(Permission.MANAGE_USERS);

  const { id } = await params;
  const parsedId = idSchema.parse({ id });

  const targetUser = await prisma.user.findUnique({
    where: { id: parsedId.id },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  return NextResponse.json(targetUser);
});

export const PUT = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  await checkPermission(Permission.MANAGE_USERS);

  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }

  const { id } = await params;
  const parsedId = idSchema.parse({ id });
  const body = await validateRequestBody(request, updateUserSchema);

  const targetUser = await prisma.user.findUnique({
    where: { id: parsedId.id },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  // Only Super Admin can change roles to SUPER_ADMIN
  if (body.role === "SUPER_ADMIN" && !isSuperAdmin(user.role)) {
    throw new ForbiddenError("Only Super Admin can assign Super Admin role");
  }

  const updateData: {
    email?: string;
    name?: string | null;
    role?: "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "MODERATOR" | "VIEWER";
    password?: string;
  } = {};

  if (body.email !== undefined) updateData.email = body.email;
  if (body.name !== undefined) updateData.name = body.name || null;
  if (body.role !== undefined) {
    updateData.role = body.role as "SUPER_ADMIN" | "ADMIN" | "EDITOR" | "MODERATOR" | "VIEWER";
  }
  if (body.password !== undefined && body.password.trim() !== "") {
    updateData.password = await hashPassword(body.password);
  }

  const updatedUser = await prisma.user.update({
    where: { id: parsedId.id },
    data: updateData,
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log admin action with changes
  const changes = targetUser ? getChanges(targetUser, { ...targetUser, ...updateData }) : undefined;
  await logAdminAction({
    userId: user.id,
    action: "UPDATE",
    entityType: "User",
    entityId: updatedUser.id,
    entityName: updatedUser.email,
    changes,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json(updatedUser);
});

export const DELETE = withErrorHandling(async (
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) => {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not found");
  }

  // Only Super Admin can delete users
  if (!isSuperAdmin(user.role)) {
    throw new ForbiddenError("Only Super Admin can delete users");
  }

  const { id } = await params;
  const parsedId = idSchema.parse({ id });

  const targetUser = await prisma.user.findUnique({
    where: { id: parsedId.id },
  });

  if (!targetUser) {
    throw new NotFoundError("User not found");
  }

  // Prevent self-deletion
  if (targetUser.id === user.id) {
    throw new ValidationError("Cannot delete your own account");
  }

  await prisma.user.delete({
    where: { id: parsedId.id },
  });

  // Log admin action
  await logAdminAction({
    userId: user.id,
    action: "DELETE",
    entityType: "User",
    entityId: targetUser.id,
    entityName: targetUser.email,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
  });

  return NextResponse.json({ success: true });
});

