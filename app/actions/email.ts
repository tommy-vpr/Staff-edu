"use server";

import CouponEmailTemplate from "@/components/my-components/CouponEmail";
import WelcomeEmailTemplate from "@/components/my-components/WelcomeEmail";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { UserSchema, UserFormValues } from "@/lib/schemas";
import { Resend } from "resend";
import { generateDiscountCode } from "./shopify";
import ContactEmailTemplate from "@/components/my-components/ContactEmail";
import QuestionnaireEmailTemplate from "@/components/my-components/QuestionnaireEmailTemplate";

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

type QuestionnaireProps = {
  email: string;
  couponCode: string;
  results: { question: string; answer: string }[]; // Array of question-answer objects
  products: { url: string; image: string; title: string }[];
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

  const capitalize = (str: string) =>
    str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();

  try {
    if (!email || !firstName) {
      return {
        error: "Missing required fields: email or first name.",
      };
    }

    const data = await resend.emails.send({
      from: "LITTO <noreply@cedu.itslitto.com>",
      to: email,
      subject: `Thank you for taking the quiz, ${capitalize(firstName)}!`,
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

// Send questionnaire email
export const sendQuestionnaireCoupon = async ({
  email,
  couponCode,
  results,
  products,
}: QuestionnaireProps) => {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return { error: "Email service is not configured." };
  }

  try {
    if (!email || !couponCode) {
      return {
        error: "Missing required fields: email or first name.",
      };
    }

    const data = await resend.emails.send({
      from: "LITTO <noreply@cedu.itslitto.com>",
      to: email,
      subject: `Thank you for taking the quiz!`,
      replyTo: "support@cedu.itslitto.com",
      react: QuestionnaireEmailTemplate({
        email,
        couponCode,
        products,
      }),
    });

    return { success: true, data };
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error sending email:", error);
    return { error: errorMessage };
  }
};
