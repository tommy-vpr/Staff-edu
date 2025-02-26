import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { NextResponse } from "next/server";

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

    // ✅ Use NextResponse with cookie handling
    const response = new NextResponse(JSON.stringify({ success: true }), {
      status: 200,
      headers: {
        ...getCorsHeaders(origin),
        "Set-Cookie": `quizJWT=${token}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=3600`,
        "Content-Type": "application/json",
      },
    });

    return response;
  } catch (error) {
    console.error("JWT Generation Error:", error);
    return new Response(JSON.stringify({ error: "Failed to generate token" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
