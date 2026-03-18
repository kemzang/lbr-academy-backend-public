import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { contentId } = await params;
    const featured = req.nextUrl.searchParams.get("featured");

    const existing = await prisma.content.findUnique({ where: { id: parseInt(contentId) } });
    if (!existing) return error("Contenu introuvable", 404);

    const newStatus = featured !== null ? featured === "true" : !existing.isFeatured;
    const content = await prisma.content.update({
      where: { id: parseInt(contentId) },
      data: { isFeatured: newStatus },
    });

    return success(content, newStatus ? "Contenu mis en avant" : "Contenu retiré de la mise en avant");
  } catch (e) {
    return handleError(e);
  }
}
