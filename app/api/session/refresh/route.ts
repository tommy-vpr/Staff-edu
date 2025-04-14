import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const token = await getToken({ req });

  if (!token || !token.id) {
    return new Response(JSON.stringify({ error: "Not authenticated" }), {
      status: 401,
    });
  }

  const user = await prisma.user.findUnique({
    where: { id: token.id },
  });

  if (!user) {
    return new Response(JSON.stringify({ error: "User not found" }), {
      status: 404,
    });
  }

  return new Response(
    JSON.stringify({
      user: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
        firstName: user.firstName,
        role: user.role,
        testTaken: user.testTaken,
      },
    }),
    { status: 200 }
  );
}
