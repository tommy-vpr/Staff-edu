import { getServerSession } from "next-auth"; // Use getServerSession if using next-auth in app directory
import { hash, compare } from "bcryptjs";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { password, newPassword } = await req.json();
  const email = session.user?.email;

  if (!email || typeof email !== "string") {
    return NextResponse.json(
      { message: "Invalid email address" },
      { status: 400 }
    );
  }

  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    const isPasswordValid = await compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { message: "Current password is incorrect" },
        { status: 403 }
      );
    }

    const hashedPassword = await hash(newPassword, 12);

    await prisma.user.update({
      where: { email },
      data: { password: hashedPassword },
    });

    return NextResponse.json(
      { message: "Password updated successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating password:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
