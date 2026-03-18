import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const plans = await prisma.subscriptionPlan.findMany({ where: { active: true }, orderBy: { price: "asc" } });
    return success(plans);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const body = await req.json();

    const plan = await prisma.subscriptionPlan.create({
      data: {
        name: body.name, description: body.description, type: body.type,
        price: body.price, currency: body.currency || "XAF", durationDays: body.durationDays || body.duration || 30,
        accessPremiumContent: body.accessPremiumContent, canPublishContent: body.canPublishContent,
        canCreateFormations: body.canCreateFormations, prioritySupport: body.prioritySupport,
        maxContentDownloads: body.maxContentDownloads,
      },
    });

    return success(plan, "Plan créé", 201);
  } catch (e) {
    return handleError(e);
  }
}
