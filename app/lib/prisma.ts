import dotenv from "dotenv";
dotenv.config();
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

const connectionString =
  process.env.APP_DATABASE_URL ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error(
    "Missing application database URL. Set APP_DATABASE_URL (preferred) or POSTGRES_URL."
  );
}

const adapter = new PrismaPg({ connectionString });


export const prisma = new PrismaClient({ adapter });
