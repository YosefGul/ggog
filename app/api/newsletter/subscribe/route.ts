import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email || !email.includes("@")) {
      return NextResponse.json(
        { error: "Geçerli bir e-posta adresi giriniz" },
        { status: 400 }
      );
    }

    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email },
    });

    if (existing) {
      if (existing.isActive) {
        return NextResponse.json(
          { error: "Bu e-posta adresi zaten abone" },
          { status: 400 }
        );
      } else {
        await prisma.newsletterSubscription.update({
          where: { email },
          data: { isActive: true },
        });
        return NextResponse.json({ success: true });
      }
    }

    await prisma.newsletterSubscription.create({
      data: {
        email,
        isActive: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error subscribing to newsletter:", error);
    return NextResponse.json(
      { error: "Abonelik işlemi başarısız" },
      { status: 500 }
    );
  }
}



