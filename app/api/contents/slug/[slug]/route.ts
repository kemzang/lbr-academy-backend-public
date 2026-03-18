import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const content = await prisma.content.findFirst({
      where: { slug },
      include: {
        author: { select: { id: true, username: true, fullName: true, profilePicture: true } },
        category: { select: { id: true, name: true, slug: true } },
        chapters: { orderBy: { orderIndex: "asc" } },
        modules: { include: { lessons: { orderBy: { orderIndex: "asc" } } }, orderBy: { orderIndex: "asc" } },
      },
    });
    if (!content) return error("Contenu introuvable", 404);
    return success(content);
  } catch (e) {
    return handleError(e);
  }
}
