import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const admin = await requireRole(req, ["ADMIN"]);
    const { requestId } = await params;
    const reason = req.nextUrl.searchParams.get("reason");

    const request = await prisma.roleUpgradeRequest.findUnique({ where: { id: parseInt(requestId) } });
    if (!request) return error("Demande introuvable", 404);

    const updated = await prisma.roleUpgradeRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "REJECTED", reviewedById: admin.id, rejectionReason: reason, reviewedAt: new Date() },
    });

    return success(updated, "Demande rejetée");
  } catch (e) {
    return handleError(e);
  }
}
