"use server";

import prisma from "@/lib/prisma";

export async function getGeneratedCodes(
  page: number,
  size: number,
  status?: boolean | null,
  emailFilter?: string
) {
  const where: any = {
    isActive: true, // ✅ this ensures only active codes are returned
  };

  if (typeof status === "boolean") {
    where.status = status;
  }

  if (emailFilter) {
    where.email = {
      contains: emailFilter,
      mode: "insensitive",
    };
  }

  const [data, total] = await Promise.all([
    prisma.generatedCodes.findMany({
      skip: page * size,
      take: size,
      orderBy: [{ createdAt: "desc" }, { id: "asc" }],
      where,
    }),
    prisma.generatedCodes.count({ where }),
  ]);

  return { data, total };
}
