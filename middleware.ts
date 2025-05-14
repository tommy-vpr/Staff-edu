import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PUBLIC_ROUTES = ["/", "/login", "/admin-login"];

export async function middleware(req: NextRequest) {
  // const { pathname } = req.nextUrl;
  const pathname = req.nextUrl.pathname.replace(/\/+$/, "") || "/";
  console.log("🔐 Middleware path:", pathname);

  // ✅ Allow public routes
  if (PUBLIC_ROUTES.includes(pathname)) {
    return NextResponse.next();
  }

  // ✅ Token-based access for /admin-signup **init git change
  if (pathname === "/admin-signup") {
    const token = req.nextUrl.searchParams.get("token");
    const valid = process.env.NEXT_PUBLIC_ADMIN_FORM_ACCESS_TOKEN;
    if (token !== valid) {
      return NextResponse.redirect(new URL("/", req.url));
    }
    return NextResponse.next();
  }

  // ✅ Protect all other routes using NextAuth session
  const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

  if (!session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|images|.*\\..*).*)"], // exclude Next.js internals and static files
};
