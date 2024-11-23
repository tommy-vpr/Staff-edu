// next-auth.d.ts
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      id: string; // Ensure id is added to the user object in the session
      email?: string | null;
      name?: string | null;
      role?: string;
    } & DefaultSession["user"]; // Include other default properties like email and name
  }

  interface User {
    id: string; // Add id to the User type
    role?: string; // Add optional role property
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id: string; // Add id to JWT for use in token
    role?: string; // Add role to JWT if needed in token handling
  }
}
