import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function getDashboardStats() {
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

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const [recentEvents, recentAnnouncements, recentEventApps, recentMemberApps] = await Promise.all([
    prisma.event.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.announcement.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.eventApplication.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
    prisma.memberApplication.count({ where: { createdAt: { gte: sevenDaysAgo } } }),
  ]);

  const [recentEventsList, recentAnnouncementsList, recentEventAppsList, recentMemberAppsList] = await Promise.all([
    prisma.event.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, title: true, createdAt: true, isPastEvent: true } }),
    prisma.announcement.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, title: true, createdAt: true, isActive: true } }),
    prisma.eventApplication.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, status: true, createdAt: true, event: { select: { title: true } } } }),
    prisma.memberApplication.findMany({ take: 5, orderBy: { createdAt: "desc" }, select: { id: true, firstName: true, lastName: true, status: true, createdAt: true } }),
  ]);

  return {
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
  };
}

function StatCard({
  title,
  value,
  icon,
  color = "primary",
  trend,
  href,
}: {
  title: string;
  value: number;
  icon: string;
  color?: "primary" | "success" | "warning" | "danger" | "info";
  trend?: number;
  href?: string;
}) {
  const colorClasses = {
    primary: "bg-primary-50 text-primary-600 border-primary-200",
    success: "bg-green-50 text-green-600 border-green-200",
    warning: "bg-yellow-50 text-yellow-600 border-yellow-200",
    danger: "bg-red-50 text-red-600 border-red-200",
    info: "bg-cyan-50 text-cyan-600 border-cyan-200",
  };

  const content = (
    <Card className="hover:shadow-lg transition-shadow cursor-pointer h-full">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className={`p-2 rounded-lg ${colorClasses[color]}`}>
            <span className="text-2xl">{icon}</span>
          </div>
          {trend !== undefined && (
            <div className="flex items-center gap-1 text-sm">
              {trend > 0 ? (
                <span className="text-green-600">↑</span>
              ) : trend < 0 ? (
                <span className="text-red-600">↓</span>
              ) : null}
              <span className={trend > 0 ? "text-green-600" : trend < 0 ? "text-red-600" : "text-gray-600"}>
                {trend > 0 ? `+${trend}` : trend}
              </span>
            </div>
          )}
        </div>
        <CardDescription className="mt-2">{title}</CardDescription>
        <CardTitle className="text-3xl mt-2">{value}</CardTitle>
      </CardHeader>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

export default async function AdminDashboard() {
  const dashboardData = await getDashboardStats();
  const { stats, trends, recentActivities } = dashboardData;

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm md:text-base">Hoş geldiniz! Sisteminizin genel durumunu buradan takip edebilirsiniz.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
          <Button asChild className="w-full sm:w-auto">
            <Link href="/admin/events/new">
              <span className="mr-2">📅</span>
              Yeni Etkinlik
            </Link>
          </Button>
          <Button asChild variant="outline" className="w-full sm:w-auto">
            <Link href="/admin/announcements/new">
              <span className="mr-2">📢</span>
              Yeni Duyuru
            </Link>
          </Button>
        </div>
      </div>

      {/* İstatistik Kartları */}
      <div>
        <h2 className="text-xl font-semibold mb-4">Genel İstatistikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Slider'lar"
            value={stats.sliders}
            icon="🖼️"
            color="primary"
            trend={trends.recentEvents}
            href="/admin/sliders"
          />
          <StatCard
            title="Etkinlikler"
            value={stats.events}
            icon="📅"
            color="success"
            trend={trends.recentEvents}
            href="/admin/events"
          />
          <StatCard
            title="Duyurular"
            value={stats.announcements}
            icon="📢"
            color="info"
            trend={trends.recentAnnouncements}
            href="/admin/announcements"
          />
          <StatCard
            title="İş Ortakları"
            value={stats.partners}
            icon="🤝"
            color="primary"
            href="/admin/partners"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Başvurular ve Üyeler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Bekleyen Etkinlik Başvuruları"
            value={stats.pendingEventApplications}
            icon="⏳"
            color="warning"
            trend={trends.recentEventApps}
            href="/admin/applications"
          />
          <StatCard
            title="Bekleyen Üye Başvuruları"
            value={stats.pendingMemberApplications}
            icon="👤"
            color="warning"
            trend={trends.recentMemberApps}
            href="/admin/member-applications"
          />
          <StatCard
            title="Onaylanan Başvurular"
            value={stats.approvedEventApplications}
            icon="✅"
            color="success"
            href="/admin/applications?status=approved"
          />
          <StatCard
            title="Reddedilen Başvurular"
            value={stats.rejectedEventApplications}
            icon="❌"
            color="danger"
            href="/admin/applications?status=rejected"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Organizasyon ve Kategoriler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Kategoriler"
            value={stats.categories}
            icon="📁"
            color="info"
            href="/admin/categories"
          />
          <StatCard
            title="Organ Kategorileri"
            value={stats.organCategories}
            icon="🏛️"
            color="primary"
            href="/admin/organ-categories"
          />
          <StatCard
            title="Organ Üyeleri"
            value={stats.organMembers}
            icon="👥"
            color="success"
            href="/admin/organ-members"
          />
          <StatCard
            title="Kullanıcılar"
            value={stats.users}
            icon="👤"
            color="info"
            href="/admin/users"
          />
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">İletişim ve Abonelikler</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <StatCard
            title="Newsletter Aboneleri"
            value={stats.newsletterSubscriptions}
            icon="📧"
            color="success"
          />
          <StatCard
            title="İletişim Formları"
            value={stats.contactSubmissions}
            icon="💬"
            color="info"
          />
          <StatCard
            title="Aktif Etkinlikler"
            value={stats.activeEvents}
            icon="📅"
            color="success"
            href="/admin/events"
          />
        </div>
      </div>

      {/* Son Aktiviteler */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Son Etkinlikler</CardTitle>
            <CardDescription>En son eklenen 5 etkinlik</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.events.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz etkinlik eklenmemiş</p>
              ) : (
                recentActivities.events.map((event) => (
                  <Link
                    key={event.id}
                    href={`/admin/events/${event.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(event.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge variant={event.isPastEvent ? "secondary" : "default"}>
                      {event.isPastEvent ? "Geçmiş" : "Aktif"}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/events">Tüm Etkinlikleri Gör</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Duyurular</CardTitle>
            <CardDescription>En son eklenen 5 duyuru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.announcements.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz duyuru eklenmemiş</p>
              ) : (
                recentActivities.announcements.map((announcement) => (
                  <Link
                    key={announcement.id}
                    href={`/admin/announcements/${announcement.id}`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{announcement.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(announcement.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge variant={announcement.isActive ? "default" : "secondary"}>
                      {announcement.isActive ? "Aktif" : "Pasif"}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/announcements">Tüm Duyuruları Gör</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Etkinlik Başvuruları</CardTitle>
            <CardDescription>En son gelen 5 başvuru</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.eventApplications.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz başvuru yok</p>
              ) : (
                recentActivities.eventApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/applications`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">{app.event.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "default"
                          : app.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {app.status === "approved"
                        ? "Onaylandı"
                        : app.status === "rejected"
                        ? "Reddedildi"
                        : "Bekliyor"}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/applications">Tüm Başvuruları Gör</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Son Üye Başvuruları</CardTitle>
            <CardDescription>En son gelen 5 üye başvurusu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentActivities.memberApplications.length === 0 ? (
                <p className="text-muted-foreground text-sm">Henüz üye başvurusu yok</p>
              ) : (
                recentActivities.memberApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/admin/member-applications`}
                    className="flex items-center justify-between p-3 rounded-lg hover:bg-muted transition-colors"
                  >
                    <div className="flex-1">
                      <p className="font-medium">
                        {app.firstName} {app.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(app.createdAt).toLocaleDateString("tr-TR")}
                      </p>
                    </div>
                    <Badge
                      variant={
                        app.status === "approved"
                          ? "default"
                          : app.status === "rejected"
                          ? "destructive"
                          : "secondary"
                      }
                    >
                      {app.status === "approved"
                        ? "Onaylandı"
                        : app.status === "rejected"
                        ? "Reddedildi"
                        : "Bekliyor"}
                    </Badge>
                  </Link>
                ))
              )}
            </div>
            <Button asChild variant="outline" className="w-full mt-4">
              <Link href="/admin/member-applications">Tüm Başvuruları Gör</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
