"use server";

import { UserSchema, UserFormValues } from "@/lib/schemas";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getErrorMessage } from "@/lib/utils";
import { scheduleReminder } from "@/lib/scheduleReminder";
import { checkRateLimit } from "@/lib/rateLimit";
import { subscribeToKlaviyo } from "@/lib/subscribeToKlaviyo";

export const registerUser = async (newUser: UserFormValues, ip: string) => {
  try {
    // ✅ Rate limit
    await checkRateLimit(ip, "signup");

    const validateInput = UserSchema.safeParse(newUser);
    if (!validateInput.success) {
      const errorMessage = validateInput.error.issues
        .map((issue) => `${issue.path[0]}: ${issue.message}`)
        .join(". ");
      return { error: errorMessage };
    }

    const {
      email,
      inviteCode,
      password, // ✅ now we're using password from the form (which is a hidden field tied to inviteCode)
      firstName,
      lastName,
      state,
    } = validateInput.data;

    const existingStaff = await prisma.user.findUnique({ where: { email } });
    if (existingStaff)
      return { error: "A user with this email already exists." };

    const validateCode = await prisma.inviteCode.findFirst({
      where: { code: inviteCode, used: false },
    });
    if (!validateCode)
      return {
        error: "Invalid invite code or the code has already been used.",
      };

    const hashedPassword = await bcrypt.hash(password, 10); // ✅ now hashes the passed-in password

    const newUserEntry = await prisma.user.create({
      data: {
        email,
        firstName,
        lastName,
        state,
        password: hashedPassword,
        role: "user",
        inviteCode: { connect: { id: validateCode.id } },
        createdAt: new Date(),
      },
    });

    await prisma.inviteCode.update({
      where: { code: validateCode.code },
      data: {
        used: true,
        usedBy: { connect: { id: newUserEntry.id } },
      },
    });

    // ✅ Don't block user — run in background
    scheduleReminder(email, newUserEntry.id).catch((err) =>
      console.error("Reminder error:", getErrorMessage(err))
    );

    // ✅ Subscribe to Klaviyo (non-blocking)
    subscribeToKlaviyo(newUserEntry.email).catch((err) =>
      console.error("Klaviyo error:", getErrorMessage(err))
    );

    return { success: true };
  } catch (error) {
    const errorMessage = getErrorMessage(error);
    console.error("Unexpected error during registerStaff:", errorMessage);
    return { error: errorMessage };
  }
};
