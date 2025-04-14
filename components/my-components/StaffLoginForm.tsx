// "use client";

// import React, { useEffect, useState } from "react";
// import { signIn, useSession } from "next-auth/react";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useRouter } from "next/navigation";
// import SubmitButton from "./SubmitButton";
// import toast from "react-hot-toast";
// import { StaffLoginValues, StaffLoginSchema } from "@/lib/schemas";
// import { User } from "lucide-react";

// const StaffLoginForm: React.FC = () => {
//   const router = useRouter();
//   const { data: session } = useSession();
//   const [error, setError] = useState<string | null>(null);
//   const [blocked, setBlocked] = useState(false);
//   const [retryAfter, setRetryAfter] = useState(0);

//   // Redirect if already authenticated
//   useEffect(() => {
//     if (session?.user) {
//       router.push("/dashboard");
//     }
//   }, [session, router]);

//   const {
//     register,
//     handleSubmit,
//     formState: { errors, isSubmitting },
//     reset,
//   } = useForm<StaffLoginValues>({
//     resolver: zodResolver(StaffLoginSchema),
//   });

//   const onSubmit = async (data: StaffLoginValues) => {
//     try {
//       // Clear previous errors to prevent duplicates
//       setError(null);

//       const result = await signIn("staff-credentials", {
//         redirect: false,
//         email: data.email,
//         code: data.inviteCode,
//       });

//       if (result?.error) {
//         const errorMessage = result.error;

//         // ✅ Handle rate limit response
//         if (errorMessage.includes("Too many login attempts")) {
//           const match = errorMessage.match(/\d+/); // Extract retry time in seconds
//           const retryTime = match ? parseInt(match[0], 10) : 60;
//           setBlocked(true);
//           setRetryAfter(retryTime);
//         }

//         setError(errorMessage);
//       } else {
//         reset();
//         toast.success("Welcome!");
//         router.push("/dashboard");
//       }
//     } catch (err: any) {
//       setError(err.message || "An error occurred. Please try again.");
//     }
//   };

//   // ✅ Countdown timer for retry time
//   // ✅ Countdown effect for retry timer
//   useEffect(() => {
//     if (blocked && retryAfter > 0) {
//       const interval = setInterval(() => {
//         setRetryAfter((prev) => {
//           if (prev <= 1) {
//             setBlocked(false); // ✅ Auto-unblock when timer hits 0
//             setError(null); // ✅ Clear error message
//             return 0;
//           }
//           return prev - 1;
//         });
//       }, 1000);

//       return () => clearInterval(interval);
//     }
//   }, [blocked, retryAfter]);

//   return (
//     <div className="border p-4 rounded-lg">
//       <h3 className="text-2xl font-semibold flex items-center justify-center gap-2 uppercase">
//         <User />
//         Staff Login
//       </h3>
//       <p className="mb-8 text-center text-sm">
//         * Must register with invitation code first
//       </p>
//       <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
//         <div>
//           <label className="block font-medium">Email</label>
//           <input
//             type="email"
//             {...register("email")}
//             className="w-full px-4 py-2 mt-1 border rounded-md"
//             disabled={blocked}
//           />
//           {errors.email && (
//             <p className="text-red-400">{errors.email.message}</p>
//           )}
//         </div>

//         <div>
//           <label className="block font-medium">Invitation Code</label>
//           <input
//             type="text"
//             {...register("inviteCode")}
//             className="w-full px-4 py-2 mt-1 border rounded-md"
//             disabled={blocked}
//           />
//           {errors.inviteCode && (
//             <p className="text-red-400">{errors.inviteCode.message}</p>
//           )}
//         </div>

//         {blocked && retryAfter > 0 && (
//           <p className="text-red-400 text-center">
//             Too many login attempts. Try again in {retryAfter} seconds.
//           </p>
//         )}

//         {!blocked && error && <p className="text-red-400">{error}</p>}

//         <SubmitButton
//           isSubmitting={isSubmitting || blocked}
//           disabled={blocked}
//         />
//       </form>
//     </div>
//   );
// };

// export default StaffLoginForm;
