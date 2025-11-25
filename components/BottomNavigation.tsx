"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, Calendar, Bell, Building2, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    href: "/biz-kimiz",
    label: "Biz Kimiz?",
    icon: Users,
  },
  {
    href: "/etkinlikler",
    label: "Etkinlikler",
    icon: Calendar,
  },
  {
    href: "/duyurular",
    label: "Duyurular",
    icon: Bell,
  },
  {
    href: "/organlarimiz",
    label: "Organlar",
    icon: Building2,
  },
  {
    href: "/iletisim",
    label: "İletişim",
    icon: Mail,
  },
];

export default function BottomNavigation() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 shadow-[0_-2px_10px_rgba(0,0,0,0.1)]">
      <div className="max-w-screen-xl mx-auto px-2">
        <div className="flex items-center justify-around h-16">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href || 
              (item.href !== "/" && pathname.startsWith(item.href));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center flex-1 h-full transition-all duration-200 relative group",
                  isActive
                    ? "text-primary-600"
                    : "text-gray-500 hover:text-primary-500"
                )}
              >
                {/* Active indicator */}
                {isActive && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-12 h-1 bg-primary-600 rounded-b-full" />
                )}
                
                {/* Icon */}
                <div
                  className={cn(
                    "relative transition-all duration-200",
                    isActive ? "scale-110" : "scale-100 group-active:scale-95"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-200",
                      isActive && "text-primary-600"
                    )}
                    strokeWidth={isActive ? 2.5 : 2}
                  />
                  {isActive && (
                    <div className="absolute inset-0 bg-primary-100 rounded-full blur-md opacity-50 -z-10" />
                  )}
                </div>

                {/* Label */}
                <span
                  className={cn(
                    "text-[10px] font-medium mt-1 transition-all duration-200",
                    isActive ? "text-primary-600 font-semibold" : "text-gray-500"
                  )}
                >
                  {item.label}
                </span>

              </Link>
            );
          })}
        </div>
      </div>
      
      {/* Safe area for iOS */}
      <div className="h-safe-area-inset-bottom bg-white" />
    </nav>
  );
}

