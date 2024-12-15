import { PrismaClient } from "@prisma/client";

export const prismaClient = new PrismaClient()
// this is not best we should introduce singleton here