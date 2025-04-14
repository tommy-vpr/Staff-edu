"use client";

import { sendCoupon } from "@/app/actions/email";
import {
  generateDiscountCode,
  updateStaffTestsTaken,
} from "@/app/actions/shopify";
import { useCustomSession } from "@/lib/SessionContext";
import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import EmailButton from "./EmailButton";
import { updateUserTestTaken } from "@/app/actions/updateUserTestTaken";
import { useRouter } from "next/navigation";

type Props = {
  quiz: string;
};

const GenerateCodeSendEmail = ({ quiz }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const { pending } = useFormStatus();
  const router = useRouter();

  const { session, updateSession } = useCustomSession();
  const userId = session?.user?.id;
  const firstName = session?.user?.firstName || "there";
  const sessionEmail = session?.user?.email;

  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (formData: FormData) => {
    const email = formData.get("email") as string;

    if (!email || !isValidEmail(email)) {
      setMessage("Please enter a valid email address.");
      return;
    }

    setIsSending(true);
    setMessage("");

    try {
      const shopify = await generateDiscountCode();

      if (!shopify || !shopify.code) {
        throw new Error("Failed to generate discount code.");
      }

      const couponCode = shopify.code;
      const res = await sendCoupon({ email, firstName, couponCode });
      if (res.success) {
        setMessage("✅ Coupon sent successfully! Please check your inbox.");

        if (!sessionEmail) {
          throw new Error("Session email is missing.");
        }

        // Update `testsTaken` field in the `Staff` model
        await updateUserTestTaken(userId!);

        // Trigger a session refresh using `updateSession`
        await updateSession();
      } else {
        setMessage("Failed to send the coupon. Please try again.");
        console.error("Error sending email:", res.error);
      }
    } catch (error) {
      setMessage("Failed to send the coupon. Please try again.");
      console.error("Error sending email:", error);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col justify-center">
      <div className="w-full max-w-md rounded-lg shadow-md">
        <h1 className="text-2xl font-bold mb-4">
          Send coupon code to my email.
        </h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2 rounded"
          />
          <EmailButton />
        </form>
        {message && (
          <p
            className={`mt-4 text-center ${
              message.includes("✅") ? "text-green-500" : "text-red-500"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default GenerateCodeSendEmail;
