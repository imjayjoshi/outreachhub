// node-cron scheduler — fires the daily lead fetch job via BullMQ.
// Runs in the standalone worker process (pnpm worker).
//
// CURRENT SCHEDULE: 19:15 IST (13:45 UTC) — set for live testing.
// Change to "0 8 * * *" for the production 8 AM schedule.

import cron from "node-cron";
import { leadFetchQueue } from "./dailyFetchJob.js";

// 7:15 PM IST = 13:45 UTC
// cron format: minute hour day month weekday
const SCHEDULE = "15 19 * * *"; // IST local time (server must be in IST or adjust)

export function startScheduler() {
  console.log(`[scheduler] Starting cron: "${SCHEDULE}" (7:15 PM IST)`);

  cron.schedule(
    SCHEDULE,
    async () => {
      console.log(
        `[scheduler] Cron fired at ${new Date().toISOString()} — enqueuing daily-lead-fetch job`,
      );
      try {
        const job = await leadFetchQueue.add(
          "fetch",
          { triggeredBy: "cron", triggeredAt: new Date().toISOString() },
          { removeOnComplete: 50, removeOnFail: 20 },
        );
        console.log(`[scheduler] Job enqueued: id=${job.id}`);
      } catch (err) {
        console.error("[scheduler] Failed to enqueue job:", err);
      }
    },
    {
      timezone: "Asia/Kolkata", // explicit IST timezone
    },
  );

  console.log("[scheduler] Cron active — waiting for 7:15 PM IST...");
}

export async function triggerNow(): Promise<string> {
  console.log("[scheduler] Manual trigger — enqueuing job now...");
  const job = await leadFetchQueue.add(
    "fetch",
    { triggeredBy: "manual", triggeredAt: new Date().toISOString() },
    { removeOnComplete: 50, removeOnFail: 20 },
  );
  console.log(`[scheduler] Manual job enqueued: id=${job.id}`);
  return job.id!;
}
