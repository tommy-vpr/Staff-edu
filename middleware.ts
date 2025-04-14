// middleware.ts
import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// // Public routes that anyone can access
// const PUBLIC_PATHS = ["/", "/login", "/admin-login", "/admin-signup"];

// // Admin-only routes (optional, based on your logic)
// const ADMIN_ONLY_PATHS = ["/dashboard/codes", "/dashboard/account"];

// middleware.ts
export function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const pathname = url.pathname;

  if (pathname === "/admin-signup") {
    const token = url.searchParams.get("token");
    const valid = process.env.NEXT_PUBLIC_ADMIN_FORM_ACCESS_TOKEN;
    if (token !== valid) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin-signup"],
};

// export async function middleware(req: NextRequest) {
//   const { pathname, searchParams } = req.nextUrl;

//   // ✅ Allow public routes
//   if (PUBLIC_PATHS.includes(pathname)) {
//     // Special token validation for /admin-signup
//     if (pathname === "/admin-signup") {
//       const tokenParam = searchParams.get("token");
//       const validToken = process.env.NEXT_PUBLIC_ADMIN_FORM_ACCESS_TOKEN;
//       if (tokenParam !== validToken) {
//         return NextResponse.redirect(new URL("/", req.url));
//       }
//     }
//     return NextResponse.next();
//   }

//   // ✅ Check session for protected routes
//   const session = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });

//   if (!session) {
//     return NextResponse.redirect(new URL("/login", req.url));
//   }

//   // ✅ Admin route protection (optional logic)
//   if (ADMIN_ONLY_PATHS.includes(pathname) && session.role !== "admin") {
//     return NextResponse.redirect(new URL("/", req.url));
//   }

//   return NextResponse.next();
// }

// // ✅ Match all routes except special cases (like static files, API, etc.)
// export const config = {
//   matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
// };

// import { NextResponse } from "next/server";
// import type { NextRequest } from "next/server";
// import { getToken } from "next-auth/jwt";

// export async function middleware(request: NextRequest) {
//   const publicRoutes = ["/", "/login", "/register", "/unsubscribe"];

//   // Allow access to public routes without authentication
//   if (publicRoutes.includes(request.nextUrl.pathname)) {
//     return NextResponse.next();
//   }

//   // Get the token from the request to check user authentication and authorization
//   const token = await getToken({
//     req: request,
//     secret: process.env.NEXTAUTH_SECRET,
//   });

//   // Redirect to login if there is no token
//   if (!token) {
//     const signInUrl = new URL("/login", request.url);
//     return NextResponse.redirect(signInUrl);
//   }

//   // Check if the user is accessing a restricted admin-only route
//   const adminOnlyRoutes = ["/dashboard/codes", "/dashboard/account"];
//   if (adminOnlyRoutes.includes(request.nextUrl.pathname)) {
//     // Restrict access to admin users only
//     if (token.role !== "admin") {
//       const unauthorizedUrl = new URL("/", request.url); // Customize redirection page as needed
//       return NextResponse.redirect(unauthorizedUrl);
//     }
//   }

//   // If all checks pass, allow access to the requested route
//   return NextResponse.next();
// }

// export const config = {
//   matcher: "/((?!api|_next/static|_next/image|favicon.ico).*)",
// };
