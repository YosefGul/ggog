import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getSession() {
  try {
    return await getServerSession(authOptions);
  } catch (error) {
    // JWT decryption hatası durumunda null döndür
    console.error("Session error:", error);
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user || null;
}

