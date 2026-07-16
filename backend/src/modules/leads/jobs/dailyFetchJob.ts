// NOTE: This file uses Node.js APIs (BullMQ Worker) and MUST run in the standalone
// worker process (pnpm worker), NOT inside the main Express server.

import "reflect-metadata";
import { Worker, Queue, Job } from "bullmq";
import { DataSource } from "typeorm";
import { Lead } from "@/modules/shared/database/entities/lead.entity.js";
import { DailyFetchTarget } from "@/modules/shared/database/entities/daily-fetch-target.entity.js";
import { DailyFetchLog } from "@/modules/shared/database/entities/daily-fetch-log.entity.js";
import { searchCompanies } from "../discovery/searchService.js";
import { scrapeClutch } from "../discovery/clutchService.js";
import { scrapeGoodFirms } from "../discovery/goodfirmsService.js";
import { mergeSources, type RawLead } from "../discovery/mergeService.js";
import { findEmailOnWebsite } from "../discovery/emailCrawlerService.js";
import dotenv from "dotenv";

dotenv.config();

// Standalone TypeORM DataSource for the worker process
const workerDataSource = new DataSource({
  type: "postgres",
  url: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
  synchronize: false,
  logging: false,
  entities: [Lead, DailyFetchTarget, DailyFetchLog],
});

async function getDS() {
  if (!workerDataSource.isInitialized) {
    await workerDataSource.initialize();
    console.log("[dailyFetchJob] Worker DB connected");
  }
  return workerDataSource;
}

export const leadFetchQueue = new Queue("daily-lead-fetch", {
  connection: { url: process.env.REDIS_URL! },
});

export const dailyFetchWorker = new Worker(
  "daily-lead-fetch",
  async (job: Job) => {
    const { nanoid } = await import("nanoid");
    console.log(
      `[dailyFetchJob] Starting job ${job.id} at ${new Date().toISOString()}`,
    );

    const ds = await getDS();
    const leadRepo = ds.getRepository(Lead);
    const targetRepo = ds.getRepository(DailyFetchTarget);
    const logRepo = ds.getRepository(DailyFetchLog);

    const targets = await targetRepo.find();
    const systemUserId = process.env.SYSTEM_USER_ID!;

    if (!systemUserId) {
      throw new Error(
        "SYSTEM_USER_ID is not set in .env — cannot insert leads without a user.",
      );
    }

    for (const target of targets) {
      console.log(
        `[dailyFetchJob] Processing city: ${target.city} (target: ${target.target})`,
      );

      let searchResults: RawLead[] = [];
      let clutchResults: RawLead[] = [];
      let goodfirmsResults: RawLead[] = [];

      try {
        [searchResults, clutchResults, goodfirmsResults] = await Promise.all([
          searchCompanies(target.city).then((r) =>
            r.map((x) => ({ ...x, source: "duckduckgo" })),
          ),
          scrapeClutch(target.city).then((r) =>
            r.map((x) => ({ ...x, source: "clutch" })),
          ),
          scrapeGoodFirms(target.city).then((r) =>
            r.map((x) => ({ ...x, source: "goodfirms" })),
          ),
        ]);
      } catch (err) {
        console.error(
          `[dailyFetchJob] Discovery failed for ${target.city}:`,
          err,
        );
      }

      const merged = mergeSources(
        searchResults,
        clutchResults,
        goodfirmsResults,
      );

      console.log(
        `[dailyFetchJob] ${target.city}: ${merged.length} unique candidates after merge`,
      );

      let inserted = 0;
      let duplicates = 0;
      let emailsFound = 0;

      for (const lead of merged) {
        if (inserted >= target.target) break;

        // Dedup check
        const exists = await leadRepo.findOne({
          where: { website: lead.website },
          select: ["id"],
        });

        if (exists) {
          duplicates++;
          continue;
        }

        // Crawl email
        let email: string | null = null;
        try {
          email = await findEmailOnWebsite(lead.website);
        } catch {
          email = null;
        }

        if (email) emailsFound++;

        // Insert lead
        try {
          const newLead = leadRepo.create({
            id: nanoid(),
            userId: systemUserId,
            name: lead.name,
            website: lead.website,
            city: target.city,
            state: target.state,
            industry: "IT",
            email,
            source: lead.source,
            status: email ? "new" : "email_not_found",
          });
          await leadRepo.save(newLead);
          inserted++;
          console.log(
            `[dailyFetchJob] Inserted: ${lead.name} (${lead.website}) email=${email ?? "not found"}`,
          );
        } catch (err) {
          console.warn(
            `[dailyFetchJob] Insert failed for ${lead.website}:`,
            err,
          );
        }
      }

      // Write fetch log
      const log = logRepo.create({
        id: nanoid(),
        city: target.city,
        found: merged.length,
        duplicates,
        inserted,
        emailsFound,
        status: "success",
      });
      await logRepo.save(log);

      console.log(
        `[dailyFetchJob] ${target.city} done — found=${merged.length} inserted=${inserted} duplicates=${duplicates} emails=${emailsFound}`,
      );
    }

    console.log(`[dailyFetchJob] Job ${job.id} completed.`);
    await workerDataSource.destroy();
  },
  {
    connection: { url: process.env.REDIS_URL! },
    concurrency: 1,
  },
);

dailyFetchWorker.on("completed", (job: Job) => {
  console.log(`[dailyFetchJob] ✓ Job ${job.id} completed successfully`);
});

dailyFetchWorker.on("failed", (job: Job | undefined, err: Error) => {
  console.error(`[dailyFetchJob] ✗ Job ${job?.id} failed:`, err.message);
});
