import { z } from "zod";

// User schema for validation
export const UserSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  password: z.string().min(1, "Password is required"),
  code: z.string().min(1, "Signup code is required"),
});

export type UserFormValues = z.infer<typeof UserSchema>;

// Satff schema for validation
export const StaffSchema = z.object({
  email: z.string().email("Invalid email address"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  state: z.string().min(1, "Please select a state"), // Ensures a state is selected
  inviteCode: z.string().min(1, "Invitation code is required"),
});

export type StaffFormValues = z.infer<typeof StaffSchema>;

// Contact form schema for validation
export const ContactSchema = z.object({
  name: z
    .string()
    .min(2, { message: "Name must be at least 2 characters long." }),
  email: z.string().email({ message: "Invalid email address." }),
  subject: z
    .string()
    .min(3, { message: "Subject must be at least 3 characters long." }),
  message: z
    .string()
    .min(10, { message: "Message must be at least 10 characters long." }),
});

export type ContactFormValues = z.infer<typeof ContactSchema>;

// Admin login schema for validation
export const AdminLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginValues = z.infer<typeof AdminLoginSchema>;

// Staff login schema for validation
export const StaffLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  inviteCode: z.string().min(1, "Code is required"),
});

export type StaffLoginValues = z.infer<typeof StaffLoginSchema>;
