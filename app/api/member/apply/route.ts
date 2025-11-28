import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { withErrorHandling } from "@/lib/error-handler";
import { rateLimit } from "@/lib/rate-limit";
import * as z from "zod";

const memberApplicationRateLimit = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 3, // 3 applications per minute
});

// Dynamic schema - will validate based on form fields
const dynamicMemberApplicationSchema = z.record(z.any());

export const POST = withErrorHandling(async (request: NextRequest) => {
  // Rate limiting
  const rateLimitResponse = await memberApplicationRateLimit(request);
  if (rateLimitResponse) {
    return rateLimitResponse;
  }

  const body = await request.json();

  // Validate that body is an object
  if (!body || typeof body !== "object") {
    return NextResponse.json(
      { error: "Geçersiz form verisi" },
      { status: 400 }
    );
  }

  // Get required fields from form configuration
  const formFields = await prisma.formField.findMany({
    where: {
      isMemberForm: true,
      isRequired: true,
    },
  });

  // Validate required fields
  for (const field of formFields) {
    if (!body[field.id] || (typeof body[field.id] === "string" && body[field.id].trim() === "")) {
      return NextResponse.json(
        { error: `${field.label} alanı zorunludur` },
        { status: 400 }
      );
    }

    // Additional validation based on field type
    if (field.fieldType === "email" && body[field.id]) {
      const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
      if (!emailRegex.test(body[field.id])) {
        return NextResponse.json(
          { error: `${field.label} için geçerli bir e-posta adresi giriniz` },
          { status: 400 }
        );
      }
    }

    if (field.fieldType === "url" && body[field.id]) {
      const urlRegex = /^https?:\/\/.+/i;
      if (!urlRegex.test(body[field.id])) {
        return NextResponse.json(
          { error: `${field.label} için geçerli bir URL giriniz` },
          { status: 400 }
        );
      }
    }
  }

  // Store all form data in additionalInfo JSON field
  // Also extract common fields if they exist for backward compatibility
  const application = await prisma.memberApplication.create({
    data: {
      // Try to extract common fields for backward compatibility
      firstName: body.firstName || body["firstName"] || "",
      lastName: body.lastName || body["lastName"] || "",
      email: body.email || body["email"] || "",
      phone: body.phone || body["phone"] || "",
      dateOfBirth: body.dateOfBirth ? new Date(body.dateOfBirth) : null,
      address: body.address || body["address"] || null,
      city: body.city || body["city"] || null,
      country: body.country || body["country"] || "Türkiye",
      occupation: body.occupation || body["occupation"] || null,
      company: body.company || body["company"] || null,
      experience: body.experience || body["experience"] || null,
      portfolio: body.portfolio || body["portfolio"] || null,
      linkedin: body.linkedin || body["linkedin"] || null,
      github: body.github || body["github"] || null,
      website: body.website || body["website"] || null,
      motivation: body.motivation || body["motivation"] || null,
      expectations: body.expectations || body["expectations"] || null,
      gameDevelopmentExperience: body.gameDevelopmentExperience || body["gameDevelopmentExperience"] || null,
      preferredRole: body.preferredRole || body["preferredRole"] || null,
      skills: body.skills || body["skills"] || null,
      // Store all form data dynamically
      additionalInfo: body,
      status: "pending",
    },
  });

  return NextResponse.json(
    { message: "Başvuru başarıyla gönderildi", id: application.id },
    { status: 201 }
  );
});
