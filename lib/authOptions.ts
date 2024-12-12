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
      id: "staff-credentials",
      name: "Staff Credentials",
      credentials: {
        email: { label: "Email", type: "text" },
        code: { label: "Invitation Code", type: "text" },
      },
      async authorize(credentials): Promise<User | null> {
        if (!credentials?.email || !credentials.code) {
          throw new Error("Email and invitation code are required");
        }

        // Find influencer by email in a separate `influencer` table or with a `role` check
        const staff = await prisma.staff.findFirst({
          where: { email: credentials.email },
          include: {
            inviteCode: true,
          },
        });

        if (!staff) {
          throw new Error("No staff found with this email");
        }

        const staffCode = staff.inviteCode; // Get the first code, if it exists

        // Verify invitation code
        if (!staffCode || staffCode.code !== credentials.code) {
          throw new Error("Invalid invitation code or Email");
        }

        // Return the staff data in the expected User format
        const authstaff: User = {
          id: staff.id,
          name: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          takenTest: staff.takenTest,
        };

        return authstaff;
      },
    }),
  ],
  callbacks: {
    async session({ session, token }: { session: Session; token: JWT }) {
      // Dynamically fetch the latest user data from the database
      const user = await prisma.staff.findUnique({
        where: { id: token.id },
        select: {
          id: true,
          takenTest: true, // Ensure takenTest is included
        },
      });

      if (user) {
        session.user = {
          ...session.user,
          id: user.id,
          takenTest: user.takenTest, // Add takenTest directly from the database
        };
      }

      return session; // Return the updated session
    },

    async jwt({ token, user }: { token: JWT; user?: User }) {
      // If user is defined, it's the first sign-in, so add fields to the token
      if (user) {
        token.id = user.id;
        token.role = user.role;
        token.takenTest = user.takenTest;
      }

      // If the token already exists, return it as is
      return token;
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
