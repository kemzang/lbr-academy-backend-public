import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const favorites = await prisma.favorite.findMany({
      where: { userId: user.id, collection: { not: null } },
      select: { collection: true },
      distinct: ["collection"],
    });
    return success(favorites.map((f) => f.collection).filter(Boolean));
  } catch (e) {
    return handleError(e);
  }
}
