"use client";

import React, { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import SubmitButton from "./SubmitButton";
import toast from "react-hot-toast";
import { StaffLoginValues, StaffLoginSchema } from "@/lib/schemas";
import { User } from "lucide-react";

const StaffLoginForm: React.FC = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const { data: session, status } = useSession();

  // Check if the user is authenticated and redirect if necessary
  useEffect(() => {
    if (session?.user.role !== "influencer") {
      router.push("/login");
    }
  }, [session, router]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<StaffLoginValues>({
    resolver: zodResolver(StaffLoginSchema),
  });

  const onSubmit = async (data: StaffLoginValues) => {
    setError(null);

    const result = await signIn("influencer-credentials", {
      redirect: false,
      //   email: data.email,
      //   code: data.code,
    });

    if (result?.error) {
      setError(result.error);
    } else {
      reset();
      toast.success("Welcome!");
      router.push("/dashboard"); // Redirect on successful sign-in
    }
  };

  return (
    <div className="border p-4 rounded-lg">
      <h3 className="text-2xl font-semibold flex items-center justify-center gap-2 uppercase">
        <User />
        Staff Login
      </h3>
      <p className="mb-8 text-center text-sm">
        * Must signup with invitation code first
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
          <label className="block font-medium">Invitation Code</label>
          <input
            type="text"
            {...register("inviteCode")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.inviteCode && (
            <p className="text-red-400">{errors.inviteCode.message}</p>
          )}
        </div>

        {error && <p className="text-red-400">{error}</p>}

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
};

export default StaffLoginForm;
