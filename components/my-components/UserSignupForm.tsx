"use client";

import React, { useEffect, useState } from "react";
import { signIn } from "next-auth/react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { STATES } from "@/lib/staticData";
import { UserSchema, UserFormValues } from "@/lib/schemas";
import SubmitButton from "./SubmitButton";
import Link from "next/link";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

import littoLogo from "@/assets/images/litto-logo-blk.webp";
import Image from "next/image";
import { registerUser } from "@/app/actions/user";

export default function UserSignupForm() {
  const [blocked, setBlocked] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    clearErrors,
    formState: { errors },
    reset,
  } = useForm<UserFormValues>({
    resolver: zodResolver(UserSchema),
  });

  // Access specific form state
  const { isSubmitting } = useFormState({
    control, // Required to link to the current form's state
  });

  // ✅ Countdown effect for retry timer
  useEffect(() => {
    if (blocked && retryAfter > 0) {
      const interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            setBlocked(false); // ✅ Auto-unblock
            clearErrors("root"); // ✅ Properly clear error
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [blocked, retryAfter]);

  const onSubmit = async (data: UserFormValues) => {
    try {
      // ✅ Fetch external IP
      const res = await fetch("https://api64.ipify.org?format=json");
      const ipData = await res.json();
      const userIp = ipData.ip || "unknown";

      // Clear previous errors
      clearErrors("root");

      // Zod schema validation
      const validateInput = UserSchema.safeParse(data);

      if (!validateInput.success) {
        const zodErrors = validateInput.error.flatten();
        for (const field of Object.keys(zodErrors.fieldErrors) as Array<
          keyof UserFormValues
        >) {
          setError(field, {
            type: "manual",
            message: zodErrors.fieldErrors[field]?.[0] || "Invalid input",
          });
        }
        return;
      }

      // Call the registerStaff action
      // const response = await registerStaff(validateInput.data, userIp);
      const response = await registerUser(validateInput.data, userIp);

      if (response?.error) {
        const errorMessage = response.error;

        // ✅ Handle rate limit response
        if (errorMessage.includes("Too many signup attempts")) {
          const match = errorMessage.match(/\d+/); // Extract retry time
          const retryTime = match ? parseInt(match[0], 10) : 60;
          // ✅ Only set blocked state if it's not already set
          if (!blocked) {
            setBlocked(true);
            setRetryAfter(retryTime);
          }
        }

        // ✅ Map error to the right field
        if (errorMessage.toLowerCase().includes("invite")) {
          setError("inviteCode", {
            type: "manual",
            message: errorMessage,
          });
        } else if (errorMessage.toLowerCase().includes("email")) {
          setError("email", {
            type: "manual",
            message: errorMessage,
          });
        } else {
          setError("root", {
            type: "manual",
            message: errorMessage,
          });
        }

        return;
      }

      // Sign in the staff
      const result = await signIn("code-credentials", {
        redirect: false,
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
      <h1 className="text-3xl font-bold text-center uppercase">
        LITTO Hemp Edu
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
            disabled={blocked}
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
            disabled={blocked}
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
            disabled={blocked}
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
            disabled={blocked}
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
            disabled={blocked}
          />
          <input
            type="hidden"
            value="autogen-password"
            {...register("password")}
          />

          {errors.inviteCode && (
            <p className="text-red-400 text-sm">{errors.inviteCode.message}</p>
          )}
        </div>

        {blocked && retryAfter > 0 && (
          <p className="text-red-400 text-center">
            Too many signup attempts. Try again in {retryAfter} seconds.
          </p>
        )}

        <SubmitButton
          isSubmitting={isSubmitting || blocked}
          disabled={blocked}
        />
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
