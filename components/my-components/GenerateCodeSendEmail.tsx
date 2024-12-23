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
            className={`bg-green-400 font-semibold text-green-800 px-4 py-2 rounded flex justify-center items-center gap-1 ${
              isSending ? "opacity-50 cursor-not-allowed" : "hover:bg-green-500"
            }`}
          >
            {isSending ? (
              <>
                <svg
                  aria-hidden="true"
                  className="w-6 h-6 text-gray-200 animate-spin dark:text-green-600 fill-green-800"
                  viewBox="0 0 100 101"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                  />
                  <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="currentFill"
                  />
                </svg>
                <span className="">Sending...</span>
              </>
            ) : (
              "Send Coupon"
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
