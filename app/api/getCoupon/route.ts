import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { staffId } = await req.json();

    if (!staffId) {
      return NextResponse.json(
        { success: false, error: "Staff ID is required" },
        { status: 400 }
      );
    }

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

    if (!staff.coupon) {
      return NextResponse.json(
        { success: false, error: "No coupon associated with this staff" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, code: staff.coupon.code });
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    );
  }
}
