import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function DELETE(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    await prisma.notification.deleteMany({ where: { userId: user.id, isRead: true } });
    return success(undefined, "Notifications lues supprimées");
  } catch (e) {
    return handleError(e);
  }
}
