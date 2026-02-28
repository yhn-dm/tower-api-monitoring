/**
 * Prisma client singleton; loads DATABASE_URL from prisma/.env when used from apps.
 */
import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
import path from "path";

dotenv.config({
  path: path.resolve(__dirname, "../../..", "prisma/.env"),
});

export const prisma = new PrismaClient();