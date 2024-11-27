"use server";

import { EmailTemplate } from "@/components/my-components/WelcomeEmail";
import { CouponEmailTemplate } from "@/components/my-components/CouponEmail";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { StaffFormValues } from "@/lib/schemas";
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendEmail = async (staff: StaffFormValues) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return { error: "Email service is not configured." };
  }

  const { email, firstName, lastName } = staff;

  try {
    if (!email) {
      return {
        error: "Missing required fields: email, first name, or last name.",
      };
    }

    const message = `Thanks for signing up to the LITTO Staff EDU`;

    const data = await resend.emails.send({
      from: "Acme <onboarding@resend.dev>", // Replace with your verified domain
      //   to: [email as string],
      to: email,
      subject: `Welcome to the LITTO family, ${staff.firstName}!`,
      replyTo: "tommylitto@gmail.com",
      react: CouponEmailTemplate({
        firstName,
      }),
    });

    return { success: true };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error sending email:", error);
    return { error: errorMessage };
  }
};
