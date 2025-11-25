"use client";

import { useEffect, useState, useRef } from "react";
import { usePathname } from "next/navigation";

interface PageTransitionProps {
  children: React.ReactNode;
}

// Global navigation history (component dışında tutuluyor ki her render'da kaybolmasın)
const navigationHistory: string[] = [];
let navigationDirection: "forward" | "back" = "forward";

export default function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname();
  const [oldChildren, setOldChildren] = useState<React.ReactNode>(null);
  const [newChildren, setNewChildren] = useState<React.ReactNode>(children);
  const [transitionDirection, setTransitionDirection] = useState<"forward" | "back">("forward");
  const [isTransitioning, setIsTransitioning] = useState(false);
  const previousPathnameRef = useRef<string>(pathname);
  const isFirstRender = useRef(true);

  useEffect(() => {
    // Browser back/forward button detection
    const handlePopState = () => {
      navigationDirection = "back";
    };

    window.addEventListener("popstate", handlePopState);

    // İlk render'da animasyon yapma
    if (isFirstRender.current) {
      isFirstRender.current = false;
      previousPathnameRef.current = pathname;
      if (!navigationHistory.includes(pathname)) {
        navigationHistory.push(pathname);
      }
      return () => window.removeEventListener("popstate", handlePopState);
    }

    // Sadece pathname değiştiğinde animasyon yap
    if (pathname !== previousPathnameRef.current) {
      const currentIndex = navigationHistory.indexOf(pathname);
      const previousIndex = navigationHistory.indexOf(previousPathnameRef.current);

      // Yön belirleme
      let direction: "forward" | "back" = "forward";
      
      if (navigationDirection === "back") {
        direction = "back";
        navigationDirection = "forward"; // Reset
      } else if (currentIndex !== -1 && previousIndex !== -1 && currentIndex < previousIndex) {
        direction = "back";
      } else {
        direction = "forward";
      }

      setTransitionDirection(direction);

      // History'ye ekle (sadece forward navigation için)
      if (direction === "forward" && !navigationHistory.includes(pathname)) {
        navigationHistory.push(pathname);
      }

      // Eski içeriği sakla ve yeni içeriği ayarla
      setOldChildren(newChildren);
      setNewChildren(children);
      setIsTransitioning(true);

      // Animasyon tamamlanınca eski içeriği kaldır
      const timer = setTimeout(() => {
        setOldChildren(null);
        setIsTransitioning(false);
        previousPathnameRef.current = pathname;
      }, 300);

      return () => {
        clearTimeout(timer);
        window.removeEventListener("popstate", handlePopState);
      };
    }

    // Pathname aynıysa sadece içeriği güncelle (animasyon yok)
    if (pathname === previousPathnameRef.current && !isTransitioning) {
      setNewChildren(children);
    }

    return () => window.removeEventListener("popstate", handlePopState);
  }, [pathname, children, newChildren, isTransitioning]);

  return (
    <div className="relative w-full overflow-hidden">
      {/* Eski içerik - kaydırılıyor (absolute, üstte) */}
      {oldChildren && (
        <div
          className={`absolute inset-0 w-full transition-all duration-300 ease-in-out z-10 ${
            transitionDirection === "forward"
              ? "-translate-x-full opacity-0"
              : "translate-x-full opacity-0"
          }`}
        >
          {oldChildren}
        </div>
      )}
      
      {/* Yeni içerik - geliyor */}
      <div
        className={`w-full transition-all duration-300 ease-in-out ${
          isTransitioning
            ? transitionDirection === "forward"
              ? "translate-x-full opacity-0"
              : "-translate-x-full opacity-0"
            : "translate-x-0 opacity-100"
        }`}
      >
        {newChildren}
      </div>
    </div>
  );
}
