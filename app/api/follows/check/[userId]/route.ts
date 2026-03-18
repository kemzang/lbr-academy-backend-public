import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { userId } = await params;

    const follow = await prisma.follow.findUnique({
      where: { followerId_followedId: { followerId: user.id, followedId: parseInt(userId) } },
    });

    return success({ isFollowing: !!follow, notificationsEnabled: follow?.notificationsEnabled ?? false });
  } catch (e) {
    return handleError(e);
  }
}
