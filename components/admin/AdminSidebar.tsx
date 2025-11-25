"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { canAccessPage, Permission } from "@/lib/permissions";
import { Menu, X } from "lucide-react";

const menuItems = [
  { href: "/admin", label: "Dashboard", icon: "📊", permission: Permission.VIEW_DASHBOARD },
  { href: "/admin/analytics", label: "Analytics", icon: "📈", permission: Permission.VIEW_DASHBOARD },
  { href: "/admin/sliders", label: "Slider'lar", icon: "🖼️", permission: Permission.MANAGE_SLIDERS },
  { href: "/admin/partners", label: "İş Ortakları", icon: "🤝", permission: Permission.MANAGE_PARTNERS },
  { href: "/admin/stats", label: "İstatistikler", icon: "📊", permission: Permission.MANAGE_STATS },
  { href: "/admin/categories", label: "Kategoriler", icon: "📁", permission: Permission.MANAGE_CATEGORIES },
  { href: "/admin/events", label: "Etkinlikler", icon: "🎉", permission: Permission.MANAGE_EVENTS },
  { href: "/admin/form-fields", label: "Form Alanları", icon: "📝", permission: Permission.MANAGE_FORM_FIELDS },
  { href: "/admin/applications", label: "Etkinlik Başvuruları", icon: "📋", permission: Permission.MANAGE_APPLICATIONS },
  { href: "/admin/member-applications", label: "Üye Başvuruları", icon: "👤", permission: Permission.MANAGE_MEMBER_APPLICATIONS },
  { href: "/admin/organ-categories", label: "Organ Kategorileri", icon: "🏛️", permission: Permission.MANAGE_ORGAN_CATEGORIES },
  { href: "/admin/organ-members", label: "Organ Üyeleri", icon: "👥", permission: Permission.MANAGE_ORGAN_MEMBERS },
  { href: "/admin/announcements", label: "Duyurular", icon: "📢", permission: Permission.MANAGE_ANNOUNCEMENTS },
  { href: "/admin/settings", label: "Ayarlar", icon: "⚙️", permission: Permission.MANAGE_SETTINGS },
  { href: "/admin/users", label: "Kullanıcılar", icon: "👥", permission: Permission.MANAGE_USERS },
  { href: "/admin/logs", label: "Loglar", icon: "📜", permission: Permission.MANAGE_USERS, requireAdmin: true },
];

const roleLabels: Record<string, string> = {
  SUPER_ADMIN: "Süper Admin",
  ADMIN: "Admin",
  EDITOR: "Editör",
  MODERATOR: "Moderatör",
  VIEWER: "Görüntüleyici",
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
    // Check if item requires admin (only SUPER_ADMIN and ADMIN)
    if ((item as any).requireAdmin) {
      if (userRole !== "SUPER_ADMIN" && userRole !== "ADMIN") {
        return false;
      }
    }
    return canAccessPage(userRole, item.href);
  });

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-neutral-900 text-white rounded-md shadow-lg"
        aria-label="Menüyü aç/kapat"
      >
        {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
      </button>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <aside
        className={`fixed md:static inset-y-0 left-0 z-40 w-64 bg-neutral-900 min-h-screen text-white flex flex-col transform transition-transform duration-300 ease-in-out overflow-y-auto ${
          mobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
      <div className="p-4 border-b border-neutral-800 flex-shrink-0">
        <h2 className="text-xl font-bold text-primary-400">GGOG Admin</h2>
        {session?.user && (
          <div className="mt-2 text-xs text-neutral-400">
            <div className="font-medium">{session.user.name || session.user.email}</div>
            <div className="text-neutral-500">{roleLabels[userRole] || userRole}</div>
          </div>
        )}
      </div>
      
      <nav className="mt-8 flex-1 overflow-y-auto">
        {visibleMenuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center px-4 py-3 hover:bg-neutral-800 transition-colors ${
                isActive ? "bg-neutral-800 border-r-4 border-primary-500 text-primary-400" : "text-neutral-300"
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-neutral-800 space-y-2 flex-shrink-0">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center w-full px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition-colors"
          onClick={() => setMobileMenuOpen(false)}
        >
          <span className="mr-2">🌐</span>
          <span>Siteye Git</span>
        </a>
        <button
          onClick={handleLogout}
          className="flex items-center justify-center w-full px-4 py-2 text-sm text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
        >
          <span className="mr-2">🚪</span>
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
    </>
  );
}
