import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { commentId } = await params;
    const text = req.nextUrl.searchParams.get("text") || (await req.json().catch(() => ({}))).text;

    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment) return error("Commentaire introuvable", 404);
    if (comment.userId !== user.id) return error("Accès refusé", 403);

    const updated = await prisma.comment.update({
      where: { id: parseInt(commentId) },
      data: { text, isEdited: true },
      include: { user: { select: { id: true, username: true, fullName: true, profilePicture: true } } },
    });

    return success(updated, "Commentaire modifié");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { commentId } = await params;

    const comment = await prisma.comment.findUnique({ where: { id: parseInt(commentId) } });
    if (!comment) return error("Commentaire introuvable", 404);
    if (comment.userId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    await prisma.comment.delete({ where: { id: parseInt(commentId) } });
    return success(undefined, "Commentaire supprimé");
  } catch (e) {
    return handleError(e);
  }
}
