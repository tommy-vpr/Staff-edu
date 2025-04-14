import NextAuth from "next-auth";
import { authOptions } from "@/lib/authOptions"; // Assuming you have this in your lib folder

// Create NextAuth handler
const handler = NextAuth(authOptions);

// Export the handler for both GET and POST methods
export { handler as GET, handler as POST };