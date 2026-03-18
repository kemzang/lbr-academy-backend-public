import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await prisma.notification.updateMany({
      where: { userId: user.id, isRead: false },
      data: { isRead: true, readAt: new Date() },
    });
    return success(undefined, "Toutes les notifications marquées comme lues");
  } catch (e) {
    return handleError(e);
  }
}
