import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";
import { cookies } from "next/headers"; // ✅ Async cookies handling in Next.js 15

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const ALLOWED_ORIGINS = [
  "https://itslitto.com",
  "https://www.itslitto.com",
  "https://cedu.itslitto.com",
  "https://www.cedu.itslitto.com",
];

// ✅ Set up Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WINDOW = 60; // 60 seconds
const LIMIT = 5; // Allow max 5 requests per minute per IP

// ✅ Function to set CORS headers
function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ✅ Handle CORS Preflight Requests (OPTIONS)
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ✅ Handle JWT Generation and Store in HTTP-Only Cookie
export async function GET(req: Request) {
  const origin = req.headers.get("origin") || "";

  // ✅ Ensure origin is strictly allowed
  if (!ALLOWED_ORIGINS.includes(origin)) {
    return new Response(JSON.stringify({ error: "Forbidden - CORS" }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `rate_limit:ip:${ip}`;

  // ✅ Check rate limit
  try {
    const current = await redis.incr(key);
    if (current === 1) {
      await redis.expire(key, WINDOW);
    }

    if (current > LIMIT) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Try again later." }),
        {
          status: 429,
          headers: getCorsHeaders(origin),
        }
      );
    }
  } catch (error) {
    console.error("Rate limiting error:", error);
    return new Response(JSON.stringify({ error: "Rate limiting failed" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }

  // ✅ Generate JWT token
  try {
    const token = jwt.sign({ shopify: SHOPIFY_DOMAIN }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // ✅ Await `cookies()` since it's async in Next.js 15
    const jwtCookieStore = await cookies();
    jwtCookieStore.set("quizJWT", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none", // ✅ Correct lowercase "none" for cross-origin
      maxAge: 3600, // 1 hour expiration
      path: "/",
    });

    console.log("✅ JWT Stored in Cookie:", token);

    return new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("JWT Generation Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
