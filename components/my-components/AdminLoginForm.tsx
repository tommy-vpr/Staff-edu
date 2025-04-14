// src/app/auth/signin/page.tsx
"use client";

import React, { useState, useEffect } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import SubmitButton from "@/components/my-components/SubmitButton";
import { Lock } from "lucide-react";
import { AdminLoginSchema, AdminLoginValues } from "@/lib/schemas";
import toast from "react-hot-toast";

const AdminLoginForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [blocked, setBlocked] = useState(false);
  const [retryAfter, setRetryAfter] = useState(0);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<AdminLoginValues>({
    resolver: zodResolver(AdminLoginSchema),
  });

  useEffect(() => {
    if (blocked && retryAfter > 0) {
      const interval = setInterval(() => {
        setRetryAfter((prev) => {
          if (prev <= 1) {
            setBlocked(false); // ✅ Auto-unblock when timer hits 0
            setError(null); // ✅ Clear error message
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [blocked, retryAfter]);

  const onSubmit = async (data: AdminLoginValues) => {
    setError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: data.email,
      password: data.password,
    });

    if (result?.error) {
      const errorMessage = result.error;

      if (errorMessage.includes("Too many login attempts")) {
        const match = errorMessage.match(/\d+/); // Extract retry time in seconds
        const retryTime = match ? parseInt(match[0], 10) : 60;
        setBlocked(true);
        setRetryAfter(retryTime);
      }

      setError(result.error);
    } else {
      toast.success("Welcome!");
      router.push("/dashboard"); // Redirect on successful sign-in
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="text-2xl font-semibold flex items-center justify-center gap-2 w-full uppercase">
        <Lock />
        Admin Login
      </h3>
      <p className="mb-8 text-center text-sm text-green-400">
        * For admin use only{" "}
      </p>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block font-medium">Email</label>
          <input
            type="email"
            {...register("email")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.email && (
            <p className="text-red-400">{errors.email.message}</p>
          )}
        </div>

        <div>
          <label className="block font-medium">Password</label>
          <input
            type="password"
            {...register("password")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.password && (
            <p className="text-red-400">{errors.password.message}</p>
          )}
        </div>

        {blocked && retryAfter > 0 && (
          <p className="text-red-400 text-center text-sm">
            Too many login attempts. Try again in {retryAfter} seconds.
          </p>
        )}

        {!blocked && error && <p className="text-red-400 text-sm">{error}</p>}

        <SubmitButton
          isSubmitting={isSubmitting || blocked}
          disabled={blocked}
        />
      </form>
    </div>
  );
};

export default AdminLoginForm;
