"use server";

import CouponEmailTemplate from "@/components/my-components/CouponEmail";
import WelcomeEmailTemplate from "@/components/my-components/WelcomeEmail";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { StaffFormValues } from "@/lib/schemas";
import { Resend } from "resend";
import { generateDiscountCode } from "./shopify";

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
      from: "LITTO <noreply@cedu.itslitto.com>",
      to: email,
      subject: `Welcome to the LITTO family, ${staff.firstName}!`,
      replyTo: "support@cedu.itslitto.com",
      react: WelcomeEmailTemplate({
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

type Props = {
  firstName: string;
  email: string;
  couponCode: string;
};

export const sendCoupon = async ({ email, firstName, couponCode }: Props) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return { error: "Email service is not configured." };
  }

  try {
    if (!email || !firstName) {
      return {
        error: "Missing required fields: email or first name.",
      };
    }

    const data = await resend.emails.send({
      from: "LITTO <noreply@cedu.itslitto.com>",
      to: email,
      subject: `Thank you for taking the quiz, ${firstName}!`,
      replyTo: "support@cedu.itslitto.com",
      react: CouponEmailTemplate({
        firstName,
        couponCode,
      }),
    });

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error sending email:", error);
    return { error: errorMessage };
  }
};
