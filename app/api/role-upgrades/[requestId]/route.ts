import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { requestId } = await params;

    const request = await prisma.roleUpgradeRequest.findUnique({ where: { id: parseInt(requestId) } });
    if (!request) return error("Demande introuvable", 404);
    if (request.userId !== user.id) return error("Accès refusé", 403);
    if (request.status !== "PENDING") return error("Seules les demandes en attente peuvent être annulées", 400);

    await prisma.roleUpgradeRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "CANCELLED" },
    });

    return success(undefined, "Demande annulée");
  } catch (e) {
    return handleError(e);
  }
}
