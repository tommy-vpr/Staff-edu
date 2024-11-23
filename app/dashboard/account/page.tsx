"use client";

import SubmitButton from "@/components/my-components/SubmitButton";
import { User, User2 } from "lucide-react";
import { useSession } from "next-auth/react";
import React, { useState } from "react";
import toast from "react-hot-toast";
import { z } from "zod";

const PasswordSchema = z.object({
  password: z.string().min(1, "Enter your current password"),
  newPassword: z.string().min(8, "New password must be at least 8 characters"),
});

const page = () => {
  const { data: session } = useSession();
  const [formData, setFormData] = useState({ password: "", newPassword: "" });
  const [errors, setErrors] = useState({
    password: "",
    newPassword: "",
    form: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false); // State to track submission
  const [successMessage, setSuccessMessage] = useState("");

  const initials = session?.user.name
    ?.split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form data
    const validation = PasswordSchema.safeParse(formData);
    if (!validation.success) {
      const fieldErrors = validation.error.flatten().fieldErrors;
      setErrors({
        password: fieldErrors.password?.[0] || "",
        newPassword: fieldErrors.newPassword?.[0] || "",
        form: "",
      });
      return;
    }

    setIsSubmitting(true); // Start submitting

    try {
      const response = await fetch("/api/updatePassword", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...validation.data,
          email: session?.user?.email,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.message || "Failed to update password");

      setFormData({ password: "", newPassword: "" });
      toast.success("Password updated successfully!");
      setErrors({ password: "", newPassword: "", form: "" });
    } catch (error) {
      setErrors({ ...errors, form: (error as Error).message });
    } finally {
      setIsSubmitting(false); // Stop submitting
    }
  };

  return (
    <div>
      <div className="p-8 flex flex-col max-w-[400px] m-auto bg-gray-100 dark:bg-[#101010] border border-gray-200 dark:border-[#222] rounded-lg">
        <div className="flex flex-col gap-4 p-8 items-center justify-center mb-8">
          <div className="rounded-full w-32 h-32 bg-gray-300 dark:bg-gray-800 uppercase text-4xl flex justify-center items-center font-bold">
            {initials}
          </div>
          <div className="flex flex-col items-center gap-2">
            <span className="w-[70px] text-center bg-green-100 text-green-800 text-xs font-medium py-0.5 rounded dark:bg-gray-700 dark:text-green-400 border border-green-400 inline-block">
              Admin
            </span>
            <h3 className="text-2xl capitalize">{session?.user.name}</h3>
          </div>
        </div>
        <>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                Current Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md"
              />
              {errors.password && (
                <p className="text-red-500 text-sm">{errors.password}</p>
              )}
            </div>

            <div>
              <label className="block font-medium text-gray-700 dark:text-gray-300">
                New Password
              </label>
              <input
                type="password"
                name="newPassword"
                value={formData.newPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 mt-1 border rounded-md"
              />
              {errors.newPassword && (
                <p className="text-red-500 text-sm">{errors.newPassword}</p>
              )}
            </div>

            {errors.form && (
              <p className="text-red-500 text-sm">{errors.form}</p>
            )}
            {successMessage && (
              <p className="text-green-500 text-sm">{successMessage}</p>
            )}

            <SubmitButton isSubmitting={isSubmitting} />
            {/* <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-2 rounded-md ${
                isSubmitting
                  ? "bg-gray-400 text-gray-700"
                  : "bg-blue-600 text-white"
              }`}
            >
              {isSubmitting ? "Updating..." : "Update Password"}
            </button> */}
          </form>
        </>
      </div>
    </div>
  );
};

export default page;
