import NextAuth, { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string; // Unique user ID
      email?: string | null;
      firstName?: string;
      role?: string; // Admin or Staff roles
      takenTest?: boolean; // For Staff only
      testsTaken?: string[]; // Array of completed tests
      authJWT?: string; // ✅ Custom token for authentication
    } & DefaultSession["user"]; // Include default user properties
  }

  interface User extends DefaultUser {
    id: string; // Add user ID
    role?: string; // Optional role property
    firstName?: string;
    takenTest?: boolean; // Add takenTest flag for staff users
    testsTaken?: string[]; // Add completed tests for staff users
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    id: string; // Add user ID for JWT token
    role?: string; // Optional role
    takenTest?: boolean; // For staff users
    testsTaken?: string[]; // Add completed tests to JWT payload
    authJWT?: string; // ✅ Custom token for authentication
  }
}
