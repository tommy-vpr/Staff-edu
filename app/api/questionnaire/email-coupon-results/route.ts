import { NextResponse } from "next/server";
import jwt, { JwtPayload } from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import { cookies } from "next/headers"; // ✅ Import cookies handler
import { generateDiscountCode } from "@/app/actions/QuestionnaireShopify";
import { sendQuestionnaireCoupon } from "@/app/actions/email";
import { updateQuizResult } from "@/lib/updateQuizResult";

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
const SHOPIFY_DOMAIN = process.env.SHOPIFY_DOMAIN!;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://www.itslitto.com";

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
  results: { question: string; answer: string }[];
};

// ✅ Function to set CORS headers dynamically
function getCorsHeaders(origin: string) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
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
    try {
      const current = await redis.incr(key);
      if (current === 1) await redis.expire(key, WINDOW);

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
        { status: 500, headers: getCorsHeaders(origin) }
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

    const { id, email, results } = body;

    if (!email || !Array.isArray(results) || results.length === 0) {
      return new Response(
        JSON.stringify({ error: "Missing or invalid fields: email, results" }),
        { status: 400, headers: getCorsHeaders(origin) }
      );
    }

    // ✅ Ensure each question has required fields
    for (const q of results) {
      if (!q.question || !q.answer) {
        return new Response(
          JSON.stringify({
            error: "Each question must have a 'question' and 'answer' field",
          }),
          { status: 400, headers: getCorsHeaders(origin) }
        );
      }
    }

    // ✅ Step 1: Update the quiz result in Prisma Database
    const updateResponse = await updateQuizResult(id, email);
    if (!updateResponse.success) {
      return new Response(
        JSON.stringify({ error: "Failed to update quiz result" }),
        { status: 500, headers: getCorsHeaders(origin) }
      );
    }

    console.log("✅ Quiz result updated successfully!");

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
      results,
    };

    const emailResponse = await sendQuestionnaireCoupon(emailPayload);

    if (emailResponse.error) {
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: getCorsHeaders(origin),
      });
    }

    // ✅ Store JWT in HTTP-only cookie (Set for 1 hour)
    const response = new Response(
      JSON.stringify({ success: true, couponCode }),
      {
        status: 200,
        headers: getCorsHeaders(origin),
      }
    );

    response.headers.append(
      "Set-Cookie",
      `quizJWT=${jwtCookie}; HttpOnly; Secure; SameSite=Strict; Max-Age=3600; Path=/`
    );

    return response;
  } catch (error) {
    console.error("Error processing request:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
