import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";

const JWT_SECRET = process.env.SHOPIFY_API_SECRET!;
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
  const ip = req.headers.get("x-forwarded-for") ?? "unknown";
  const key = `rate_limit:ip:${ip}`;
  const requestCount = (await redis.get<number>(key)) || 0;

  if (requestCount >= LIMIT) {
    return new Response(JSON.stringify({ error: "Too many requests" }), {
      status: 429,
      headers: getCorsHeaders(origin),
    });
  }

  await redis.set(key, requestCount + 1, { ex: WINDOW });

  // ✅ Fetch quiz responses from Prisma
  try {
    const userResponses = await prisma.questionnaire.findMany();

    // ✅ Check if we have responses before processing
    if (!userResponses || userResponses.length === 0) {
      return new Response(JSON.stringify({ error: "No quiz data found" }), {
        status: 404,
        headers: getCorsHeaders(origin),
      });
    }

    let quizData = [
      {
        "quiz-count": userResponses.length,
        data: [
          {
            question: "How do you like to spend your free time?",
            answers: [
              { text: "Staying active 🌞", value: "A", count: 0 },
              { text: "Binge-watching 🎮", value: "B", count: 0 },
              { text: "Creative work 🎨", value: "C", count: 0 },
              { text: "Chilling with friends 🍻", value: "D", count: 0 },
            ],
          },
          {
            question: "What kind of high are you looking for?",
            answers: [
              { text: "Energized & Moving 🚀", value: "A", count: 0 },
              { text: "Full Chill & Relaxed 🛋️", value: "B", count: 0 },
              { text: "Creative & Focused 💡", value: "C", count: 0 },
              { text: "Social & Uplifting 🥳", value: "D", count: 0 },
            ],
          },
          {
            question: "What's your favorite munchies?",
            answers: [
              { text: "Fresh Fruit🍎", value: "A", count: 0 },
              { text: "Sweet Treats 🍪", value: "B", count: 0 },
              { text: `"Savory Snacks 🍟"`, value: "C", count: 0 },
              { text: "Anything Available 😅", value: "D", count: 0 },
            ],
          },
          {
            question: "Where would you rather be?",
            answers: [
              { text: "At the Beach 🌴", value: "A", count: 0 },
              { text: "In a Cozy Cabin 🏡", value: "B", count: 0 },
              { text: "Exploring the City 🎨", value: "C", count: 0 },
              { text: "At a BBQ with Friends 🍔", value: "D", count: 0 },
            ],
          },
          {
            question: "How do you want to feel?",
            answers: [
              { text: "Energized & Ready 💪", value: "A", count: 0 },
              { text: "Relaxed & Laid Back 🌙", value: "B", count: 0 },
              { text: "Inspired & Creative ✨", value: "C", count: 0 },
              { text: "Social & Vibing 🥳", value: "D", count: 0 },
            ],
          },
        ],
      },
    ];

    // ✅ Process user responses safely
    userResponses.forEach((user) => {
      if (!user.questions || !Array.isArray(user.questions)) return;

      user.questions.forEach((response) => {
        const { question, answer } = response;

        let quizQuestion = quizData[0].data.find(
          (q) => q.question === question
        );
        if (!quizQuestion) {
          quizQuestion = { question, answers: [] };
          quizData[0].data.push(quizQuestion);
        }

        let answerObj = quizQuestion.answers.find((a) => a.text === answer);
        if (!answerObj) {
          answerObj = { text: answer, count: 0, value: "N/A" };
          quizQuestion.answers.push(answerObj);
        }

        answerObj.count += 1;
      });
    });

    return NextResponse.json(quizData, {
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
