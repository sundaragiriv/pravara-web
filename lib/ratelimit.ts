import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

type RateLimitPreset = {
  key: string;
  requests: number;
  window: `${number} ${"s" | "m" | "h" | "d"}`;
};

type RateLimitHeaders = Record<string, string>;

type RateLimitResult = {
  success: boolean;
  headers: RateLimitHeaders;
};

const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

const limiterCache = new Map<string, Ratelimit>();

function getLimiter({ key, requests, window }: RateLimitPreset): Ratelimit | null {
  if (!redis) return null;

  const cacheKey = `${key}:${requests}:${window}`;
  const cached = limiterCache.get(cacheKey);
  if (cached) return cached;

  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(requests, window),
    analytics: true,
    prefix: `pravara:rl:${key}`,
  });

  limiterCache.set(cacheKey, limiter);
  return limiter;
}

function buildHeaders(limit: number, remaining: number, reset: number): RateLimitHeaders {
  return {
    "X-RateLimit-Limit": String(limit),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(reset),
    "Retry-After": String(Math.max(0, Math.ceil((reset - Date.now()) / 1000))),
  };
}

export const RATE_LIMITS = {
  biographer: { key: "biographer", requests: 10, window: "1 m" },
  sutradhar: { key: "sutradhar", requests: 20, window: "1 m" },
  matches: { key: "matches", requests: 60, window: "1 m" },
  support: { key: "support", requests: 5, window: "10 m" },
  launchRegister: { key: "launch-register", requests: 8, window: "10 m" },
} satisfies Record<string, RateLimitPreset>;

export function getClientIP(request: Request): string {
  const cfIp = request.headers.get("cf-connecting-ip");
  if (cfIp) return cfIp.trim();

  const xff = request.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();

  const realIp = request.headers.get("x-real-ip");
  if (realIp) return realIp.trim();

  return "anonymous";
}

export async function enforceRateLimit(
  request: Request,
  preset: RateLimitPreset,
  identifier?: string | null
): Promise<RateLimitResult> {
  const limiter = getLimiter(preset);

  if (!limiter) {
    return {
      success: true,
      headers: {},
    };
  }

  const key = identifier?.trim() ? identifier.trim() : `ip:${getClientIP(request)}`;
  const result = await limiter.limit(key);

  return {
    success: result.success,
    headers: buildHeaders(result.limit, result.remaining, result.reset),
  };
}
