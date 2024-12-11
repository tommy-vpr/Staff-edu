import { prisma } from "@/lib/prisma";
import { getErrorMessage } from "./getErrorMessage";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export const getUserCoupon = async (staffId: string) => {
  const { data: session } = useSession();
  const router = useRouter();

  if (!session?.user) {
    router.push("/login");
  }

  try {
    const staff = await prisma.staff.findUnique({
      where: { id: staffId },
      include: {
        coupon: true, // Include the related ShopifyCoupon
      },
    });

    if (!staff) {
      throw new Error("Staff not found");
    }

    if (!staff.coupon) {
      throw new Error("No coupon associated with this staff");
    }

    return {
      success: true,
      code: staff.coupon.code, // Return the coupon code
    };
  } catch (error) {
    console.error("Error fetching user coupon:", error);
    return {
      success: false,
      error: getErrorMessage(error) || "An internal server error occurred",
    };
  }
};
