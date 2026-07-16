import "reflect-metadata";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { AppDataSource } from "./dataSource.js";
import { User } from "./entities/user.entity.js";
import { DailyFetchTarget } from "./entities/daily-fetch-target.entity.js";

dotenv.config();

async function main() {
  const { nanoid } = await import("nanoid");
  console.log("[seed] Connecting to database...");
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const targetRepo = AppDataSource.getRepository(DailyFetchTarget);

  // 1. Seed or update test user
  const email = "test@outreachhub.dev";
  let user = await userRepo.findOneBy({ email });
  const passwordHash = await bcrypt.hash("password123", 10);

  if (!user) {
    user = userRepo.create({
      id: nanoid(),
      email,
      name: "Test User",
      passwordHash,
    });
    await userRepo.save(user);
    console.log(`[seed] Created test user: ${email}`);
  } else {
    user.passwordHash = passwordHash;
    await userRepo.save(user);
    console.log(`[seed] Updated test user password: ${email}`);
  }

  // 2. Seed DailyFetchTarget cities
  const targets = [
    { city: "Ahmedabad", state: "Gujarat", target: 20 },
    { city: "Pune", state: "Maharashtra", target: 20 },
    { city: "Bangalore", state: "Karnataka", target: 30 },
    { city: "Hyderabad", state: "Telangana", target: 30 },
  ];

  for (const t of targets) {
    const existing = await targetRepo.findOneBy({ city: t.city });
    if (!existing) {
      const newTarget = targetRepo.create({
        id: nanoid(),
        city: t.city,
        state: t.state,
        target: t.target,
      });
      await targetRepo.save(newTarget);
      console.log(`[seed] Seeded target: ${t.city} (${t.target})`);
    } else {
      console.log(`[seed] Target already exists for city: ${t.city}`);
    }
  }

  console.log("[seed] Database seeded successfully.");
}

main()
  .catch((e) => {
    console.error("[seed] Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    if (AppDataSource.isInitialized) {
      await AppDataSource.destroy();
    }
  });
