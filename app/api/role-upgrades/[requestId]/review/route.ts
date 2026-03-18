import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ requestId: string }> }) {
  try {
    const admin = await requireRole(req, ["ADMIN"]);
    const { requestId } = await params;

    const updated = await prisma.roleUpgradeRequest.update({
      where: { id: parseInt(requestId) },
      data: { status: "UNDER_REVIEW", reviewedById: admin.id },
    });

    return success(updated, "Demande marquée en revue");
  } catch (e) {
    return handleError(e);
  }
}
