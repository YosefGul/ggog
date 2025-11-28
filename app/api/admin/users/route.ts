import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { checkPermission } from "@/lib/api-helpers";
import { Permission } from "@/lib/permissions";
import { logAdminAction, getClientIp, getUserAgent } from "@/lib/admin-logger";
import { createUserSchema, validateRequestBody } from "@/lib/validation";
import { hashPassword } from "@/lib/password";
import { withErrorHandling, ValidationError, UnauthorizedError } from "@/lib/error-handler";
import { getCurrentUser } from "@/lib/auth";
import { rateLimit } from "@/lib/rate-limit";

const createUserRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 user creations per minute
});

export const GET = withErrorHandling(async (request: NextRequest) => {
  await checkPermission(Permission.MANAGE_USERS);

  const users = await prisma.user.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = await createUserRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  await checkPermission(Permission.MANAGE_USERS);

  const user = await getCurrentUser();
  if (!user) {
    throw new UnauthorizedError();
  }

  const body = await validateRequestBody(request, createUserSchema);

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: body.email },
  });

  if (existingUser) {
    throw new ValidationError("User already exists");
  }

  // Hash password
  const hashedPassword = await hashPassword(body.password);

  const newUser = await prisma.user.create({
    data: {
      email: body.email,
      password: hashedPassword,
      name: body.name || null,
      role: body.role || "VIEWER",
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  // Log admin action
  await logAdminAction({
    userId: user.id,
    action: "CREATE",
    entityType: "User",
    entityId: newUser.id,
    entityName: newUser.email,
    ipAddress: getClientIp(request),
    userAgent: getUserAgent(request),
    metadata: { role: newUser.role },
  });

  return NextResponse.json(newUser, { status: 201 });
});

