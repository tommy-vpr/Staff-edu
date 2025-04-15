import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://itslitto.com"; // ✅ Default allowed origin

// ✅ Set up Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WINDOW = 60; // 60 seconds
const LIMIT = 5; // Allow max 5 requests per minute per IP

// ✅ Function to set CORS headers dynamically
function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ✅ Handle CORS Preflight Requests
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ✅ Apply rate limiting BEFORE generating a JWT
export async function GET(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;

  // ✅ Handle CORS for actual GET request
  if (!origin.includes("itslitto.com")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
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
      await redis.expire(key, WINDOW); // Set expiration for rate limit window
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

    return new Response(JSON.stringify({ token }), {
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
