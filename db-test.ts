import { prisma } from "./lib/db/prisma.ts";

async function main() {
  try {
    const userCount = await prisma.user.count();
    console.log("Success! Connected to DB. Number of users:", userCount);
  } catch (error) {
    console.error("Failed to execute Prisma query:", error);
  }
}

main();
