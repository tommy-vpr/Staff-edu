import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";
import crypto from "crypto";

// ✅ Ensure JWT Secret Exists
if (!process.env.SHOPIFY_API_SECRET) {
  throw new Error("SHOPIFY_API_SECRET is missing in environment variables.");
}
const JWT_SECRET = process.env.SHOPIFY_API_SECRET;
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || "https://itslitto.com";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const WINDOW = 60;
const LIMIT = 5;

function getCorsHeaders(origin?: string) {
  return {
    "Access-Control-Allow-Origin": origin || ALLOWED_ORIGIN,
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Access-Control-Allow-Credentials": "true",
  };
}

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(req: Request) {
  const origin = req.headers.get("origin") || ALLOWED_ORIGIN;

  if (!origin.includes("itslitto.com")) {
    return new Response(JSON.stringify({ error: "Forbidden" }), {
      status: 403,
      headers: getCorsHeaders(origin),
    });
  }

  // ✅ Verify JWT Token before rate limiting
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
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Unauthorized: Invalid token" }),
      { status: 401, headers: getCorsHeaders(origin) }
    );
  }

  // ✅ Rate Limiting AFTER authentication
  const rawIp =
    req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";
  const ipHash = crypto.createHash("sha256").update(rawIp).digest("hex");
  const key = `rate_limit:ip:${ipHash}`;
  const requestCount = (await redis.get<number>(key)) || 0;

  if (requestCount >= LIMIT) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: getCorsHeaders(origin),
    });
  }

  await redis.set(key, requestCount + 1, { ex: WINDOW });

  try {
    // ✅ MongoDB Aggregation to format data in the database
    const aggregationPipeline = [
      { $unwind: "$questions" },
      {
        $group: {
          _id: "$questions.question",
          answers: {
            $push: "$questions.answer",
          },
        },
      },
      {
        $project: {
          _id: 0,
          question: "$_id",
          answers: {
            $map: {
              input: "$answers",
              as: "answer",
              in: {
                text: "$$answer",
                count: { $sum: 1 },
              },
            },
          },
        },
      },
      {
        $group: {
          _id: null,
          data: { $push: "$$ROOT" },
        },
      },
    ];

    const result = (await prisma.$runCommandRaw({
      aggregate: "questionnaire",
      pipeline: aggregationPipeline,
      cursor: {},
    })) as { cursor?: { firstBatch?: any[] } } | null; // ✅ Typecast explicitly

    // ✅ Ensure result is an object and firstBatch exists
    if (
      !result ||
      typeof result !== "object" ||
      !result.cursor ||
      !Array.isArray(result.cursor.firstBatch)
    ) {
      return new Response(JSON.stringify({ error: "No quiz data found" }), {
        status: 404,
        headers: getCorsHeaders(origin),
      });
    }

    // ✅ Transform MongoDB response
    const formattedQuizData = {
      "quiz-count": result.cursor.firstBatch.length,
      data: result.cursor.firstBatch,
    };

    return NextResponse.json(formattedQuizData, {
      headers: getCorsHeaders(origin),
    });
  } catch (error) {
    console.error("Error fetching quiz data:", error);
    return new Response(JSON.stringify({ error: "Internal Server Error" }), {
      status: 500,
      headers: getCorsHeaders(origin),
    });
  }
}
