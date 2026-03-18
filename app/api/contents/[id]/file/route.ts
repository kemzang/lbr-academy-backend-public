import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

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

    const bytes = await file.arrayBuffer();
    const ext = path.extname(file.name);
    const filename = `content_${contentId}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "files");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), Buffer.from(bytes));

    const updated = await prisma.content.update({
      where: { id: contentId },
      data: { fileUrl: `/uploads/files/${filename}` },
    });

    return success(updated, "Fichier uploadé");
  } catch (e) {
    return handleError(e);
  }
}
