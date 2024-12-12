import { generateDiscountCode } from "@/app/actions/admin";
import { getErrorMessage } from "@/lib/getErrorMessage";
import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { authOptions } from "@/lib/authOptions";
import { getServerSession } from "next-auth/next";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session || !session.user.id) {
    return NextResponse.json(
      { success: false, error: "Not authenticated" },
      { status: 401 }
    );
  }

  try {
    const body: { staffId: string } = await req.json();
    const { staffId } = body;

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required" },
        { status: 400 }
      );
    }

    // Generate a new discount code
    const response = await generateDiscountCode();

    if (!response.success || !response.code) {
      return NextResponse.json(
        { success: false, error: "Failed to generate discount code" },
        { status: 500 }
      );
    }

    const newCode = response.code;

    // Find the staff and include their coupon
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: { coupon: true },
    });

    if (!staff) {
      return NextResponse.json(
        { success: false, error: "Staff not found" },
        { status: 404 }
      );
    }

    // Update or create the ShopifyCoupon
    if (staff.couponId) {
      // Update existing coupon
      await prisma.shopifyCoupon.update({
        where: { id: staff.couponId },
        data: { code: newCode, updatedAt: new Date() },
      });
    } else {
      // Create a new coupon and associate it with the staff
      const newCoupon = await prisma.shopifyCoupon.create({
        data: {
          code: newCode,
          staff: { connect: { id: staffId } },
        },
      });

      // Update the staff with the new coupon ID
      await prisma.staff.update({
        where: { id: staffId },
        data: { couponId: newCoupon.id },
      });
    }

    // Update the staff's takenTest field
    await prisma.staff.update({
      where: { id: staffId },
      data: {
        takenTest: true,
        updatedAt: new Date(),
      },
    });

    // Fetch the updated session
    const updatedSession = await getServerSession(authOptions);

    return NextResponse.json({
      success: true,
      code: newCode,
      session: updatedSession, // Return the updated session
    });
  } catch (err) {
    console.error("Error updating ShopifyCoupon and Staff:", err);
    return NextResponse.json(
      {
        success: false,
        error: getErrorMessage(err) || "An internal server error occurred",
      },
      { status: 500 }
    );
  }
}
