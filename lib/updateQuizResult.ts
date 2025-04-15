import prisma from "@/lib/prisma"; // ✅ Correct import

export async function updateQuizResult(id: string, email: string) {
  try {
    // ✅ Check if the record exists before updating
    const existingRecord = await prisma.questionnaire.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return { success: false, error: "Quiz result not found" };
    }

    // ✅ Avoid unnecessary update if email is the same
    if (existingRecord.email === email) {
      return { success: true, data: existingRecord };
    }

    // ✅ Update email
    const updatedResult = await prisma.questionnaire.update({
      where: { id },
      data: { email },
    });

    return { success: true, data: updatedResult };
  } catch (error) {
    return { success: false, error: "Failed to update quiz result" };
  }
}
