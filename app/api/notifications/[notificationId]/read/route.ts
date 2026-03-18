import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ notificationId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { notificationId } = await params;

    await prisma.notification.updateMany({
      where: { id: parseInt(notificationId), userId: user.id },
      data: { isRead: true, readAt: new Date() },
    });

    return success(undefined, "Notification marquée comme lue");
  } catch (e) {
    return handleError(e);
  }
}
