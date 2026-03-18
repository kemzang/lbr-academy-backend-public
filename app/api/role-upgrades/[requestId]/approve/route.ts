import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const admin = await requireRole(req, ["ADMIN"]);
    const { requestId } = await params;
    const notes = req.nextUrl.searchParams.get("notes");

    const request = await prisma.roleUpgradeRequest.findUnique({ where: { id: parseInt(requestId) } });
    if (!request) return error("Demande introuvable", 404);

    const updated = await prisma.roleUpgradeRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "APPROVED", reviewedById: admin.id, adminNotes: notes, reviewedAt: new Date() },
    });

    // Mettre à jour le rôle de l'utilisateur
    await prisma.user.update({ where: { id: request.userId }, data: { role: request.requestedRole } });

    return success(updated, "Demande approuvée");
  } catch (e) {
    return handleError(e);
  }
}
