import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactFormSchema, validateRequestBody } from "@/lib/validation";
import { withErrorHandling } from "@/lib/error-handler";
import { rateLimit } from "@/lib/rate-limit";

const contactRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 5, // 5 submissions per minute
});

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = await contactRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await validateRequestBody(request, contactFormSchema);

  await prisma.contactFormSubmission.create({
    data: {
      name: body.name,
      email: body.email,
      subject: body.subject || null,
      message: body.message,
    },
  });

  return NextResponse.json({ success: true });
});



