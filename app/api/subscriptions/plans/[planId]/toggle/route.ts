import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { planId } = await params;
    const active = req.nextUrl.searchParams.get("active");

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: parseInt(planId) } });
    if (!plan) return error("Plan introuvable", 404);

    const newStatus = active !== null ? active === "true" : !plan.active;
    const updated = await prisma.subscriptionPlan.update({ where: { id: parseInt(planId) }, data: { active: newStatus } });

    return success(updated, newStatus ? "Plan activé" : "Plan désactivé");
  } catch (e) {
    return handleError(e);
  }
}
