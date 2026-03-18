import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { commentId } = await params;
    const cId = parseInt(commentId);

    const existing = await prisma.like.findUnique({ where: { userId_commentId: { userId: user.id, commentId: cId } } });
    if (existing) return error("Déjà liké", 409);

    await prisma.like.create({ data: { userId: user.id, commentId: cId } });
    await prisma.comment.update({ where: { id: cId }, data: { likesCount: { increment: 1 } } });

    return success(undefined, "Like ajouté");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ commentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { commentId } = await params;
    const cId = parseInt(commentId);

    const existing = await prisma.like.findUnique({ where: { userId_commentId: { userId: user.id, commentId: cId } } });
    if (!existing) return error("Like introuvable", 404);

    await prisma.like.delete({ where: { id: existing.id } });
    await prisma.comment.update({ where: { id: cId }, data: { likesCount: { decrement: 1 } } });

    return success(undefined, "Like retiré");
  } catch (e) {
    return handleError(e);
  }
}
