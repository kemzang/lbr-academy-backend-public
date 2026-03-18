import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { userId } = await params;
    await prisma.user.update({ where: { id: parseInt(userId) }, data: { enabled: false } });
    return success(undefined, "Utilisateur suspendu");
  } catch (e) {
    return handleError(e);
  }
}
