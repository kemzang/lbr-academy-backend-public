import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

const includes = {
  author: { select: { id: true, username: true, fullName: true, profilePicture: true } },
  category: { select: { id: true, name: true, slug: true } },
  chapters: { orderBy: { orderIndex: "asc" as const } },
  modules: { include: { lessons: { orderBy: { orderIndex: "asc" as const } } }, orderBy: { orderIndex: "asc" as const } },
};

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const content = await prisma.content.findUnique({
      where: { id: parseInt(id) },
      include: includes,
    });
    if (!content) return error("Contenu introuvable", 404);

    // Incrémenter les vues
    await prisma.content.update({ where: { id: content.id }, data: { viewCount: { increment: 1 } } });

    return success(content);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const { id } = await params;
    const contentId = parseInt(id);
    const body = await req.json();

    const existing = await prisma.content.findUnique({ where: { id: contentId } });
    if (!existing) return error("Contenu introuvable", 404);
    if (existing.authorId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: {
        title: body.title,
        description: body.description,
        summary: body.summary,
        type: body.type,
        isFree: body.isFree,
        price: body.price,
        categoryId: body.categoryId,
        language: body.language,
        pageCount: body.pageCount,
        duration: body.duration,
        tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags,
      },
      include: includes,
    });

    return success(updated, "Contenu mis à jour");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const { id } = await params;
    const contentId = parseInt(id);

    const existing = await prisma.content.findUnique({ where: { id: contentId } });
    if (!existing) return error("Contenu introuvable", 404);
    if (existing.authorId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    await prisma.content.delete({ where: { id: contentId } });
    return success(undefined, "Contenu supprimé");
  } catch (e) {
    return handleError(e);
  }
}
