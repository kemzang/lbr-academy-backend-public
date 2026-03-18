import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const sub = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", endDate: { gt: new Date() } },
    });
    if (!sub) return error("Aucun abonnement actif à annuler", 400);

    const updated = await prisma.userSubscription.update({
      where: { id: sub.id },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { plan: true },
    });

    return success(updated, "Abonnement annulé");
  } catch (e) {
    return handleError(e);
  }
}
