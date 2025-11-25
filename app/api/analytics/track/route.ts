import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// Simple rate limiting - store in memory (in production, use Redis)
const requestCounts = new Map<string, { count: number; resetAt: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX = 100; // Max requests per window

function getRateLimitKey(ip: string, sessionId: string): string {
  return `${ip}_${sessionId}`;
}

function checkRateLimit(ip: string, sessionId: string): boolean {
  const key = getRateLimitKey(ip, sessionId);
  const now = Date.now();
  const record = requestCounts.get(key);

  if (!record || now > record.resetAt) {
    requestCounts.set(key, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return true;
  }

  if (record.count >= RATE_LIMIT_MAX) {
    return false;
  }

  record.count++;
  return true;
}

// Anonymize IP address (remove last octet)
function anonymizeIp(ip: string | null): string | null {
  if (!ip) return null;
  
  // Handle IPv4
  if (ip.includes(".")) {
    const parts = ip.split(".");
    if (parts.length === 4) {
      return `${parts[0]}.${parts[1]}.${parts[2]}.0`;
    }
  }
  
  // Handle IPv6 (simplified - just return null for now)
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      eventType,
      page,
      referrer,
      userAgent,
      deviceType,
      browser,
      os,
      sessionId,
      metadata,
    } = body;

    // Get client IP
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const clientIp = forwarded?.split(",")[0].trim() || realIp || "unknown";

    // Rate limiting
    if (!checkRateLimit(clientIp, sessionId || "unknown")) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    }

    // Anonymize IP
    const anonymizedIp = anonymizeIp(clientIp);

    // Save analytics event
    await prisma.analyticsEvent.create({
      data: {
        eventType,
        page,
        referrer: referrer || null,
        userAgent: userAgent || null,
        ipAddress: anonymizedIp,
        deviceType: deviceType || null,
        browser: browser || null,
        os: os || null,
        sessionId: sessionId || null,
        metadata: metadata ? JSON.parse(JSON.stringify(metadata)) : null,
        duration: metadata?.duration || null,
      },
    });

    // Update or create session
    if (sessionId) {
      await prisma.analyticsSession.upsert({
        where: { sessionId },
        update: {
          pageViews: { increment: 1 },
          duration: metadata?.duration
            ? { increment: metadata.duration }
            : undefined,
          updatedAt: new Date(),
        },
        create: {
          sessionId,
          deviceType: deviceType || null,
          country: null, // Could be added with IP geolocation service
          browser: browser || null,
          os: os || null,
          pageViews: 1,
          duration: metadata?.duration || 0,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    // Don't fail the request - analytics should be non-blocking
    return NextResponse.json({ success: false }, { status: 200 });
  }
}

