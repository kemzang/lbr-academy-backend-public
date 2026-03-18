import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { userId } = await params;
    const enabled = req.nextUrl.searchParams.get("enabled") === "true";

    await prisma.follow.update({
      where: { followerId_followedId: { followerId: user.id, followedId: parseInt(userId) } },
      data: { notificationsEnabled: enabled },
    });

    return success(undefined, enabled ? "Notifications activées" : "Notifications désactivées");
  } catch (e) {
    return handleError(e);
  }
}
