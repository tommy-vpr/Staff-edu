// "use server";

// import { StaffSchema, StaffFormValues } from "@/lib/schemas";
// import prisma from "@/lib/prisma";
// import bcrypt from "bcryptjs";
// import { getErrorMessage } from "@/lib/utils";
// import { scheduleReminder } from "@/lib/scheduleReminder";
// import { checkRateLimit } from "@/lib/rateLimit";
// import { subscribeToKlaviyo } from "@/lib/subscribeToKlaviyo";

// export const registerStaff = async (newStaff: StaffFormValues, ip: string) => {
//   try {
//     // ✅ Rate limit
//     await checkRateLimit(ip, "signup");

//     const validateInput = StaffSchema.safeParse(newStaff);
//     if (!validateInput.success) {
//       const errorMessage = validateInput.error.issues
//         .map((issue) => `${issue.path[0]}: ${issue.message}`)
//         .join(". ");
//       return { error: errorMessage };
//     }

//     const { email, inviteCode, firstName, lastName, state } =
//       validateInput.data;

//     const existingStaff = await prisma.staff.findUnique({ where: { email } });
//     if (existingStaff)
//       return { error: "A staff member with this email already exists." };

//     const validateCode = await prisma.generatedCodes.findFirst({
//       where: { code: inviteCode, status: false },
//     });
//     if (!validateCode)
//       return {
//         error: "Invalid invite code or the code has already been used.",
//       };

//     const hashedPassword = await bcrypt.hash(inviteCode, 10);

//     const newStaffEntry = await prisma.staff.create({
//       data: {
//         email,
//         firstName,
//         lastName,
//         state,
//         password: hashedPassword,
//         createdAt: new Date(),
//         updatedAt: null,
//       },
//     });

//     await prisma.generatedCodes.update({
//       where: { code: validateCode.code },
//       data: { status: true, email },
//     });

//     // ✅ Don't block user — run in background
//     scheduleReminder(email, newStaffEntry.id).catch((err) =>
//       console.error("Reminder error:", err)
//     );

//     // ✅ Subscribe to Klaviyo (non-blocking)
//     subscribeToKlaviyo(newStaffEntry.email).catch((err) =>
//       console.error("Klaviyo error:", getErrorMessage(err))
//     );

//     return { success: true };
//   } catch (error) {
//     const errorMessage = getErrorMessage(error);
//     console.error("Unexpected error during registerStaff:", errorMessage);
//     return { error: errorMessage };
//   }
// };
