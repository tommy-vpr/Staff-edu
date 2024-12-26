"use client";

import Image from "next/image";
import { useState } from "react";
import littoLogo from "@/assets/images/litto-logo-blk.webp";

export const UnsubscribeForm = ({
  unsubscribe,
}: {
  unsubscribe: (email: string) => Promise<void>;
}) => {
  const [email, setEmail] = useState<string | null>("");
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!email) {
      setMessage("Please provide a valid email.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      await unsubscribe(email);
      setMessage("You have been unsubscribed successfully.");
    } catch (error: any) {
      setMessage(error.message || "An error occurred. Please try again later.");
    } finally {
      setEmail("");
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md bg-white rounded-lg shadow-md p-6">
        <Image
          src={littoLogo}
          height={50}
          width={100}
          alt="litto"
          className="m-auto mb-4"
        />
        <form onSubmit={handleSubmit} className="space-y-4">
          <p className="text-gray-600 text-sm text-center">
            Enter your email address to unsubscribe:
          </p>
          <input
            type="email"
            placeholder="Your email address"
            value={email || ""}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-black"
          />
          <button
            type="submit"
            disabled={loading}
            className={`w-full px-4 py-2 text-white font-semibold rounded-md transition-all ${
              loading
                ? "bg-[#333] cursor-not-allowed"
                : "bg-[#101010] hover:bg-[#333]"
            }`}
          >
            {loading ? "Unsubscribing..." : "Unsubscribe"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 text-center text-sm ${
              message.includes("successfully")
                ? "text-green-600"
                : "text-blue-600"
            }`}
          >
            {message}
          </p>
        )}
      </div>
    </div>
  );
};
