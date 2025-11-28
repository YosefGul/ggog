import { NextRequest, NextResponse } from "next/server";
import { safeRedisOperation } from "./redis";
import { logger } from "./logger";

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  keyGenerator?: (req: NextRequest) => string; // Custom key generator
  skipSuccessfulRequests?: boolean; // Don't count successful requests
  skipFailedRequests?: boolean; // Don't count failed requests
}

const DEFAULT_OPTIONS: RateLimitOptions = {
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 100,
};

/**
 * Get client IP from request
 */
function getClientIp(req: NextRequest): string {
  const forwarded = req.headers.get("x-forwarded-for");
  const realIp = req.headers.get("x-real-ip");
  return forwarded?.split(",")[0].trim() || realIp || "unknown";
}

/**
 * Generate rate limit key
 */
function generateKey(req: NextRequest, options: RateLimitOptions): string {
  if (options.keyGenerator) {
    return options.keyGenerator(req);
  }
  const ip = getClientIp(req);
  const path = req.nextUrl.pathname;
  return `rate_limit:${ip}:${path}`;
}

/**
 * Rate limiting middleware using Redis (with memory fallback)
 */
const memoryStore = new Map<string, { count: number; resetAt: number }>();

async function checkRateLimitRedis(
  key: string,
  windowMs: number,
  maxRequests: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  return safeRedisOperation(
    async (client) => {
      const now = Date.now();
      const windowKey = `rate_limit:${key}`;
      
      // Get current count
      const count = await client.get(windowKey);
      const currentCount = count ? parseInt(count, 10) : 0;

      if (currentCount >= maxRequests) {
        // Get TTL to calculate reset time
        const ttl = await client.ttl(windowKey);
        return {
          allowed: false,
          remaining: 0,
          resetAt: now + (ttl > 0 ? ttl * 1000 : windowMs),
        };
      }

      // Increment counter
      const pipeline = client.multi();
      pipeline.incr(windowKey);
      pipeline.expire(windowKey, Math.ceil(windowMs / 1000));
      await pipeline.exec();

      return {
        allowed: true,
        remaining: maxRequests - currentCount - 1,
        resetAt: now + windowMs,
      };
    },
    // Fallback to memory store
    checkRateLimitMemory(key, windowMs, maxRequests)
  );
}

function checkRateLimitMemory(
  key: string,
  windowMs: number,
  maxRequests: number
): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const record = memoryStore.get(key);

  if (!record || now > record.resetAt) {
    // New window
    memoryStore.set(key, { count: 1, resetAt: now + windowMs });
    // Cleanup old entries periodically
    if (memoryStore.size > 1000) {
      for (const [k, v] of memoryStore.entries()) {
        if (now > v.resetAt) {
          memoryStore.delete(k);
        }
      }
    }
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetAt: now + windowMs,
    };
  }

  if (record.count >= maxRequests) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: record.resetAt,
    };
  }

  record.count++;
  return {
    allowed: true,
    remaining: maxRequests - record.count,
    resetAt: record.resetAt,
  };
}

/**
 * Rate limit middleware factory
 */
export function rateLimit(options: Partial<RateLimitOptions> = {}) {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  return async (req: NextRequest): Promise<NextResponse | null> => {
    const key = generateKey(req, opts);
    const { allowed, remaining, resetAt } = await checkRateLimitRedis(
      key,
      opts.windowMs,
      opts.maxRequests
    );

    if (!allowed) {
      logger.warn("Rate limit exceeded", {
        key,
        ip: getClientIp(req),
        path: req.nextUrl.pathname,
      });

      return NextResponse.json(
        {
          error: "Too many requests. Please try again later.",
          retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
        },
        {
          status: 429,
          headers: {
            "Retry-After": Math.ceil((resetAt - Date.now()) / 1000).toString(),
            "X-RateLimit-Limit": opts.maxRequests.toString(),
            "X-RateLimit-Remaining": remaining.toString(),
            "X-RateLimit-Reset": resetAt.toString(),
          },
        }
      );
    }

    // Add rate limit headers to response
    const response = NextResponse.next();
    response.headers.set("X-RateLimit-Limit", opts.maxRequests.toString());
    response.headers.set("X-RateLimit-Remaining", remaining.toString());
    response.headers.set("X-RateLimit-Reset", resetAt.toString());

    return null; // Continue to next handler
  };
}

