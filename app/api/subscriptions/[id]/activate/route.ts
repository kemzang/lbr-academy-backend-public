import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireAuth(req);
    const { id } = await params;

    const subscription = await prisma.userSubscription.update({
      where: { id: parseInt(id) },
      data: { status: "ACTIVE" },
      include: { plan: true },
    });

    return success(subscription, "Abonnement activé");
  } catch (e) {
    return handleError(e);
  }
}
