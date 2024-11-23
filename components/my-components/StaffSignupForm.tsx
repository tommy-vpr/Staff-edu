"use client";

import React from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { STATES } from "@/lib/staticData";
import { StaffFormValues, StaffSchema } from "@/lib/schemas";
import SubmitButton from "./SubmitButton";
import Link from "next/link";

export default function StaffForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<StaffFormValues>({
    resolver: zodResolver(StaffSchema),
  });

  // Pass control to useFormState to access isSubmitting
  const { isSubmitting } = useFormState({ control });

  const onSubmit = async (data: StaffFormValues) => {};

  return (
    <div className="w-full max-w-[500px] p-4 sm:p-8 space-y-6 rounded-lg mx-auto">
      <h1 className="text-2xl font-bold text-center uppercase">
        Staff Edu Signup
      </h1>

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
            <p className="text-red-500 text-sm">{errors.email.message}</p>
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
            <p className="text-red-500 text-sm">{errors.firstName.message}</p>
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
            <p className="text-red-500 text-sm">{errors.lastName.message}</p>
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
            <p className="text-red-500 text-sm">{errors.state.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium">
            Invitation Code
          </label>
          <input
            id="inviteCode"
            type="text"
            {...register("inviteCode")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.inviteCode && (
            <p className="text-red-500 text-sm">{errors.inviteCode.message}</p>
          )}
        </div>

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
      <div className="text-center">
        Have an account?{" "}
        <Link href="/login" className="underline underline-offset-2">
          Login
        </Link>
      </div>
    </div>
  );
}
