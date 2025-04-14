import type { NextAuthOptions, Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { checkRateLimit } from "./rateLimit";

export const authOptions = {
  providers: [
    // Admin login
    CredentialsProvider({
      id: "credentials",
      name: "Admin Login",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials, req) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        const headers = req?.headers ?? {};

        // ✅ Get client IP from request headers
        const ip =
          headers["x-forwarded-for"]?.split(",")[0] ??
          headers["cf-connecting-ip"] ??
          headers["x-real-ip"] ??
          "127.0.0.1"; // Default to localhost

        // ✅ Apply rate limiting before authentication
        await checkRateLimit(ip, "login");

        const user = await prisma.user.findUnique({
          where: { email: credentials?.email },
        });

        if (!user || user.role !== "admin")
          throw new Error("Invalid credentials");

        const isValid = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isValid) throw new Error("Invalid credentials");

        return {
          id: user.id,
          email: user.email,
          name: user.firstName,
          role: user.role,
        };
      },
    }),

    // Regular user login via code
    CredentialsProvider({
      id: "code-credentials",
      name: "Invite Code Login",
      credentials: {
        code: { label: "Invite Code", type: "text" },
      },
      async authorize(credentials, req) {
        const headers = req?.headers ?? {};

        // ✅ Get client IP from request headers
        const ip =
          headers["x-forwarded-for"]?.split(",")[0] ??
          headers["cf-connecting-ip"] ??
          headers["x-real-ip"] ??
          "127.0.0.1"; // Default to localhost

        // ✅ Apply rate limiting before authentication
        await checkRateLimit(ip, "login");

        const code = credentials?.code;

        if (!code) {
          throw new Error("Invite code is required");
        }
        console.log("🔑 Received code:", code);

        // 1. Find the InviteCode
        const invite = await prisma.inviteCode.findUnique({
          where: { code },
          include: { usedBy: true }, // get related user
        });

        console.log("📄 Invite fetched:", invite);
        // 2. Validate InviteCode
        if (!invite || !invite.usedBy) {
          throw new Error(
            "Invalid invite code or code is not linked to a user"
          );
        }

        const user = invite.usedBy;

        // 4. Return the user for session
        return {
          id: user.id.toString(),
          email: user.email,
          name: `${user.firstName} ${user.lastName}`,
          firstName: user.firstName,
          role: user.role,
          testTaken: user.testTaken,
        };
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },

  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User & { testTaken?: boolean };
    }): Promise<JWT> {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.role = user.role;
        token.name = user.name;
        token.firstName = user.firstName;
        token.testTaken = user.testTaken ?? false;
      } else {
        // On session refresh: fetch user from DB by ID
        const dbUser = await prisma.user.findUnique({
          where: { id: token.id },
        });

        if (dbUser) {
          token.testTaken = dbUser.testTaken ?? false;
          token.firstName = dbUser.firstName;
        }
      }

      return token;
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
        session.user.email = token.email as string;
        session.user.name = token.name as string;
        session.user.firstName = token.firstName as string;
        session.user.testTaken = token.testTaken as boolean;
      }
      return session;
    },
  },

  pages: {
    signIn: "/login",
  },

  secret: process.env.NEXTAUTH_SECRET,
};
