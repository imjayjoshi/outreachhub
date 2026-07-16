// One-shot manual trigger script.
// Run with: pnpm leads:trigger
// Enqueues an immediate job without waiting for the cron.

import { triggerNow } from "./scheduler.js";
import dotenv from "dotenv";

dotenv.config();

(async () => {
  console.log("[trigger] Enqueuing lead fetch job manually...");
  try {
    const jobId = await triggerNow();
    console.log(`[trigger] Job enqueued successfully — id=${jobId}`);
    console.log("[trigger] Check the worker terminal for progress logs.");
    process.exit(0);
  } catch (err) {
    console.error("[trigger] Failed to enqueue job:", err);
    process.exit(1);
  }
})();
