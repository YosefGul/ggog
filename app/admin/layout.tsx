import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import AdminSidebar from "@/components/admin/AdminSidebar";
import { headers } from "next/headers";
import { canAccessPage } from "@/lib/permissions";
import SessionProviderWrapper from "@/components/admin/SessionProviderWrapper";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const headersList = await headers();
  const pathname = headersList.get("x-pathname") || "";
  
  // Login sayfası için layout uygulama (middleware redirect yapacak ama yine de kontrol edelim)
  if (pathname.includes("/admin/login")) {
    return <>{children}</>;
  }

  // Authentication kontrolü - hata durumunda güvenli şekilde handle et
  let user;
  try {
    user = await getCurrentUser();
  } catch (error) {
    // JWT decryption hatası durumunda login'e yönlendir
    redirect("/login-admin");
  }

  if (!user) {
    redirect("/login-admin");
  }

  // Permission kontrolü
  const userRole = (user as any).role || "VIEWER";
  if (!canAccessPage(userRole, pathname)) {
    redirect("/admin/forbidden");
  }

  return (
    <SessionProviderWrapper>
      <div className="min-h-screen bg-gray-50">
        <div className="flex">
          <AdminSidebar />
          <main className="flex-1 p-4 md:p-8 w-full overflow-x-hidden md:ml-0">{children}</main>
        </div>
      </div>
    </SessionProviderWrapper>
  );
}
