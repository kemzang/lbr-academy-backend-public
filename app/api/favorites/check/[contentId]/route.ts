import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { contentId } = await params;
    const fav = await prisma.favorite.findUnique({
      where: { userId_contentId: { userId: user.id, contentId: parseInt(contentId) } },
    });
    return success({ isFavorite: !!fav });
  } catch (e) {
    return handleError(e);
  }
}
