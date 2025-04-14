// // /components/LoginSwitcher.js
// "use client";

// import { useState } from "react";
// import AdminLoginForm from "@/components/my-components/AdminLoginForm";
// import StaffLoginForm from "@/components/my-components/StaffLoginForm";
// import Link from "next/link";

// export default function LoginFormSwitcher() {
//   const [isAdminLogin, setIsAdminLogin] = useState(false);

//   return (
//     <div className="flex justify-center items-center w-full h-screen">
//       <div className="w-[400px]">
//         {isAdminLogin ? <AdminLoginForm /> : <StaffLoginForm />}

//         <div className="text-sm mt-4 flex gap-4 justify-center">
//           <p>
//             <Link
//               href="/"
//               className="flex items-center gap-1 hover:underline underline-offset-4"
//             >
//               Home
//             </Link>
//           </p>
//           <span className="text-gray-500"> | </span>
//           <p
//             className="hover:underline underline-offset-4 cursor-pointer"
//             onClick={() => setIsAdminLogin(true)}
//           >
//             Admin login
//           </p>
//           <span className="text-gray-500"> | </span>
//           <p
//             className="hover:underline underline-offset-4 cursor-pointer"
//             onClick={() => setIsAdminLogin(false)}
//           >
//             Staff login
//           </p>
//         </div>
//       </div>
//     </div>
//   );
// }
