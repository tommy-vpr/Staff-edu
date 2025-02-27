// import { NextResponse } from "next/server";
// import { generateDiscountCode } from "@/app/actions/QuestionnaireShopify";

// // ✅ API Endpoint to Generate a Discount Code
// export async function POST(req: Request) {
//   try {
//     const discountResponse = await generateDiscountCode();

//     return NextResponse.json(discountResponse);
//   } catch (error) {
//     return NextResponse.json(
//       { success: false, error: (error as Error).message },
//       { status: 500 }
//     );
//   }
// }
