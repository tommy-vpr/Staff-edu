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
