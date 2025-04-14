// app/unsubscribe/page.tsx
import { UnsubscribeForm } from "@/components/my-components/UnsubscribeForm";
import { prisma } from "@/lib/prisma"; // Adjust this based on your Prisma setup
import { revalidatePath } from "next/cache";

export default function UnsubscribePage() {
  async function unsubscribe(email: string) {
    "use server";
    if (!email) {
      throw new Error("Email is required.");
    }

    try {
      await prisma.user.update({
        where: { email },
        data: { role: "unsubscribe" },
      });

      // Optionally, trigger a revalidation of a path or data cache
      revalidatePath("/unsubscribe");
    } catch (error) {
      console.error("Unsubscribe error:", error);
      throw new Error("Failed to unsubscribe. Please try again later.");
    }
  }

  return <UnsubscribeForm unsubscribe={unsubscribe} />;
}
