import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;

    const sub = await prisma.userSubscription.findUnique({ where: { id: parseInt(id) } });
    if (!sub) return error("Abonnement introuvable", 404);
    if (sub.userId !== user.id) return error("Accès refusé", 403);

    const updated = await prisma.userSubscription.update({
      where: { id: parseInt(id) },
      data: { status: "CANCELLED", cancelledAt: new Date() },
      include: { plan: true },
    });

    return success(updated, "Abonnement annulé");
  } catch (e) {
    return handleError(e);
  }
}
