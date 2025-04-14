// lib/prisma.ts
import { PrismaClient } from "@prisma/client";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// 👇 Custom type: InviteCode + related usedBy user
export type InviteCodeWithUser = {
  id: string;
  code: string;
  used: boolean;
  usedById: string | null;
  createdAt: Date;
  usedBy?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    // add more fields if needed
  } | null;
};

// 👇 Flattened version with email
export type FlatInviteCode = InviteCodeWithUser & {
  email: string;
};

export default prisma;
