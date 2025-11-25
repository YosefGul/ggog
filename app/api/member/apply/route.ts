import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const data = await request.json();

    const application = await prisma.memberApplication.create({
      data: {
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        phone: data.phone,
        dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null,
        address: data.address || null,
        city: data.city || null,
        country: data.country || "Türkiye",
        occupation: data.occupation || null,
        company: data.company || null,
        experience: data.experience || null,
        portfolio: data.portfolio || null,
        linkedin: data.linkedin || null,
        github: data.github || null,
        website: data.website || null,
        motivation: data.motivation || null,
        expectations: data.expectations || null,
        gameDevelopmentExperience: data.gameDevelopmentExperience || null,
        preferredRole: data.preferredRole || null,
        skills: data.skills || null,
        status: "pending",
      },
    });

    return NextResponse.json(
      { message: "Başvuru başarıyla gönderildi", id: application.id },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating member application:", error);
    return NextResponse.json(
      { error: "Başvuru gönderilirken bir hata oluştu" },
      { status: 500 }
    );
  }
}



