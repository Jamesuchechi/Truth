import { PrismaClient } from "@prisma/client";
import { PrismaNeon } from "@prisma/adapter-neon";
import { neonConfig } from "@neondatabase/serverless";
import ws from "ws";

// Use WebSocket for Neon in all environments — avoids ETIMEDOUT from stale pg Pool connections
neonConfig.webSocketConstructor = ws;
neonConfig.pipelineConnect = false;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function createPrismaClient(): PrismaClient {
  // 30s connection timeout — Neon free tier can take up to ~10s to wake from suspension
  const adapter = new PrismaNeon({
    connectionString: process.env.DATABASE_URL!,
    connectionTimeoutMillis: 30_000,
    idleTimeoutMillis: 30_000,
    max: 1, // Single connection is sufficient for serverless/dev
  });

  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
