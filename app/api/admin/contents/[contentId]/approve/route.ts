import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { contentId } = await params;

    const content = await prisma.content.update({
      where: { id: parseInt(contentId) },
      data: { status: "APPROVED", publishedAt: new Date() },
      include: { author: { select: { id: true, username: true } } },
    });

    // Créer notification pour l'auteur
    await prisma.notification.create({
      data: {
        userId: content.authorId,
        title: "Contenu approuvé",
        message: `Votre contenu "${content.title}" a été approuvé et publié.`,
        type: "CONTENT_APPROVED",
        targetType: "content",
        targetId: content.id,
      },
    });

    return success(content, "Contenu approuvé");
  } catch (e) {
    return handleError(e);
  }
}
