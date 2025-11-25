import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import Analytics from "@/components/Analytics";
import { headers } from "next/headers";

export const metadata: Metadata = {
  title: "GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği",
  description: "Genç Girişimciler ve Oyun Geliştiricileri Derneği",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Admin route'larında Header ve Footer gösterme
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/login-admin");

  return (
    <html lang="tr">
      <body>
        {!isAdminRoute && <Header />}
        <main className={isAdminRoute ? "" : "pb-16 md:pb-0"}>{children}</main>
        {!isAdminRoute && <Footer />}
        {!isAdminRoute && <BottomNavigation />}
        {!isAdminRoute && <Analytics />}
      </body>
    </html>
  );
}
