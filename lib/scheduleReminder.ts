import { Client } from "@upstash/qstash";

const qstash = new Client({
  token: process.env.UPSTASH_QSTASH_TOKEN!,
});

export async function scheduleReminder(email: string, staffId: string) {
  // Schedule execution of the `sendReminderEmail` server action in 5 days
  await qstash.publishJSON({
    url: `${process.env.APP_URL}/api/reminder`, // This will call the action
    body: { email, staffId },
    delay: 5 * 24 * 60 * 60,
  });

  console.log(`📩 Reminder scheduled for ${email} in 5 days.`);
}
