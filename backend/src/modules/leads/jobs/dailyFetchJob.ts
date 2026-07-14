// NOTE: This file uses Node.js APIs (BullMQ Worker) and MUST run in the standalone
// worker process (pnpm worker), NOT inside Next.js serverless functions.

import { Worker, Queue } from "bullmq";
import { PrismaClient } from "@prisma/client";
import { searchCompanies } from "../discovery/searchService";
import { scrapeClutch } from "../discovery/clutchService";
import { scrapeGoodFirms } from "../discovery/goodfirmsService";
import { mergeSources, type RawLead } from "../discovery/mergeService";
import { findEmailOnWebsite } from "../discovery/emailCrawlerService";
import dotenv from "dotenv";

dotenv.config();

// Standalone Prisma client for the worker process
const prisma = new PrismaClient();

export const leadFetchQueue = new Queue("daily-lead-fetch", {
  connection: { url: process.env.REDIS_URL! },
});

export const dailyFetchWorker = new Worker(
  "daily-lead-fetch",
  async (job) => {
    console.log(
      `[dailyFetchJob] Starting job ${job.id} at ${new Date().toISOString()}`,
    );

    const targets = await prisma.dailyFetchTarget.findMany();
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
        const exists = await prisma.lead.findUnique({
          where: { website: lead.website },
          select: { id: true },
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
          await prisma.lead.create({
            data: {
              userId: systemUserId,
              name: lead.name,
              website: lead.website,
              city: target.city,
              state: target.state,
              industry: "IT",
              email,
              source: lead.source,
              status: email ? "new" : "email_not_found",
            },
          });
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
      await prisma.dailyFetchLog.create({
        data: {
          city: target.city,
          found: merged.length,
          duplicates,
          inserted,
          emailsFound,
          status: "success",
        },
      });

      console.log(
        `[dailyFetchJob] ${target.city} done — found=${merged.length} inserted=${inserted} duplicates=${duplicates} emails=${emailsFound}`,
      );
    }

    console.log(`[dailyFetchJob] Job ${job.id} completed.`);
    await prisma.$disconnect();
  },
  {
    connection: { url: process.env.REDIS_URL! },
    concurrency: 1,
  },
);

dailyFetchWorker.on("completed", (job) => {
  console.log(`[dailyFetchJob] ✓ Job ${job.id} completed successfully`);
});

dailyFetchWorker.on("failed", (job, err) => {
  console.error(`[dailyFetchJob] ✗ Job ${job?.id} failed:`, err.message);
});
