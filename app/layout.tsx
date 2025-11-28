import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BottomNavigation from "@/components/BottomNavigation";
import Analytics from "@/components/Analytics";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { Toaster } from "@/components/ui/toaster";
import { headers } from "next/headers";
// Validate environment variables at startup
import "@/lib/env";
import { generateMetadata as generateSEOMetadata } from "@/lib/seo";

const inter = Inter({ subsets: ["latin"], display: "swap" });

export const metadata: Metadata = generateSEOMetadata({
  title: "GGOG - Genç Girişimciler ve Oyun Geliştiricileri Derneği",
  description: "Genç Girişimciler ve Oyun Geliştiricileri Derneği - Oyun geliştirme ve girişimcilik alanında faaliyet gösteren dernek. Etkinlikler, duyurular ve üyelik başvuruları.",
  url: "/",
});

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
    <html lang="tr" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body>
        <ErrorBoundary>
          {!isAdminRoute && <Header />}
          <main className={isAdminRoute ? "" : "pb-16 md:pb-0"}>{children}</main>
          {!isAdminRoute && <Footer />}
          {!isAdminRoute && <BottomNavigation />}
          {!isAdminRoute && <Analytics />}
          <Toaster />
        </ErrorBoundary>
      </body>
    </html>
  );
}
