import { getServerSession, Session } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { ExtendedUser } from "@/types/auth";
import { logger } from "./logger";

export async function getSession(): Promise<Session | null> {
  try {
    const session = await getServerSession(authOptions);
    return session;
  } catch (error) {
    // JWT decryption hatası durumunda null döndür
    logger.error("Session error", { error });
    return null;
  }
}

export async function getCurrentUser(): Promise<ExtendedUser | null> {
  const session = await getSession();
  return (session?.user as ExtendedUser) || null;
}


