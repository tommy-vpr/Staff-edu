import { z } from "zod";

const BaseSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(2),
  lastName: z.string().min(2),
});

export const AdminSchema = BaseSchema.extend({
  password: z.string().min(6),
  inviteCode: z.string().min(2),
  state: z.string().min(2),
  role: z.enum(["admin", "user"]).optional(),
});

export const UserSchema = BaseSchema.extend({
  inviteCode: z.string().min(2),
  state: z.string().min(2),
  password: z.string().min(6),
});

export type AdminFormValues = z.infer<typeof AdminSchema>;
export type UserFormValues = z.infer<typeof UserSchema>;

// Staff login schema for validation
export const UserLoginSchema = z.object({
  inviteCode: z.string().min(1, "Code is required"),
});

export type UserLoginValues = z.infer<typeof UserLoginSchema>;

// Admin login schema for validation
export const AdminLoginSchema = z.object({
  email: z.string().min(1, "Email is required").email("Invalid email"),
  password: z.string().min(1, "Password is required"),
});

export type AdminLoginValues = z.infer<typeof AdminLoginSchema>;

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

// // Satff schema for validation
// export const StaffSchema = z.object({
//   email: z.string().email("Invalid email address"),
//   firstName: z.string().min(1, "First name is required"),
//   lastName: z.string().min(1, "Last name is required"),
//   state: z.string().min(1, "Please select a state"), // Ensures a state is selected
//   inviteCode: z.string().min(1, "Invitation code is required"),
// });

// export type StaffFormValues = z.infer<typeof StaffSchema>;

// // Staff login schema for validation
// export const StaffLoginSchema = z.object({
//   email: z.string().min(1, "Email is required").email("Invalid email"),
//   inviteCode: z.string().min(1, "Code is required"),
// });

// export type StaffLoginValues = z.infer<typeof StaffLoginSchema>;
