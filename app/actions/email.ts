"use server";

import CouponEmailTemplate from "@/components/my-components/CouponEmail";
import WelcomeEmailTemplate from "@/components/my-components/WelcomeEmail";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { UserSchema, UserFormValues } from "@/lib/schemas";
import { Resend } from "resend";
import { generateDiscountCode } from "./shopify";
import ContactEmailTemplate from "@/components/my-components/ContactEmail";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendContactEmailProps = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

type Props = {
  firstName: string;
  email: string;
  couponCode: string;
};

export const sendEmail = async (staff: UserFormValues) => {
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
      from: "LITTO HEMP <noreply@hemp.itslitto.com>",
      to: email,
      subject: `Welcome to the LITTO family, ${staff.firstName}!`,
      replyTo: "support@hemp.itslitto.com",
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
      from: "LITTO HEMP <noreply@hemp.itslitto.com>",
      to: email,
      subject: `Thank you for taking the quiz, ${firstName}!`,
      replyTo: "support@hemp.itslitto.com",
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

export const sendContactEmail = async ({
  name,
  email,
  subject,
  message,
}: SendContactEmailProps) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return { error: "Email service is not configured." };
  }

  try {
    if (!name || !email || !subject || !message) {
      return {
        error: "Missing required fields: name, email, subject, or message.",
      };
    }

    UserSchema.parse({ name, email, subject, message });

    // Send the email using Resend
    const data = await resend.emails.send({
      from: "LITTO Support <noreply@hemp.itslitto.com>", // Adjust sender info
      to: "tommy@cultivatedagency.com", // support@hemp.itslitto.com
      subject: `${subject} - From ${name}`,
      replyTo: email,
      react: ContactEmailTemplate({
        name,
        subject,
        message,
      }),
    });

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error sending email:", error);
    return { error: errorMessage };
  }
};
