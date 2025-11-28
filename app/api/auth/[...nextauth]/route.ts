import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { logAdminAction } from "@/lib/admin-logger";
import { ExtendedUser, ExtendedJWT } from "@/types/auth";
import { env } from "@/lib/env";
import { logger } from "@/lib/logger";

declare module "next-auth" {
  interface Session {
    user: ExtendedUser;
  }
  interface User extends ExtendedUser {}
}

declare module "next-auth/jwt" {
  interface JWT extends ExtendedJWT {}
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          return null;
        }

        const isPasswordValid = await verifyPassword(
          credentials.password,
          user.password
        );

        if (!isPasswordValid) {
          return null;
        }

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/login-admin",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.email = user.email;
        token.name = user.name;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token) {
        (session.user as ExtendedUser).id = token.id;
        (session.user as ExtendedUser).role = token.role;
      }
      return session;
    },
    async signIn({ user }) {
      // Log login action
      if (user && user.id) {
        try {
          await logAdminAction({
            userId: user.id,
            action: "LOGIN",
            entityType: "User",
            entityId: user.id,
            entityName: user.email || "User",
          });
        } catch (error) {
          // Don't fail login if logging fails
          logger.error("Failed to log login", { error });
        }
      }
      return true;
    },
  },
  events: {
    async signOut({ token }) {
      // Log logout action
      if (token && token.id) {
        try {
          await logAdminAction({
            userId: token.id,
            action: "LOGOUT",
            entityType: "User",
            entityId: token.id,
            entityName: token.email || "User",
          });
        } catch (error) {
          // Don't fail logout if logging fails
          logger.error("Failed to log logout", { error });
        }
      }
    },
  },
  secret: env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

