import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const publicRoutes = ["/", "/login", "/register", "/unsubscribe"];
  const adminOnlyRoutes = ["/dashboard/codes", "/dashboard/account"];

  // ✅ Allow public routes to be accessed without authentication
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // ✅ Get authentication token (user session)
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // ✅ Prevent infinite redirects
  const isLoginPage = request.nextUrl.pathname === "/login";
  if (!token && !isLoginPage) {
    console.log("🔄 Redirecting to login - No valid session found.");
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ✅ Prevent redirecting logged-in users back to login page
  if (token && isLoginPage) {
    console.log("✅ User is already authenticated, redirecting to dashboard.");
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  // ✅ Restrict admin-only routes
  if (adminOnlyRoutes.includes(request.nextUrl.pathname)) {
    if (!token?.role || token.role !== "admin") {
      console.log("❌ Unauthorized access attempt to admin route.");
      return NextResponse.redirect(new URL("/", request.url)); // Redirect unauthorized users
    }
  }

  // ✅ Allow access if all checks pass
  return NextResponse.next();
}

// ✅ Prevent Next.js from applying middleware to static files and API routes
export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
