"use client";

import React, { useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { STATES } from "@/lib/staticData";
import { StaffFormValues, StaffSchema } from "@/lib/schemas";
import SubmitButton from "./SubmitButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFormStatus } from "react-dom";
import { registerStaff } from "@/app/actions/staff";
import toast from "react-hot-toast";
import { sendEmail } from "@/app/actions/email";

import littoLogo from "@/assets/images/litto-logo-blk.webp";
import Image from "next/image";

export default function StaffSignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
  } = useForm<StaffFormValues>({
    resolver: zodResolver(StaffSchema),
  });

  // Access specific form state
  const { isSubmitting } = useFormState({
    control, // Required to link to the current form's state
  });

  const onSubmit = async (data: StaffFormValues) => {
    try {
      // Clear previous errors
      setError("root", { type: "manual", message: "" });

      // Zod schema validation
      const validateInput = StaffSchema.safeParse(data);

      if (!validateInput.success) {
        const zodErrors = validateInput.error.flatten();
        for (const field of Object.keys(zodErrors.fieldErrors) as Array<
          keyof StaffFormValues
        >) {
          setError(field, {
            type: "manual",
            message: zodErrors.fieldErrors[field]?.[0] || "Invalid input",
          });
        }
        return;
      }

      // Call the registerStaff action
      const response = await registerStaff(validateInput.data);

      if (response?.error) {
        setError("root", {
          type: "manual",
          message: response.error,
        });
        return;
      }

      // Send the email
      const emailRes = await sendEmail(validateInput.data);

      if (emailRes?.error) {
        setError("root", {
          type: "manual",
          message: emailRes.error,
        });
        return;
      }

      // Sign in the staff
      const result = await signIn("staff-credentials", {
        redirect: false,
        email: data.email,
        code: data.inviteCode,
      });

      if (result?.error) {
        setError("root", {
          type: "manual",
          message: result.error,
        });
        return; // Stops execution if there's an error.
      } else {
        toast.success("Welcome!");
        reset();
        router.push("/dashboard");
      }
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
      setError("root", {
        type: "manual",
        message:
          "An unexpected error occurred. Please check your connection and try again.",
      });
    }
  };

  return (
    <div className="w-full max-w-[500px] p-4 sm:p-8 space-y-6 rounded-lg mx-auto">
      <h1 className="text-3xl font-bold text-center uppercase">LITTO 101</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium">
            Email
          </label>
          <input
            id="email"
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.email && (
            <p className="text-red-400 text-sm">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="firstName" className="block text-sm font-medium">
            First Name
          </label>
          <input
            id="firstName"
            type="text"
            {...register("firstName")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.firstName && (
            <p className="text-red-400 text-sm">{errors.firstName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="lastName" className="block text-sm font-medium">
            Last Name
          </label>
          <input
            id="lastName"
            type="text"
            {...register("lastName")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.lastName && (
            <p className="text-red-400 text-sm">{errors.lastName.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium">
            State
          </label>
          <select
            id="state"
            {...register("state")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          >
            <option value="" className="text-gray-300">
              Select a state
            </option>
            {STATES.map((state) => (
              <option key={state} value={state}>
                {state}
              </option>
            ))}
          </select>
          {errors.state && (
            <p className="text-red-400 text-sm">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="inviteCode" className="block text-sm font-medium">
            Invitation Code
          </label>
          <input
            id="inviteCode"
            type="text"
            {...register("inviteCode")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.inviteCode && (
            <p className="text-red-400 text-sm">{errors.inviteCode.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-red-400 text-sm text-center">
            {errors.root.message}
          </p>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
      <div className="text-center">
        Have an account?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Login
        </Link>
        <Image
          src={littoLogo}
          alt="LITTO logo"
          width={100}
          height={40}
          className="dark:invert block m-auto mt-4"
        />
      </div>
    </div>
  );
}
