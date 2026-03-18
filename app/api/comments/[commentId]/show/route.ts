import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { commentId } = await params;
    await prisma.comment.update({ where: { id: parseInt(commentId) }, data: { isHidden: false } });
    return success(undefined, "Commentaire affiché");
  } catch (e) {
    return handleError(e);
  }
}
