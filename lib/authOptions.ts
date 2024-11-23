import { NextAuthOptions, Session, User } from "next-auth";
import { JWT } from "next-auth/jwt";
import CredentialsProvider from "next-auth/providers/credentials";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      id: "credentials",
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required");
        }

        // Find user by email
        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        });

        if (!user) {
          throw new Error("No user found with this email");
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.password,
          user.password
        );
        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        // Create a user object that matches NextAuth's User type
        const authUser: User = {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`, // Combine first and last names
          role: user.role, // Add the role to the user object
        };

        return authUser;
      },
    }),
    // Influencer Credentials
    CredentialsProvider({
      id: "influencer-credentials",
      name: "Influencer Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Invitation Code", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials.code) {
          throw new Error("Email and invitation code are required");
        }

        // Find influencer by email in a separate `influencer` table or with a `role` check
        const influencer = await prisma.influencer.findFirst({
          where: { email: credentials.email },
          include: {
            code: true,
          },
        });

        if (!influencer) {
          throw new Error("No influencer found with this email");
        }

        const influencerCode = influencer.code; // Get the first code, if it exists

        // Verify invitation code
        if (!influencerCode || influencerCode.code !== credentials.code) {
          throw new Error("Invalid invitation code or Email");
        }

        // Return the influencer data in the expected User format
        const authInfluencer: User = {
          id: influencer.id,
          name: `${influencer.firstName} ${influencer.lastName}`,
          email: influencer.email,
        };

        return authInfluencer;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // Ensure that the role is added to the session user object
      session.user = {
        ...session.user,
        role: token.role as string, // Add role directly from token
      };
      return session;
    },
    async jwt({ token, user }: { token: JWT; user?: User }) {
      // If user is defined, it's the first sign-in, so add role to the token
      if (user) {
        token.role = user.role; // Store role directly in token
      }
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
