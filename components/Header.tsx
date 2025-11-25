"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useRef } from "react";

const navigationItems = [
  { href: "/", label: "Ana Sayfa" },
  { href: "/biz-kimiz", label: "Biz Kimiz?" },
  { href: "/etkinlikler", label: "Etkinliklerimiz" },
  { href: "/duyurular", label: "Duyurular" },
  { href: "/organlarimiz", label: "Organlarımız" },
  { href: "/iletisim", label: "İletişim" },
];

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const navigationHistoryRef = useRef<string[]>([]);

  const isActive = (href: string) => {
    if (href === "/") {
      // Ana sayfa için sadece tam eşleşme
      return pathname === "/";
    }
    // Diğer sayfalar için pathname'in href ile başlaması yeterli
    return pathname.startsWith(href);
  };

  const handleNavigation = (href: string, e: React.MouseEvent) => {
    // Normal navigation - onClick handler'a gerek yok, Link kendi hallediyor
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <div className="flex items-center">
            <Link 
              href="/" 
              className={cn(
                "text-2xl font-bold transition-all duration-200",
                pathname === "/" 
                  ? "text-primary-700 scale-110" 
                  : "text-primary hover:text-primary-700 hover:scale-105"
              )}
            >
              GGOG
            </Link>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navigationItems.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2 group",
                    active
                      ? "text-primary-700 bg-primary-50 border-2 border-primary-400 shadow-md scale-105 font-semibold"
                      : "text-gray-700 hover:text-primary-600 hover:bg-gray-50 hover:border-2 hover:border-transparent"
                  )}
                >
                  <span className="relative z-10">
                    {item.label}
                  </span>
                  {active && (
                    <>
                      <div className="absolute inset-0 bg-primary-100 rounded-lg opacity-50"></div>
                      <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-10 h-1 bg-primary-600 rounded-full"></div>
                    </>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* CTA Button */}
          <div className="flex items-center">
            <Button 
              asChild 
              size="default"
              className="shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105"
            >
              <Link href="/uye-basvuru">
                Üye Başvuru
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}

