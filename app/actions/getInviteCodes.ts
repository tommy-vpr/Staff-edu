"use server";

import prisma from "@/lib/prisma";

export async function getInviteCodes(
  page: number,
  size: number,
  status?: boolean,
  emailFilter?: string,
  codeFilter?: string
) {
  const where: any = {};

  if (typeof status === "boolean") {
    where.used = status;
  }

  if (emailFilter) {
    where.usedBy = {
      email: {
        contains: emailFilter,
        mode: "insensitive",
      },
    };
  }

  if (codeFilter) {
    where.code = {
      contains: codeFilter,
      mode: "insensitive",
    };
  }

  const [data, total] = await Promise.all([
    prisma.inviteCode.findMany({
      skip: page * size,
      take: size,
      orderBy: [{ createdAt: "asc" }, { id: "asc" }],
      where,
      include: {
        usedBy: true, // needed to access email
      },
    }),
    prisma.inviteCode.count({ where }),
  ]);

  // flatten usedBy.email into the main object for easy access in the table
  const flatData = data.map((code) => ({
    ...code,
    email: code.usedBy?.email || "",
  }));

  return { data: flatData, total };
}
