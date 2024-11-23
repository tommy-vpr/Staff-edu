import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const publicRoutes = ["/", "/login", "/register"];

  // Allow access to public routes without authentication
  if (publicRoutes.includes(request.nextUrl.pathname)) {
    return NextResponse.next();
  }

  // Get the token from the request to check user authentication and authorization
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  // Redirect to login if there is no token
  if (!token) {
    const signInUrl = new URL("/login", request.url);
    return NextResponse.redirect(signInUrl);
  }

  // Check if the user is accessing a restricted admin-only route
  const adminOnlyRoutes = ["/dashboard/codes", "/dashboard/account"];
  if (adminOnlyRoutes.includes(request.nextUrl.pathname)) {
    // Restrict access to admin users only
    if (token.role !== "admin") {
      const unauthorizedUrl = new URL("/", request.url); // Customize redirection page as needed
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  // If all checks pass, allow access to the requested route
  return NextResponse.next();
}

export const config = {
  matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
};
