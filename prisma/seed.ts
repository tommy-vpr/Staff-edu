import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

function generateCodes(count: number, length: number): string[] {
  return Array.from({ length: count }, () =>
    [...Array(length)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("")
      .toUpperCase()
  );
}

async function saveCodesToDB(codes: string[]) {
  for (const code of codes) {
    try {
      await prisma.inviteCode.create({ data: { code } });
    } catch (error: any) {
      if (error.code !== "P2002") {
        console.error(`Error creating code ${code}:`, error);
      }
    }
  }
}

async function main() {
  const codes = generateCodes(50, 8);
  await saveCodesToDB(codes);
}

main()
  .catch((err) => {
    console.error("❌ Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
