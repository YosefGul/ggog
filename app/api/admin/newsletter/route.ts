import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { handleError } from "@/lib/error-handler";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");
    const skip = (page - 1) * limit;
    const isActive = searchParams.get("isActive");

    const where: any = {};
    if (isActive !== null && isActive !== undefined) {
      where.isActive = isActive === "true";
    }

    const [subscriptions, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where,
        orderBy: { subscribedAt: "desc" },
        skip,
        take: limit,
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    return NextResponse.json({
      subscriptions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return handleError(error);
  }
}


