import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";

dotenv.config();

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const passwordHash = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@outreachhub.dev" },
    update: {},
    create: {
      email: "test@outreachhub.dev",
      name: "Test User",
      passwordHash,
    },
  });
  console.log(
    "Database seeded successfully with test user: test@outreachhub.dev",
  );

  // Seed DailyFetchTarget cities
  await prisma.dailyFetchTarget.createMany({
    data: [
      { city: "Ahmedabad", state: "Gujarat", target: 20 },
      { city: "Pune", state: "Maharashtra", target: 20 },
      { city: "Bangalore", state: "Karnataka", target: 30 },
      { city: "Hyderabad", state: "Telangana", target: 30 },
    ],
    skipDuplicates: true,
  });
  console.log(
    "Seeded DailyFetchTarget: Ahmedabad(20), Pune(20), Bangalore(30), Hyderabad(30)",
  );
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
