import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string; // Unique user ID
      email?: string | null;
      name?: string | null;
      role?: string; // Admin or Staff roles
      takenTest?: boolean; // For Staff only
      testsTaken?: string[];
    } & DefaultSession["user"]; // Include default user properties
  }

  interface User extends DefaultUser {
    id: string; // Add user ID
    role?: string; // Optional role property
    takenTest?: boolean; // Add testsTaken flag for staff users
    testsTaken?: string[];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // Add user ID for JWT token
    role?: string; // Optional role
    takenTest?: boolean; // For staff users
  }
}
