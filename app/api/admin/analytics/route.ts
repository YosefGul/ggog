import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    // Only admin users can view analytics
    if (!hasPermission(userRole, Permission.VIEW_DASHBOARD)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get("startDate");
    const endDate = searchParams.get("endDate");
    const groupBy = searchParams.get("groupBy") || "day"; // day, week, month

    const start = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days
    const end = endDate ? new Date(endDate) : new Date();

    const where = {
      createdAt: {
        gte: start,
        lte: end,
      },
    };

    // Get total page views
    const totalPageViews = await prisma.analyticsEvent.count({
      where: {
        ...where,
        eventType: "PAGE_VIEW",
      },
    });

    // Get unique visitors (by session)
    const uniqueVisitors = await prisma.analyticsSession.count({
      where: {
        startedAt: {
          gte: start,
          lte: end,
        },
      },
    });

    // Get page views by page
    const pageViewsByPage = await prisma.analyticsEvent.groupBy({
      by: ["page"],
      where: {
        ...where,
        eventType: "PAGE_VIEW",
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get device type distribution
    const deviceDistribution = await prisma.analyticsEvent.groupBy({
      by: ["deviceType"],
      where: {
        ...where,
        eventType: "PAGE_VIEW",
        deviceType: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Get browser distribution
    const browserDistribution = await prisma.analyticsEvent.groupBy({
      by: ["browser"],
      where: {
        ...where,
        eventType: "PAGE_VIEW",
        browser: { not: null },
      },
      _count: {
        id: true,
      },
    });

    // Get referrer sources
    const referrerSources = await prisma.analyticsEvent.groupBy({
      by: ["referrer"],
      where: {
        ...where,
        eventType: "PAGE_VIEW",
        referrer: { not: null },
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: "desc",
        },
      },
      take: 10,
    });

    // Get time series data (page views over time)
    // Use Prisma's groupBy instead of raw SQL for better compatibility
    const allEvents = await prisma.analyticsEvent.findMany({
      where: {
        ...where,
        eventType: "PAGE_VIEW",
      },
      select: {
        createdAt: true,
      },
    });

    // Group by date manually
    const timeSeriesMap = new Map<string, number>();
    allEvents.forEach((event) => {
      const date = new Date(event.createdAt);
      let dateKey: string;
      
      if (groupBy === "day") {
        dateKey = date.toISOString().split("T")[0];
      } else if (groupBy === "week") {
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        dateKey = weekStart.toISOString().split("T")[0];
      } else if (groupBy === "month") {
        dateKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
      } else {
        dateKey = date.toISOString().split("T")[0];
      }
      
      timeSeriesMap.set(dateKey, (timeSeriesMap.get(dateKey) || 0) + 1);
    });

    const timeSeries = Array.from(timeSeriesMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // Get average session duration
    const avgSessionDuration = await prisma.analyticsSession.aggregate({
      where: {
        startedAt: {
          gte: start,
          lte: end,
        },
        duration: { gt: 0 },
      },
      _avg: {
        duration: true,
      },
    });

    // Get form submissions
    const formSubmissions = await prisma.analyticsEvent.count({
      where: {
        ...where,
        eventType: "FORM_SUBMIT",
      },
    });

    // Get clicks count
    const clicksCount = await prisma.analyticsEvent.count({
      where: {
        ...where,
        eventType: "CLICK",
      },
    });

    return NextResponse.json({
      summary: {
        totalPageViews,
        uniqueVisitors,
        formSubmissions,
        clicksCount,
        avgSessionDuration: Math.floor(avgSessionDuration._avg.duration || 0),
      },
      pageViewsByPage: pageViewsByPage.map((item) => ({
        page: item.page,
        count: item._count.id,
      })),
      deviceDistribution: deviceDistribution.map((item) => ({
        deviceType: item.deviceType,
        count: item._count.id,
      })),
      browserDistribution: browserDistribution.map((item) => ({
        browser: item.browser,
        count: item._count.id,
      })),
      referrerSources: referrerSources.map((item) => ({
        referrer: item.referrer,
        count: item._count.id,
      })),
      timeSeries,
    });
  } catch (error) {
    console.error("Error fetching analytics:", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics" },
      { status: 500 }
    );
  }
}

