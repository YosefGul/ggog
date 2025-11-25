import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";
import { canAccessPage } from "@/lib/permissions";

export default withAuth(
  function middleware(req) {
    // /admin/login için redirect yap
    if (req.nextUrl.pathname === "/admin/login") {
      return NextResponse.redirect(new URL("/login-admin", req.url));
    }
    
    // Role-based access control
    const token = req.nextauth.token;
    if (token && token.role) {
      const userRole = token.role as string;
      const pathname = req.nextUrl.pathname;
      
      // Check if user has permission to access this page
      if (!canAccessPage(userRole, pathname)) {
        // Redirect to 403 page or dashboard
        return NextResponse.redirect(new URL("/admin/forbidden", req.url));
      }
    }
    
    // Pathname'i header'a ekle
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("x-pathname", req.nextUrl.pathname);
    
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  },
  {
    pages: {
      signIn: "/login-admin",
    },
    callbacks: {
      authorized: ({ token, req }) => {
        // /admin/login için herkes erişebilir (redirect yapılacak)
        if (req.nextUrl.pathname === "/admin/login") {
          return true;
        }
        // Diğer admin sayfaları için token gerekli
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ["/admin/:path*"],
};
