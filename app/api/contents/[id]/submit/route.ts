import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const { id } = await params;
    const contentId = parseInt(id);

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return error("Contenu introuvable", 404);
    if (content.authorId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: { status: "PENDING_REVIEW" },
    });

    return success(updated, "Contenu soumis pour validation");
  } catch (e) {
    return handleError(e);
  }
}
