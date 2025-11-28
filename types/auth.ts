import { UserRole } from "@prisma/client";

/**
 * Extended NextAuth user type with role
 */
export interface ExtendedUser {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

/**
 * NextAuth JWT token with user data
 */
export interface ExtendedJWT {
  id: string;
  email: string;
  name?: string | null;
  role: UserRole;
}

