import { PrismaClient } from "@prisma/client";

// BigInt n'est pas sérialisable en JSON par défaut — on ajoute un polyfill
// pour éviter les erreurs "Do not know how to serialize a BigInt"
(BigInt.prototype as unknown as { toJSON: () => string }).toJSON = function () {
  return Number(this).toString();
};

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
