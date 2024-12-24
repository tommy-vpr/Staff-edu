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
    // Staff Credentials
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

        // Find staff by email
        const staff = await prisma.staff.findUnique({
          where: { email: credentials.email },
        });

        if (!staff) {
          throw new Error("No staff found with this email");
        }

        // Verify password
        const isPasswordCorrect = await bcrypt.compare(
          credentials.code,
          staff.password ?? "" // Default to an empty string if password is null
        );
        if (!isPasswordCorrect) {
          throw new Error("Invalid email or password");
        }

        // Return the staff data in the expected User format
        const authstaff: User = {
          id: staff.id,
          name: `${staff.firstName} ${staff.lastName}`,
          email: staff.email,
          takenTest: staff.takenTest,
          testsTaken: staff.testsTaken || [],
        };

        return authstaff;
      },
    }),
  ],
  callbacks: {
    async jwt({
      token,
      user,
    }: {
      token: JWT;
      user?: User | null;
    }): Promise<JWT> {
      // Populate the token during the first sign-in
      if (user) {
        token.id = user.id;
        token.role = user.role; // Include role if available
        token.takenTest = user.takenTest; // Include takenTest if applicable
        token.testsTaken = user.testsTaken || [];
      }

      return token; // Return the updated token
    },

    async session({
      session,
      token,
    }: {
      session: Session;
      token: JWT;
    }): Promise<Session> {
      // Fetch additional user data based on role
      if (token.role === "admin") {
        // Fetch from `User` model
        const user = await prisma.user.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            role: true,
          },
        });

        if (user) {
          session.user = {
            ...session.user,
            id: user.id,
            role: user.role,
          };
        }
      } else {
        // Fetch from `Staff` model
        const staff = await prisma.staff.findUnique({
          where: { id: token.id as string },
          select: {
            id: true,
            takenTest: true,
            testsTaken: true,
          },
        });

        if (staff) {
          session.user = {
            ...session.user,
            id: staff.id,
            role: "staff", // Default role for staff
            takenTest: staff.takenTest,
            testsTaken: staff.testsTaken || [],
          };
        }
      }

      return session; // Return the updated session
    },
  },

  secret: process.env.NEXTAUTH_SECRET,
};
