import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { contentId } = await params;
    await prisma.content.delete({ where: { id: parseInt(contentId) } });
    return success(undefined, "Contenu supprimé");
  } catch (e) {
    return handleError(e);
  }
}
