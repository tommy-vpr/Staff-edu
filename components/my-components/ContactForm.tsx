"use client";

import React from "react";
import { useForm, useFormState } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { ContactFormValues, ContactSchema } from "@/lib/schemas";
import SubmitButton from "./SubmitButton"; // Reusable SubmitButton component
import { sendContactEmail } from "@/app/actions/email"; // Adjust path as needed

export default function ContactForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { errors },
    reset,
  } = useForm<ContactFormValues>({
    resolver: zodResolver(ContactSchema),
  });

  const { isSubmitting } = useFormState({
    control,
  });

  const onSubmit = async (data: ContactFormValues) => {
    try {
      // Clear previous errors
      setError("root", { type: "manual", message: "" });

      // Validate input using Zod schema
      const validateInput = ContactSchema.safeParse(data);
      if (!validateInput.success) {
        const zodErrors = validateInput.error.flatten();
        for (const field of Object.keys(zodErrors.fieldErrors) as Array<
          keyof ContactFormValues
        >) {
          setError(field, {
            type: "manual",
            message: zodErrors.fieldErrors[field]?.[0] || "Invalid input",
          });
        }
        return;
      }

      // Call sendContactEmail action
      const emailResponse = await sendContactEmail(validateInput.data);

      if (emailResponse?.error) {
        setError("root", {
          type: "manual",
          message: emailResponse.error,
        });
        return;
      }

      // Success toast notification
      toast.success("Thanks for the message! We will be in touch soon.");
      reset();
    } catch (err: unknown) {
      console.error("Unexpected error:", err);
      setError("root", {
        type: "manual",
        message: "An unexpected error occurred. Please try again later.",
      });
    }
  };

  return (
    <div className="w-full max-w-[500px] p-6 sm:p-8 space-y-6 rounded-lg mx-auto mt-8">
      <h1 className="text-2xl lg:text-3xl font-bold text-center uppercase">
        Contact Us
      </h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label htmlFor="name" className="block text-sm font-medium">
            Name
          </label>
          <input
            id="name"
            type="text"
            {...register("name")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.name && (
            <p className="text-red-400 text-sm">{errors.name.message}</p>
          )}
        </div>

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
          <label htmlFor="subject" className="block text-sm font-medium">
            Subject
          </label>
          <input
            id="subject"
            type="text"
            {...register("subject")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
          />
          {errors.subject && (
            <p className="text-red-400 text-sm">{errors.subject.message}</p>
          )}
        </div>

        <div>
          <label htmlFor="message" className="block text-sm font-medium">
            Message
          </label>
          <textarea
            id="message"
            {...register("message")}
            className="w-full px-4 py-2 mt-1 border rounded-md"
            rows={4}
          />
          {errors.message && (
            <p className="text-red-400 text-sm">{errors.message.message}</p>
          )}
        </div>

        {errors.root && (
          <p className="text-red-400 text-sm text-center">
            {errors.root.message}
          </p>
        )}

        <SubmitButton isSubmitting={isSubmitting} />
      </form>
    </div>
  );
}
