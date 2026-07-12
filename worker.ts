// Standalone worker entry point.
// Run with: pnpm worker
// This process must stay alive — it hosts the BullMQ worker + cron scheduler.
// Do NOT run this inside Next.js.

import "./src/modules/leads/jobs/dailyFetchJob";
import { startScheduler } from "./src/modules/leads/jobs/scheduler";
import dotenv from "dotenv";

dotenv.config();

console.log("=".repeat(60));
console.log("[worker] OutreachHub Lead Pipeline Worker started");
console.log(`[worker] PID: ${process.pid}`);
console.log(`[worker] Time: ${new Date().toISOString()}`);
console.log("=".repeat(60));

startScheduler();

// Keep the process alive
process.on("SIGINT", async () => {
  console.log("\n[worker] Received SIGINT — shutting down gracefully...");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  console.log("\n[worker] Received SIGTERM — shutting down gracefully...");
  process.exit(0);
});
