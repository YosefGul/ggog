import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { Permission, hasPermission } from "@/lib/permissions";

export async function GET() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userRole = (user as any).role || "VIEWER";
    if (!hasPermission(userRole, Permission.VIEW_DASHBOARD)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Temel sayılar
    const [
      sliderCount,
      eventCount,
      announcementCount,
      partnerCount,
      categoryCount,
      organCategoryCount,
      organMemberCount,
      userCount,
      newsletterCount,
      contactSubmissionCount,
      pendingEventApps,
      pendingMemberApps,
      approvedEventApps,
      rejectedEventApps,
      activeEvents,
      pastEvents,
    ] = await Promise.all([
      prisma.slider.count(),
      prisma.event.count(),
      prisma.announcement.count(),
      prisma.partner.count(),
      prisma.eventCategory.count(),
      prisma.organCategory.count(),
      prisma.organMember.count(),
      prisma.user.count(),
      prisma.newsletterSubscription.count({ where: { isActive: true } }),
      prisma.contactFormSubmission.count(),
      prisma.eventApplication.count({ where: { status: "pending" } }),
      prisma.memberApplication.count({ where: { status: "pending" } }),
      prisma.eventApplication.count({ where: { status: "approved" } }),
      prisma.eventApplication.count({ where: { status: "rejected" } }),
      prisma.event.count({ where: { isPastEvent: false } }),
      prisma.event.count({ where: { isPastEvent: true } }),
    ]);

    // Son 7 gün için tarih hesaplama
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    // Trend verileri (son 7 gün)
    const [
      recentEvents,
      recentAnnouncements,
      recentEventApps,
      recentMemberApps,
    ] = await Promise.all([
      prisma.event.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.announcement.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.eventApplication.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
      prisma.memberApplication.count({
        where: { createdAt: { gte: sevenDaysAgo } },
      }),
    ]);

    // Son aktiviteler
    const [recentEventsList, recentAnnouncementsList, recentEventAppsList, recentMemberAppsList] = await Promise.all([
      prisma.event.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          isPastEvent: true,
        },
      }),
      prisma.announcement.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          title: true,
          createdAt: true,
          isActive: true,
        },
      }),
      prisma.eventApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          status: true,
          createdAt: true,
          event: {
            select: {
              title: true,
            },
          },
        },
      }),
      prisma.memberApplication.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          firstName: true,
          lastName: true,
          status: true,
          createdAt: true,
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        sliders: sliderCount,
        events: eventCount,
        announcements: announcementCount,
        partners: partnerCount,
        categories: categoryCount,
        organCategories: organCategoryCount,
        organMembers: organMemberCount,
        users: userCount,
        newsletterSubscriptions: newsletterCount,
        contactSubmissions: contactSubmissionCount,
        pendingEventApplications: pendingEventApps,
        pendingMemberApplications: pendingMemberApps,
        approvedEventApplications: approvedEventApps,
        rejectedEventApplications: rejectedEventApps,
        activeEvents: activeEvents,
        pastEvents: pastEvents,
      },
      trends: {
        recentEvents,
        recentAnnouncements,
        recentEventApps,
        recentMemberApps,
      },
      recentActivities: {
        events: recentEventsList,
        announcements: recentAnnouncementsList,
        eventApplications: recentEventAppsList,
        memberApplications: recentMemberAppsList,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    );
  }
}

