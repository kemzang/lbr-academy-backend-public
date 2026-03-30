import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser, requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";
import { uploadFile } from "@/lib/cloudinary";

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
    const user = await requireAuth(req);
    const { id } = await params;
    const contentId = parseInt(id);

    const existing = await prisma.content.findUnique({ where: { id: contentId } });
    if (!existing) return error("Contenu introuvable", 404);
    if (existing.authorId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    const contentType = req.headers.get("content-type") || "";
    let data: any = {};
    let coverFile: File | null = null;
    let contentFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      if (formData.has("title")) data.title = formData.get("title");
      if (formData.has("description")) data.description = formData.get("description");
      if (formData.has("summary")) data.summary = formData.get("summary");
      if (formData.has("type")) data.type = formData.get("type");
      if (formData.has("isFree")) data.isFree = formData.get("isFree") === "true" || formData.get("isFree") === "1";
      if (formData.has("price")) data.price = parseFloat(formData.get("price") as string);
      if (formData.has("categoryId")) data.categoryId = parseInt(formData.get("categoryId") as string);
      if (formData.has("language")) data.language = formData.get("language");
      if (formData.has("pageCount")) data.pageCount = parseInt(formData.get("pageCount") as string);
      if (formData.has("duration")) data.duration = parseInt(formData.get("duration") as string);
      if (formData.has("tags")) data.tags = formData.get("tags");
      coverFile = formData.get("coverImage") as File | null;
      contentFile = formData.get("file") as File | null;
    } else {
      const body = await req.json();
      data = {
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
      };
    }

    if (coverFile && coverFile.size > 0) {
      const result = await uploadFile(coverFile, "covers");
      data.coverImage = result.url;
    }
    if (contentFile && contentFile.size > 0) {
      const result = await uploadFile(contentFile, "contents");
      data.fileUrl = result.url;
    }

    const updated = await prisma.content.update({
      where: { id: contentId },
      data,
      include: includes,
    });

    return success(updated, "Contenu mis à jour");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
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
