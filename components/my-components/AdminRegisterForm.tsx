"use client";

import React, { useRef, useState } from "react";
import { registerUser } from "@/app/actions/admin";
import SubmitButton from "./SubmitButton";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { UserSchema } from "@/lib/schemas";
import Image from "next/image";
import { User } from "lucide-react";

const AdminRegisterForm = () => {
  const ref = useRef<HTMLFormElement>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const router = useRouter();

  const clientAction = async (event: React.FormEvent) => {
    event.preventDefault(); // Prevent form from submitting the default way
    console.log("✅ Form submitted");
    setIsSubmitting(true);

    const formData = new FormData(ref.current!);
    const data = Object.fromEntries(formData.entries());

    try {
      const newAdmin = {
        email: data.email as string,
        firstName: data.firstName as string,
        lastName: data.lastName as string,
        password: data.password as string,
        code: data.code as string,
      };

      const validateInput = UserSchema.safeParse(newAdmin);

      if (!validateInput.success) {
        const fieldErrors = validateInput.error.issues.reduce((acc, issue) => {
          acc[issue.path[0]] = issue.message;
          return acc;
        }, {} as { [key: string]: string });

        setErrors(fieldErrors);
        return;
      }

      const response = await registerUser(validateInput.data);

      if (response?.error) {
        toast.error(response.error);
        return;
      }

      const signInResponse = await signIn("credentials", {
        redirect: false,
        email: validateInput.data.email,
        password: validateInput.data.password,
      });

      ref.current?.reset();

      if (signInResponse?.error) {
        toast.error("Sign-in failed. Please try logging in.");
      } else {
        toast.success("Welcome!");
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("An error occurred:", error);
      toast.error("An unexpected error occurred. Please try again later.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative w-full h-screen flex items-center justify-center">
      <div className="w-full max-w-[500px] p-4 space-y-6 rounded-lg mx-auto border">
        <h1 className="text-2xl font-bold text-center uppercase flex items-center justify-center gap-2">
          <User size={24} /> Admin Register
        </h1>
        <form onSubmit={clientAction} className="space-y-4" ref={ref}>
          <div>
            <label className="block font-medium">Email</label>
            <input
              type="email"
              name="email"
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.email && <p className="text-red-400">{errors.email}</p>}
          </div>

          <div>
            <label className="block font-medium">First name</label>
            <input
              type="text"
              name="firstName"
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.firstName && (
              <p className="text-red-400">{errors.firstName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Last name</label>
            <input
              type="text"
              name="lastName"
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.lastName && (
              <p className="text-red-400">{errors.lastName}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Password</label>
            <input
              type="password"
              name="password"
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.password && (
              <p className="text-red-400">{errors.password}</p>
            )}
          </div>

          <div>
            <label className="block font-medium">Admin Code</label>
            <input
              type="text"
              name="code"
              className="w-full px-4 py-2 mt-1 border rounded-md"
            />
            {errors.code && <p className="text-red-400">{errors.code}</p>}
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
    </div>
  );
};

export default AdminRegisterForm;
