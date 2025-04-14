"use server";

import prisma from "@/lib/prisma";

export const updateUserTestTaken = async (id: string) => {
  try {
    const updatedUser = await prisma.user.update({
      where: { id },
      data: {
        testTaken: true,
        updatedAt: new Date(), // optional, Prisma updates this automatically if set to @updatedAt
      },
    });

    return { success: true, user: updatedUser };
  } catch (error) {
    console.error("❌ Error updating User testTaken:", error);
    return { success: false, error: "Failed to update testTaken flag." };
  }
};
