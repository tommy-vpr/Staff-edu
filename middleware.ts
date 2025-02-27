import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export async function middleware(request: NextRequest) {
  const publicRoutes = ["/", "/login", "/register", "/unsubscribe"];

  if (
    publicRoutes.some((route) => request.nextUrl.pathname.startsWith(route))
  ) {
    return NextResponse.next();
  }

  let token;
  try {
    token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    });
  } catch (error) {
    console.error("Error retrieving token:", error);
    const signInUrl = new URL("/login", request.url);
    return NextResponse.redirect(signInUrl);
  }

  if (!token) {
    const signInUrl = new URL("/login", request.url);
    signInUrl.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  const adminOnlyRoutes = ["/dashboard/codes", "/dashboard/account"];
  if (adminOnlyRoutes.includes(request.nextUrl.pathname)) {
    if (!token.role || token.role !== "admin") {
      const unauthorizedUrl = new URL("/", request.url);
      return NextResponse.redirect(unauthorizedUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
