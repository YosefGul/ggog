import NextAuth, { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { logAdminAction } from "@/lib/admin-logger";

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

        const isPasswordValid = await bcrypt.compare(
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
        token.role = (user as any).role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).role = token.role;
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
            entityName: (user as any).email || "User",
          });
        } catch (error) {
          // Don't fail login if logging fails
          console.error("Failed to log login:", error);
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
            userId: token.id as string,
            action: "LOGOUT",
            entityType: "User",
            entityId: token.id as string,
            entityName: (token.email as string) || "User",
          });
        } catch (error) {
          // Don't fail logout if logging fails
          console.error("Failed to log logout:", error);
        }
      }
    },
  },
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };

