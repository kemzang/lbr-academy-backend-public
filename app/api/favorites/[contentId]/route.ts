import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { contentId } = await params;
    const collection = req.nextUrl.searchParams.get("collection");

    await prisma.favorite.create({
      data: { userId: user.id, contentId: parseInt(contentId), collection },
    });

    return success(undefined, "Ajouté aux favoris");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { contentId } = await params;

    await prisma.favorite.delete({
      where: { userId_contentId: { userId: user.id, contentId: parseInt(contentId) } },
    });

    return success(undefined, "Retiré des favoris");
  } catch (e) {
    return handleError(e);
  }
}
