import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const subscription = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", endDate: { gt: new Date() } },
      include: { plan: true },
      orderBy: { createdAt: "desc" },
    });

    return success(subscription || null, subscription ? undefined : "Aucun abonnement actif");
  } catch (e) {
    return handleError(e);
  }
}
