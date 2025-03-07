import { NextResponse } from "next/server";
import prisma from "@/lib/prisma"; // ✅ Use shared Prisma instance
import jwt, { JwtPayload } from "jsonwebtoken";
import { Redis } from "@upstash/redis";

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://itslitto.com";

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
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
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

// ✅ Handle POST request to store multiple questions
export async function POST(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;

  if (!origin.includes("itslitto.com")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - No token provided" }),
      {
        status: 401,
        headers: getCorsHeaders(origin),
      }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    // ✅ Verify JWT token
    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.shopify || decoded.shopify !== SHOPIFY_DOMAIN) {
      return new Response(
        JSON.stringify({ error: "Unauthorized - Invalid Shopify API domain" }),
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
          {
            status: 429,
            headers: getCorsHeaders(origin),
          }
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

    const { email, questions, products, state } = body;

    if (!Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields or products array is empty",
        }),
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    if (!Array.isArray(questions) || questions.length === 0) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields or questions array is empty",
        }),
        {
          status: 400,
          headers: getCorsHeaders(origin),
        }
      );
    }

    // ✅ Ensure each question is an object with required fields
    for (const q of questions) {
      if (!q.question || !q.answer) {
        return new Response(
          JSON.stringify({
            error: "Each question must have a 'question' and 'answer' field",
          }),
          {
            status: 400,
            headers: getCorsHeaders(origin),
          }
        );
      }
    }

    // ✅ Store in MongoDB using Prisma (as an array of objects)
    const newResponse = await prisma.questionnaire.create({
      data: {
        shopifyStore,
        email: email || null, // ✅ Allow email to be optional
        state,
        questions, // ✅ Store as an array of objects
        products,
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
