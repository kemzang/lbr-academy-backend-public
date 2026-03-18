import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { userId } = await params;

    await prisma.follow.create({
      data: { followerId: user.id, followedId: parseInt(userId) },
    });

    return success(undefined, "Vous suivez maintenant cet utilisateur");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { userId } = await params;

    await prisma.follow.delete({
      where: { followerId_followedId: { followerId: user.id, followedId: parseInt(userId) } },
    });

    return success(undefined, "Vous ne suivez plus cet utilisateur");
  } catch (e) {
    return handleError(e);
  }
}
