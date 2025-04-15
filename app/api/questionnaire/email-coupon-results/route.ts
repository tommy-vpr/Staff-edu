import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { generateDiscountCode } from "@/app/actions/QuestionnaireShopify";
import { sendQuestionnaireCoupon } from "@/app/actions/email";
import { updateQuizResult } from "@/lib/updateQuizResult";

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://itslitto.com";

// ✅ Set up Redis for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WINDOW = 60; // 60 seconds
const LIMIT = 5; // Allow max 5 requests per minute per IP

type QuestionnaireProps = {
  email: string;
  couponCode: string;
  results: { question: string; answer: string }[]; // Array of question-answer objects
  products: { url: string; image: string; title: string }[];
};

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

// ✅ Handle POST request: Update quiz result and send email
export async function POST(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;

  // ✅ Block unauthorized origins
  if (!origin.includes("itslitto.com")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `rate_limit:ip:${ip}`;

  // ✅ Apply rate limiting
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

  // ✅ Verify JWT Token
  const authHeader = req.headers.get("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(
      JSON.stringify({ error: "Unauthorized - No token provided" }),
      { status: 401, headers: getCorsHeaders(origin) }
    );
  }

  const token = authHeader.split(" ")[1];

  try {
    jwt.verify(token, JWT_SECRET);

    // ✅ Parse Request Body
    const {
      id,
      email,
      results,
      products,
    }: {
      id: string;
      email: string;
      results: { question: string; answer: string }[];
      products: { url: string; image: string; title: string }[];
    } = await req.json();

    if (!id || !email || !Array.isArray(results)) {
      return new Response(
        JSON.stringify({
          error: "Missing or invalid fields: id, email, results",
        }),
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // ✅ Step 1: Update the quiz result in Prisma Database
    const updateResponse = await updateQuizResult(id, email);
    if (!updateResponse.success) {
      return new Response(
        JSON.stringify({ error: "Failed to update quiz result" }),
        { status: 500, headers: getCorsHeaders(origin) }
      );
    }

    // ✅ Step 2: Generate discount code
    const discountResponse = await generateDiscountCode();
    if (!discountResponse || !discountResponse.code) {
      throw new Error("Failed to generate discount code.");
    }

    const couponCode = discountResponse.code;

    // ✅ Step 3: Send email with the discount code and quiz results
    const emailPayload: QuestionnaireProps = {
      email,
      couponCode,
      results, // ✅ Now passing quiz results correctly
      products,
    };

    const emailResponse = await sendQuestionnaireCoupon(emailPayload);

    if (emailResponse.error) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: getCorsHeaders(origin),
      });
    }

    return new Response(JSON.stringify({ success: true, couponCode }), {
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
