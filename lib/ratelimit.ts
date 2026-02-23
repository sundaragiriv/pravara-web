import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

/**
 * Sliding-window rate limiter backed by Upstash Redis.
 * 20 requests per 60-second window per IP.
 *
 * Requires env vars (set in .env.local and Vercel):
 *   UPSTASH_REDIS_REST_URL
 *   UPSTASH_REDIS_REST_TOKEN
 */
export const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,           // records usage in Upstash console
  prefix: "pravara:rl",      // namespaces keys so they're easy to identify
});

/**
 * Extracts the real client IP from a Next.js Route Handler request.
 * Order of precedence:
 *   1. x-forwarded-for  (set by Cloudflare and most reverse-proxies)
 *   2. x-real-ip        (set by Nginx)
 *   3. "anonymous"      (fallback for local dev / direct connections)
 */
export function getClientIP(request: Request): string {
  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "anonymous";
}
