import { withAuth } from "next-auth/middleware";
import { NextResponse } from "next/server";

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const isAuth = !!token;
    const userRole = (token?.role as string) || 'user';
    
    const isAuthPage = req.nextUrl.pathname.startsWith("/login") || 
                       req.nextUrl.pathname.startsWith("/register");
    const isAdminPage = req.nextUrl.pathname.startsWith("/admin");
    const isAdminLoginPage = req.nextUrl.pathname === "/admin/login";

    // Admin route protection
    if (isAdminPage && !isAdminLoginPage) {
      if (!isAuth) {
        // Not authenticated - redirect to admin login
        return NextResponse.redirect(
          new URL("/admin/login", req.url)
        );
      }
      if (userRole !== 'admin') {
        // Authenticated but not admin - redirect to admin login 
        // with error
        const adminLoginUrl = new URL("/admin/login", req.url);
        adminLoginUrl.searchParams.set("error", "unauthorized");
        return NextResponse.redirect(adminLoginUrl);
      }
      // Admin authenticated - allow access
      return NextResponse.next();
    }

    // Admin login page - redirect admins to dashboard
    if (isAdminLoginPage && isAuth && userRole === 'admin') {
      return NextResponse.redirect(
        new URL("/admin", req.url)
      );
    }

    // Allow unauthenticated users to view the admin login page
    if (isAdminLoginPage) {
      return NextResponse.next();
    }

    // If user is authenticated and trying to access auth pages
    // redirect to dashboard
    if (isAuthPage && isAuth) {
      return NextResponse.redirect(
        new URL("/dashboard", req.url)
      );
    }

    // If user is not authenticated and trying to access 
    // protected pages, redirect to login
    if (!isAuthPage && !isAuth) {
      const loginUrl = new URL("/login", req.url);
      loginUrl.searchParams.set("callbackUrl", 
        req.nextUrl.pathname + req.nextUrl.search
      );
      return NextResponse.redirect(loginUrl);
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: () => {
        // Return true to allow middleware function to run
        // We handle authorization logic in the middleware itself
        return true;
      },
    },
  }
);

// Protect these routes with authentication
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/tools/:path*",
    "/profile/:path*",
    "/credits/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
};
