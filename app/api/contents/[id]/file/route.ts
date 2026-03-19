import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";
import { uploadFile } from "@/lib/cloudinary";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const { id } = await params;
    const contentId = parseInt(id);

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return error("Contenu introuvable", 404);
    if (content.authorId !== user.id && user.role !== "ADMIN") return error("Accès refusé", 403);

    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("Fichier requis", 400);

    const { url } = await uploadFile(file, "contents");

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: { fileUrl: url },
      include: {
        author: { select: { id: true, username: true, fullName: true, profilePicture: true } },
        category: { select: { id: true, name: true, slug: true } },
      },
    });

    return success(updated, "Fichier uploadé");
  } catch (e) {
    return handleError(e);
  }
}
