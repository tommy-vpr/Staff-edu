"use server";

import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { AdminSchema, AdminFormValues } from "@/lib/schemas";

export async function registerUser(data: AdminFormValues) {
  const parsed = AdminSchema.safeParse(data);

  if (!parsed.success) {
    console.error("❌ Zod validation failed:", parsed.error.format());

    return {
      error: "Invalid data",
      zodErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const validated = parsed.data;

  try {
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    });

    if (existingUser) {
      return { error: "An account with this email already exists." };
    }

    const hashedPassword = await bcrypt.hash(validated.password, 10);

    await prisma.user.create({
      data: {
        email: validated.email,
        firstName: validated.firstName,
        lastName: validated.lastName,
        password: hashedPassword,
        role: validated.role || "admin",
        state: validated.state || "California",
        // You can add inviteCodeId here later if needed
      },
    });

    return { success: true };
  } catch (err) {
    console.error("Register User Error:", err);
    return { error: "Registration failed. Please try again." };
  }
}
