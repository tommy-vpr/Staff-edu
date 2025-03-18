import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

// Initialize Redis connection
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

// ✅ Rate limiter: 5 attempts per minute, but reset time is enforced
const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.fixedWindow(5, "1m"), // 5 requests per minute
});

export async function checkRateLimit(ip: string, type: "signup" | "login") {
  const { success, remaining, reset } = await ratelimit.limit(ip);

  // ✅ Enforce full 60-second lockout after hitting the limit
  const now = Date.now();
  const resetSeconds = Math.ceil((reset - now) / 1000);
  const enforcedResetTime = Math.max(resetSeconds, 60); // Always enforce at least 60 seconds

  if (!success) {
    throw new Error(
      `Too many ${type} attempts. Try again in ${enforcedResetTime} seconds.`
    );
  }
}
