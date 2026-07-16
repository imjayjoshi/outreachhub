import "reflect-metadata";
import { DataSource } from "typeorm";
import { User } from "./entities/user.entity.js";
import { Account } from "./entities/account.entity.js";
import { Session } from "./entities/session.entity.js";
import { VerificationToken } from "./entities/verification-token.entity.js";
import { Company } from "./entities/company.entity.js";
import { Contact } from "./entities/contact.entity.js";
import { Template } from "./entities/template.entity.js";
import { Campaign } from "./entities/campaign.entity.js";
import { CampaignContact } from "./entities/campaign-contact.entity.js";
import { Lead } from "./entities/lead.entity.js";
import { DailyFetchTarget } from "./entities/daily-fetch-target.entity.js";
import { DailyFetchLog } from "./entities/daily-fetch-log.entity.js";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error(
    "[dataSource] DATABASE_URL is not set. Check your .env file.",
  );
}

export const AppDataSource = new DataSource({
  type: "postgres",
  url: DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // required for Neon / hosted Postgres
  synchronize: false, // use migrations in production; flip to true for first-time local dev
  logging: false, // disable SQL logging to reduce overhead
  entities: [
    User,
    Account,
    Session,
    VerificationToken,
    Company,
    Contact,
    Template,
    Campaign,
    CampaignContact,
    Lead,
    DailyFetchTarget,
    DailyFetchLog,
  ],
  migrations: ["src/migrations/*.ts"],
  // Connection pool tuning for Neon serverless
  extra: {
    max: 5, // max pool size (Neon free tier has limited connections)
    idleTimeoutMillis: 30000, // keep idle connections alive for 30s
    connectionTimeoutMillis: 30000, // Neon cold starts can take 10-15s from distant regions
  },
});

/**
 * Initialize the data source once and reuse.
 * Retries up to 3 times with a delay to handle Neon cold starts.
 */
export async function initDataSource(): Promise<DataSource> {
  if (AppDataSource.isInitialized) return AppDataSource;

  const maxRetries = 3;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      await AppDataSource.initialize();
      console.log("[dataSource] TypeORM connected to PostgreSQL");
      return AppDataSource;
    } catch (err) {
      console.error(
        `[dataSource] Connection attempt ${attempt}/${maxRetries} failed:`,
        (err as Error).message,
      );
      if (attempt === maxRetries) throw err;
      // Wait before retrying (3s, 6s)
      const delay = attempt * 3000;
      console.log(`[dataSource] Retrying in ${delay / 1000}s...`);
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  return AppDataSource;
}
