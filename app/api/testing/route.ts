import { NextResponse } from "next/server";
import { Resend } from "resend";
import QuestionnaireEmailTemplate from "@/components/my-components/QuestionnaireEmailTemplate";
import { getErrorMessage } from "@/lib/getErrorMessage";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY environment variable.");
    return NextResponse.json(
      { error: "Email service is not configured." },
      { status: 500 }
    );
  }

  try {
    const body = await req.json();
    const { email, couponCode, results } = body;

    if (!email || !couponCode || !Array.isArray(results)) {
      return NextResponse.json(
        { error: "Missing required fields: email, couponCode, or results." },
        { status: 400 }
      );
    }

    const data = await resend.emails.send({
      from: "LITTO <noreply@cedu.itslitto.com>",
      to: email,
      subject: `Thank you for taking LITTO questionnaire!`,
      replyTo: "support@cedu.itslitto.com",
      react: QuestionnaireEmailTemplate({ email, couponCode, results }),
    });

    return NextResponse.json({ success: true, data }, { status: 200 });
  } catch (error: unknown) {
    const errorMessage = getErrorMessage(error);
    console.error("Error sending email:", errorMessage);
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
