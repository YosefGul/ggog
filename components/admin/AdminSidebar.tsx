"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { canAccessPage, Permission } from "@/lib/permissions";
import {
  Menu,
  X,
  LayoutDashboard,
  BarChart3,
  Image as ImageIcon,
  Handshake,
  TrendingUp,
  FolderTree,
  Calendar,
  FileText,
  ClipboardList,
  User,
  Building2,
  Users,
  Megaphone,
  Settings,
  UserCog,
  FileText as LogsIcon,
  Globe,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  permission: Permission;
  requireAdmin?: boolean;
  group?: string;
}

const menuItems: MenuItem[] = [
  // Ana Bölüm
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard, permission: Permission.VIEW_DASHBOARD, group: "Ana" },
  { href: "/admin/analytics", label: "Analytics", icon: BarChart3, permission: Permission.VIEW_DASHBOARD, group: "Ana" },
  
  // İçerik Yönetimi
  { href: "/admin/sliders", label: "Slider'lar", icon: ImageIcon, permission: Permission.MANAGE_SLIDERS, group: "İçerik" },
  { href: "/admin/announcements", label: "Duyurular", icon: Megaphone, permission: Permission.MANAGE_ANNOUNCEMENTS, group: "İçerik" },
  { href: "/admin/events", label: "Etkinlikler", icon: Calendar, permission: Permission.MANAGE_EVENTS, group: "İçerik" },
  { href: "/admin/categories", label: "Kategoriler", icon: FolderTree, permission: Permission.MANAGE_CATEGORIES, group: "İçerik" },
  { href: "/admin/partners", label: "İş Ortakları", icon: Handshake, permission: Permission.MANAGE_PARTNERS, group: "İçerik" },
  { href: "/admin/stats", label: "İstatistikler", icon: TrendingUp, permission: Permission.MANAGE_STATS, group: "İçerik" },
  
  // Başvurular
  { href: "/admin/applications", label: "Etkinlik Başvuruları", icon: ClipboardList, permission: Permission.MANAGE_APPLICATIONS, group: "Başvurular" },
  { href: "/admin/member-applications", label: "Üye Başvuruları", icon: User, permission: Permission.MANAGE_MEMBER_APPLICATIONS, group: "Başvurular" },
  
  // Organlar
  { href: "/admin/organ-categories", label: "Organ Kategorileri", icon: Building2, permission: Permission.MANAGE_ORGAN_CATEGORIES, group: "Organlar" },
  { href: "/admin/organ-members", label: "Organ Üyeleri", icon: Users, permission: Permission.MANAGE_ORGAN_MEMBERS, group: "Organlar" },
  
  // Formlar
  { href: "/admin/form-fields", label: "Form Alanları", icon: FileText, permission: Permission.MANAGE_FORM_FIELDS, group: "Formlar" },
  { href: "/admin/member-form-fields", label: "Üye Form Alanları", icon: FileText, permission: Permission.MANAGE_FORM_FIELDS, group: "Formlar" },
  
  // Sistem
  { href: "/admin/newsletter", label: "Newsletter", icon: Megaphone, permission: Permission.MANAGE_NEWSLETTER, group: "Sistem" },
  { href: "/admin/users", label: "Kullanıcılar", icon: UserCog, permission: Permission.MANAGE_USERS, group: "Sistem" },
  { href: "/admin/logs", label: "Loglar", icon: LogsIcon, permission: Permission.MANAGE_USERS, requireAdmin: true, group: "Sistem" },
  { href: "/admin/settings", label: "Ayarlar", icon: Settings, permission: Permission.MANAGE_SETTINGS, group: "Sistem" },
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN: "Admin",
  EDITOR: "Editör",
  MODERATOR: "Moderatör",
  VIEWER: "Görüntüleyici",
};

const roleColors: Record<string, string> = {
  SUPER_ADMIN: "text-purple-400",
  ADMIN: "text-blue-400",
  EDITOR: "text-green-400",
  MODERATOR: "text-yellow-400",
  VIEWER: "text-gray-400",
};

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const userRole = (session?.user as any)?.role || "VIEWER";
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push("/login-admin");
    router.refresh();
  };

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [mobileMenuOpen]);

  // Filter menu items based on permissions
  const visibleMenuItems = menuItems.filter((item) => {
    if ((item as any).requireAdmin) {
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        return false;
      }
    }
    return canAccessPage(userRole, item.href);
  });

  // Group menu items
  const groupedItems = visibleMenuItems.reduce((acc, item) => {
    const group = item.group || "Diğer";
    if (!acc[group]) {
      acc[group] = [];
    }
    acc[group].push(item);
    return acc;
  }, {} as Record<string, MenuItem[]>);

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
        aria-label="Menüyü aç/kapat"
      >
        {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed md:static inset-y-0 left-0 z-40 w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 min-h-screen text-white flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto shadow-2xl",
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        )}
      >
        {/* Header */}
        <div className="p-6 border-b border-slate-700/50 flex-shrink-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center shadow-lg">
              <LayoutDashboard className="h-5 w-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">GGOG Admin</h2>
              <p className="text-xs text-slate-400">Yönetim Paneli</p>
            </div>
          </div>
          {session?.user && (
            <div className="mt-4 p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
              <div className="flex items-center gap-2 mb-1">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-xs font-semibold">
                  {(session.user.name || session.user.email || "U")[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-white truncate">
                    {session.user.name || session.user.email}
                  </div>
                  <div className={cn("text-xs font-medium", roleColors[userRole] || "text-gray-400")}>
                    {roleLabels[userRole] || userRole}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-4 flex-1 overflow-y-auto px-3 pb-4">
          {Object.entries(groupedItems).map(([groupName, items]) => (
            <div key={groupName} className="mb-6">
              <div className="px-3 mb-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  {groupName}
                </h3>
              </div>
              <div className="space-y-1">
                {items.map((item) => {
                  const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                        isActive
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg shadow-blue-500/25"
                          : "text-slate-300 hover:bg-slate-800/50 hover:text-white"
                      )}
                    >
                      <Icon
                        className={cn(
                          "h-5 w-5 flex-shrink-0 transition-transform duration-200",
                          isActive ? "text-white" : "text-slate-400 group-hover:text-white"
                        )}
                      />
                      <span className="flex-1 text-sm font-medium">{item.label}</span>
                      {isActive && (
                        <ChevronRight className="h-4 w-4 text-white opacity-50" />
                      )}
                      {isActive && (
                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-700/50 space-y-2 flex-shrink-0 bg-slate-900/50">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 w-full px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 shadow-lg hover:shadow-xl group"
            onClick={() => setMobileMenuOpen(false)}
          >
            <Globe className="h-4 w-4 group-hover:rotate-12 transition-transform duration-200" />
            <span className="text-sm font-medium">Siteye Git</span>
          </a>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-white bg-gradient-to-r from-red-600 to-red-700 rounded-lg hover:from-red-700 hover:to-red-800 transition-all duration-200 shadow-lg hover:shadow-xl group"
          >
            <LogOut className="h-4 w-4 group-hover:translate-x-1 transition-transform duration-200" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>
    </>
  );
}
