import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { planId } = await params;
    const body = await req.json();

    const plan = await prisma.subscriptionPlan.update({
      where: { id: parseInt(planId) },
      data: { name: body.name, description: body.description, price: body.price, durationDays: body.durationDays },
    });

    return success(plan, "Plan mis à jour");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ planId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { planId } = await params;
    await prisma.subscriptionPlan.delete({ where: { id: parseInt(planId) } });
    return success(undefined, "Plan supprimé");
  } catch (e) {
    return handleError(e);
  }
}
