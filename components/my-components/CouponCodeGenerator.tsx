// "use client";

// import React, { useState } from "react";
// import { Button } from "../ui/button";
// import shopify from "@/assets/images/Shopify_logo.webp";
// import Image from "next/image";
// import { generateDiscountCode } from "@/app/actions/admin";

// const CouponCodeGenerator = () => {
//   const [discountCode, setDiscountCode] = useState<string | null>(null);
//   const [error, setError] = useState<string | null>(null);
//   const [loading, setLoading] = useState<boolean>(false);

//   const handleGenerateCode = async () => {
//     setLoading(true);
//     setError(null);

//     try {
//       const response = await generateDiscountCode();

//       if (response.success) {
//         setDiscountCode(response.code || null); // Explicitly handle `undefined`
//       } else {
//         setError(response.error || "An unknown error occurred.");
//       }
//     } catch (err) {
//       setError((err as Error).message);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleClearCode = () => {
//     setDiscountCode(null); // Clear the discount code
//     setError(null); // Clear any error messages
//   };

//   return (
//     <div className="mt-4 p-8 flex flex-col max-w-[400px] m-auto bg-gray-100 dark:bg-[#101010] border border-gray-200 dark:border-[#222] rounded-lg">
//       <Image
//         className="m-auto"
//         src={shopify}
//         width={50}
//         height={40}
//         alt="shopify logo"
//       />
//       <h3 className="text-center mb-6 text-md font-semibold">
//         Generate a one time use shopify coupon
//       </h3>

//       <button
//         onClick={handleGenerateCode}
//         disabled={loading}
//         className="bg-blue-500 text-white px-4 py-2 rounded"
//       >
//         {loading ? "Generating..." : "Generate 30% Off Code"}
//       </button>
//       {error && <div className="text-red-500 mt-2">{error}</div>}
//       {discountCode && (
//         <div className="text-green-500 mt-2">
//           Your discount code: <strong>{discountCode}</strong>
//         </div>
//       )}

//       {discountCode && (
//         <button
//           onClick={handleClearCode}
//           className="bg-red-400 text-white px-4 py-2 rounded mt-4"
//         >
//           Clear
//         </button>
//       )}
//     </div>
//   );
// };

// export default CouponCodeGenerator;
