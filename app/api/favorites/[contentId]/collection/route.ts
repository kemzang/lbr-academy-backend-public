import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { contentId } = await params;
    const collection = req.nextUrl.searchParams.get("collection");

    await prisma.favorite.update({
      where: { userId_contentId: { userId: user.id, contentId: parseInt(contentId) } },
      data: { collection },
    });

    return success(undefined, "Collection mise à jour");
  } catch (e) {
    return handleError(e);
  }
}
