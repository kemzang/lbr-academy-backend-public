import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const rating = parseFloat(req.nextUrl.searchParams.get("rating") || "0");
    if (rating < 0 || rating > 5) return error("Note entre 0 et 5", 400);

    const content = await prisma.content.findUnique({ where: { id: parseInt(id) } });
    if (!content) return error("Contenu introuvable", 404);

    const total = content.rating * content.ratingCount;
    const newCount = content.ratingCount + 1;
    const newRating = (total + rating) / newCount;

    await prisma.content.update({
      where: { id: content.id },
      data: { rating: newRating, ratingCount: newCount },
    });

    return success(undefined, "Note enregistrée");
  } catch (e) {
    return handleError(e);
  }
}
