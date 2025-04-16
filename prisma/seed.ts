// prisma/seed.ts
import { google } from "googleapis";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import readline from "readline";
import open from "open";

dotenv.config();

const prisma = new PrismaClient();

const SCOPES = ["https://www.googleapis.com/auth/spreadsheets"];
const TOKEN_PATH = "token.json";

// Set up OAuth2 client
const oAuth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

// 🔐 Authenticate and cache token
function authenticate(): Promise<void> {
  return new Promise((resolve, reject) => {
    fs.readFile(TOKEN_PATH, async (err, token) => {
      if (err) {
        const authUrl = oAuth2Client.generateAuthUrl({
          access_type: "offline",
          scope: SCOPES,
        });

        console.log("Authorize this app by visiting this url:\n", authUrl);
        await open(authUrl);

        const rl = readline.createInterface({
          input: process.stdin,
          output: process.stdout,
        });

        rl.question("\nEnter the code from that page: ", async (code) => {
          rl.close();
          const { tokens } = await oAuth2Client.getToken(code);
          oAuth2Client.setCredentials(tokens);
          fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens));
          console.log("Token stored to", TOKEN_PATH);
          resolve();
        });
      } else {
        oAuth2Client.setCredentials(JSON.parse(token.toString()));
        resolve();
      }
    });
  });
}

// 🎟️ Generate random invite codes
function generateCodes(amount: number, length: number): string[] {
  return Array.from({ length: amount }, () =>
    [...Array(length)]
      .map(() => Math.floor(Math.random() * 36).toString(36))
      .join("")
      .toUpperCase()
  );
}

// 📤 Save to Google Sheet
async function writeToSheet(codes: string[]) {
  const sheets = google.sheets({ version: "v4", auth: oAuth2Client });

  const values = codes.map((code) => [code]);

  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEET_ID!,
    range: "Sheet1!A1",
    valueInputOption: "RAW",
    requestBody: { values },
  });

  console.log("✅ Codes written to Google Sheet.");
}

async function saveToMongoDB(codes: string[]) {
  try {
    // Check which codes already exist
    const existing = await prisma.inviteCode.findMany({
      where: { code: { in: codes } },
      select: { code: true },
    });

    const existingCodes = new Set(existing.map((c) => c.code));

    const newCodes = codes
      .filter((code) => !existingCodes.has(code))
      .map((code) => ({
        code,
        used: false,
        usedById: null,
      }));

    await prisma.inviteCode.createMany({
      data: newCodes,
    });

    console.log(`✅ Saved ${newCodes.length} new codes to MongoDB!`);
  } catch (err) {
    console.error("❌ Error saving to MongoDB:", err);
  } finally {
    await prisma.$disconnect();
  }
}

// 🚀 Run seeding
(async () => {
  await authenticate();
  const codes = generateCodes(5000, 8);
  await saveToMongoDB(codes);
  await writeToSheet(codes);
})();
