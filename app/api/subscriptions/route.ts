import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { planId, paymentMethod } = await req.json();

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan || !plan.active) return error("Plan introuvable ou inactif", 404);

    const now = new Date();
    const endDate = new Date(now.getTime() + plan.durationDays * 86400000);

    const subscription = await prisma.userSubscription.create({
      data: { userId: user.id, planId, startDate: now, endDate },
      include: { plan: true },
    });

    return success(subscription, "Abonnement créé", 201);
  } catch (e) {
    return handleError(e);
  }
}
