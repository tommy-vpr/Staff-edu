"use client";

import React from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AdminSchema, type AdminFormValues } from "@/lib/schemas";
import { registerUser } from "@/app/actions/admin";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import SubmitButton from "@/components/my-components/SubmitButton";
import Link from "next/link";
import { User } from "lucide-react";

export default function AdminRegisterForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
    reset,
    control,
  } = useForm<AdminFormValues>({
    resolver: zodResolver(AdminSchema),
  });

  const { isSubmitting } = useFormState({ control });

  const onSubmit = async (data: AdminFormValues) => {
    console.log("Submit clicked with:", data);
    try {
      // ✅ Fetch external IP
      const res = await fetch("https://api64.ipify.org?format=json");
      const ipData = await res.json();
      const userIp = ipData.ip || "unknown";

      const response = await registerUser({ ...data, role: "admin" });

      if (response?.zodErrors) {
        const fieldErrors = response.zodErrors;
        Object.entries(fieldErrors).forEach(([field, message]) => {
          setError(field as keyof AdminFormValues, {
            type: "manual",
            message: Array.isArray(message)
              ? message[0]
              : message || "Invalid input",
          });
        });
        return;
      }

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      const signInResponse = await signIn("credentials", {
        redirect: false,
        email: data.email,
        password: data.password,
      });

      reset();

      if (signInResponse?.error) {
        toast.error("Sign-in failed. Please try logging in.");
      } else {
        toast.success("Welcome Admin!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Registration error:", error);
      toast.error("Unexpected error. Please try again.");
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[500px] p-4 space-y-6 rounded-lg mx-auto border">
        <h1 className="text-2xl font-bold text-center uppercase flex items-center justify-center gap-2">
          <User size={24} /> Admin Register
        </h1>

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
            <label className="block font-medium">First Name</label>
            <input
              type="text"
              {...register("firstName")}
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.firstName && (
              <p className="text-red-400">{errors.firstName.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Last Name</label>
            <input
              type="text"
              {...register("lastName")}
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.lastName && (
              <p className="text-red-400">{errors.lastName.message}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              {...register("password")}
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {/* Hidden State field */}
            <input type="hidden" value="California" {...register("state")} />

            {/* Hidden Invite Code field */}
            <input
              type="hidden"
              value="ADMIN-CODE-123"
              {...register("inviteCode")}
            />
            {errors.password && (
              <p className="text-red-400">{errors.password.message}</p>
            )}
          </div>

          <SubmitButton isSubmitting={isSubmitting} />
        </form>

        <div className="text-center">
          Have an account?{" "}
          <Link href="/admin-login" className="underline underline-offset-2">
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}
