import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  try {
    const { slug } = await params;
    const category = await prisma.category.findFirst({
      where: { slug },
      include: { subcategories: true, _count: { select: { contents: true } } },
    });
    if (!category) return error("Catégorie introuvable", 404);
    return success(category);
  } catch (e) {
    return handleError(e);
  }
}
