import { NextRequest, NextResponse } from "next/server";
import { sendReminderEmail } from "@/app/actions/sendReminderEmail";

export async function POST(req: NextRequest) {
  try {
    const { email, staffId } = await req.json();

    // Call the Server Action inside the API route
    await sendReminderEmail(email, staffId);

    return NextResponse.json({ message: "Reminder processed successfully" });
  } catch (error) {
    console.error("❌ Error processing webhook:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
