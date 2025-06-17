import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { Redis } from "@upstash/redis";
import prisma from "@/lib/prisma";
import crypto from "crypto";

const normalizationMap: Record<string, string> = {
  "Binge-watching 🎮": "Binge-watching 🎮",
  "Atracción de series 📺": "Binge-watching 🎮",
  "Binge-watching 📺": "Binge-watching 🎮",
  "Relajándome con amigos 🍻": "Chilling with friends 🍻",
  "Trabajo creativo 🎨": "Creative work 🎨",
  "Creative work 🎨": "Creative work 🎨",
  "Chilling with friends 🍻": "Chilling with friends 🍻",
  "Staying active 🌞": "Staying active 🌞",
  "Mantenerse activo 🌞": "Staying active 🌞",

  "Energizado y en movimiento 🚀": "Energized & Moving 🚀",
  "Energized & Moving 🚀": "Energized & Moving 🚀",
  "Relaxación total 🛋️": "Full Chill & Relaxed 🛋️",
  "Full Chill & Relaxed 🛋️": "Full Chill & Relaxed 🛋️",
  "Creativo y centrado 💡": "Creative & Focused 💡",
  "Creativo y enfocado 💡": "Creative & Focused 💡",
  "Creative & Focused 💡": "Creative & Focused 💡",
  "Social & Uplifting 🥳": "Social & Uplifting 🥳",

  "Fresh Fruit🍎": "Fresh Fruit🍎",
  "Sweet Treats 🍪": "Sweet Treats 🍪",
  "Savory Snacks 🍟": "Savory Snacks 🍟",
  "Anything Available 😅": "Anything Available 😅",
  "Anything and everything 😅": "Anything Available 😅",
  "Cualquier cosa y todo 😅": "Anything Available 😅",
  "Snacks Salados 🍟": "Savory Snacks 🍟",
  "Dulces delicias 🍪": "Sweet Treats 🍪",

  "At the Beach 🌴": "At the Beach 🌴",
  "En la playa 🌴": "At the Beach 🌴",
  "In a Cozy Cabin 🏕️": "In a Cozy Cabin 🏕️",
  "En una cabaña acogedora 🏕️": "In a Cozy Cabin 🏕️",
  "En una acogedora cabaña 🏕️": "In a Cozy Cabin 🏕️",
  "Exploring the City 🌸": "Exploring the City 🌸",
  "Explorando la ciudad 🌃": "Exploring the City 🌸",
  "Exploring the City 🌃": "Exploring the City 🌸",
  "At a BBQ with Friends 🍔": "At a BBQ with Friends 🍔",

  "Energized & Ready 💪": "Energized & Ready 💪",
  "Energizado y listo 💪": "Energized & Ready 💪",
  "Relaxed & Laid Back 🌙": "Relaxed & Laid Back 🌙",
  "Relajado y tranquilo 🌙": "Relaxed & Laid Back 🌙",
  "Inspired & Creative ✨": "Inspired & Creative ✨",
  "Inspirado y creativo ✨": "Inspired & Creative ✨",
  "Social & Vibing 🥳": "Social & Vibing 🥳",
  "Social y vibrante 🥳": "Social & Vibing 🥳",

  // Add these missing variants
  "Atracón de series 📺": "Binge-watching 🎮",
  "Relajación total 🛋️": "Full Chill & Relaxed 🛋️",
  "Exploring the City 🎨": "Exploring the City 🌸", // normalize to the default one
  "En una cabaña acogedora 🏡": "In a Cozy Cabin 🏡",
  "En una acogedora cabaña 🏡": "In a Cozy Cabin 🏡",
};

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
    const userResponses = (await prisma.questionnaire.findMany()) || [];

    if (userResponses.length === 0) {
      return new Response(JSON.stringify({ error: "No quiz data found" }), {
        status: 404,
      });
    }

    const defaultQuestions = [
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
          { text: "Savory Snacks 🍟", value: "C", count: 0 },
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
    ];

    let quizData = [
      {
        "quiz-count": userResponses.length,
        data: new Map(
          defaultQuestions.map((q) => {
            const normalizedAnswers = q.answers.map((a) => {
              const normalizedText = normalizationMap[a.text] || a.text;
              return { ...a, text: normalizedText };
            });
            return [q.question, normalizedAnswers];
          })
        ),
      },
    ];

    userResponses.forEach((user) => {
      if (!user.questions || !Array.isArray(user.questions)) return;

      // ✅ Type assertion to explicitly define the structure of `questions`
      (user.questions as { question: string; answer: string }[]).forEach(
        ({ question, answer }) => {
          const answers = quizData[0].data.get(question) ?? [];

          const normalized = normalizationMap[answer] || answer;

          // Try to find an existing answer by normalized text
          let answerObj = answers.find((a) => a.text === normalized);

          if (!answerObj) {
            // Try to preserve original value (A-D) if found from default
            const defaultValue =
              defaultQuestions
                .find((q) => q.question === question)
                ?.answers.find(
                  (a) =>
                    normalizationMap[a.text] === normalized ||
                    a.text === normalized
                )?.value || "D";

            answerObj = {
              text: normalized,
              value: defaultValue,
              count: 0,
            };
            answers.push(answerObj);
          }

          answerObj.count += 1;
          quizData[0].data.set(question, answers);
        }
      );
    });

    // ✅ Convert Map back to an array before returning
    const formattedQuizData = {
      "quiz-count": userResponses.length,
      data: Array.from(quizData[0].data, ([question, answers]) => ({
        question,
        answers,
      })),
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
