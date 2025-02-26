import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers"; // ✅ Read JWT from HTTP-only cookie

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
const LIMIT = 10; // Allow max 10 requests per minute per Shopify store

// ✅ Generate dynamic CORS headers
function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": ALLOWED_ORIGINS.includes(origin)
      ? origin
      : "https://cedu.itslitto.com",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Access-Control-Allow-Credentials": "true",
  };
}

// ✅ Handle CORS Preflight Requests
export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || "";
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

// ✅ Handle POST request to store quiz responses
export async function POST(req: Request) {
  const origin = req.headers.get("origin") || "ALLOWED_ORIGINS";

  // ✅ Await cookies() since it's now a Promise in Next.js 15
  const jwtCookieStore = await cookies();
  const jwtCookie = jwtCookieStore.get("quizJWT")?.value;

  if (!jwtCookie) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - No token provided" }),
      {
        status: 401,
        headers: getCorsHeaders(origin),
      }
    );
  }

  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(jwtCookie, JWT_SECRET) as JwtPayload;

    if (!decoded.shopify || decoded.shopify !== SHOPIFY_DOMAIN) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid Shopify domain" }),
        {
          status: 403,
          headers: getCorsHeaders(origin),
        }
      );
    }

    const shopifyStore = decoded.shopify;
    const key = `rate_limit:shop:${shopifyStore}`;

    // ✅ Rate limit requests per Shopify store
    let current;
    try {
      current = await redis.incr(key);
      if (current === 1) {
        await redis.expire(key, WINDOW);
      }

      if (current > LIMIT) {
        return new Response(
          JSON.stringify({ error: "Too many requests. Try again later." }),
          { status: 429, headers: getCorsHeaders(origin) }
        );
      }
    } catch (redisError) {
      console.error("Redis Error:", redisError);
      return new Response(
        JSON.stringify({ error: "Rate limiting failed - Redis issue" }),
        {
          status: 500,
          headers: getCorsHeaders(origin),
        }
      );
    }

    // ✅ Parse request body safely
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return new Response(JSON.stringify({ error: "Invalid JSON format" }), {
        status: 400,
        headers: getCorsHeaders(origin),
      });
    }

    const { email, questions } = body;

    if (!Array.isArray(questions) || questions.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields or questions array is empty",
        }),
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // ✅ Ensure each question has required fields
    for (const q of questions) {
      if (!q.question || !q.answer) {
        return new Response(
          JSON.stringify({
            error: "Each question must have a 'question' and 'answer' field",
          }),
          { status: 400, headers: getCorsHeaders(origin) }
        );
      }
    }

    // ✅ Store data in MongoDB using Prisma
    const newResponse = await prisma.questionnaire.create({
      data: {
        shopifyStore,
        email: email || null, // ✅ Allow email to be optional
        questions, // ✅ Store as an array of objects
      },
    });

    return new Response(JSON.stringify({ success: true, data: newResponse }), {
      status: 200,
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("Error processing request:", error);

    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
