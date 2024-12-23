"use client";

import { sendCoupon } from "@/app/actions/email";
import {
  generateDiscountCode,
  updateStaffTestsTaken,
} from "@/app/actions/shopify";
import { useCustomSession } from "@/lib/SessionContext";
import { getSession } from "next-auth/react";
import React, { useState } from "react";

type Props = {
  quiz: string;
};

const GenerateCodeSendEmail = ({ quiz }: Props) => {
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);

  const { session, updateSession } = useCustomSession();
  const { firstName = "there" } = session?.user || {};
  // const couponCode = "SPECIAL2024";

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

        // Update `testsTaken` field in the `Staff` model
        await updateStaffTestsTaken(email, quiz);

        // Trigger a session refresh using `updateSession`
        await updateSession();
      } else {
        setMessage("Failed to send the coupon. Please try again.");
        console.error("Error sending email:", res.error);
      }

      // await updateStaffTestsTaken(email, quiz);

      // // Trigger a session refresh using `updateSession`
      // await updateSession();
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
          Send Coupon Code to my email.
        </h1>
        <form action={handleSubmit} className="flex flex-col gap-4">
          <input
            type="email"
            name="email"
            placeholder="Email"
            className="border p-2 rounded"
          />
          <button
            type="submit"
            disabled={isSending}
            className={`bg-green-400 font-semibold text-green-800 px-4 py-2 rounded ${
              isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500"
            }`}
          >
            {isSending ? (
              <>
                <svg
                  className="animate-spin h-5 w-5 mr-3"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                  ></path>
                </svg>
                Sending...
              </>
            ) : (
              "Send"
            )}
          </button>
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
