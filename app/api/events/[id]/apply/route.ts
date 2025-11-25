import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    const { id } = await Promise.resolve(params);
    const body = await request.json();
    const { formData } = body;

    if (!formData) {
      return NextResponse.json(
        { error: "Form verisi eksik" },
        { status: 400 }
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
    });

    if (!event) {
      return NextResponse.json(
        { error: "Etkinlik bulunamadı" },
        { status: 404 }
      );
    }

    if (!event.acceptsApplications) {
      return NextResponse.json(
        { error: "Bu etkinlik başvuru kabul etmiyor" },
        { status: 400 }
      );
    }

    if (
      event.applicationDeadline &&
      new Date(event.applicationDeadline) < new Date()
    ) {
      return NextResponse.json(
        { error: "Başvuru tarihi geçmiş" },
        { status: 400 }
      );
    }

    await prisma.eventApplication.create({
      data: {
        eventId: id,
        formData: JSON.parse(JSON.stringify(formData)),
        status: "pending",
      },
    });

    return NextResponse.json({ success: true, message: "Başvurunuz başarıyla gönderildi!" });
  } catch (error) {
    console.error("Error submitting application:", error);
    return NextResponse.json(
      { error: "Başvuru gönderimi başarısız" },
      { status: 500 }
    );
  }
}



