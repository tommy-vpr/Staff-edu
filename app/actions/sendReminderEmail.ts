"use server";

import { Resend } from "resend";
import { prisma } from "@/lib/prisma"; // Prisma DB instance
import ReminderEmailTemplate from "@/components/my-components/ReminderEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendReminderEmail(email: string, userId: string) {
  // Check if the staff has already completed the quiz
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    console.error("❌ user not found");
    return;
  }

  // If quiz is already completed, do not send email
  if (user.testTaken) {
    console.log("✅ Quiz already completed. No reminder needed.");
    return;
  }

  // Send reminder email
  await resend.emails.send({
    from: "LITTO HEMP <noreply@hemp.itslitto.com>",
    to: email,
    subject: "Reminder: Complete Your LITTO Hemp Quiz",
    react: ReminderEmailTemplate({
      firstName: user.firstName,
    }),
  });
}
