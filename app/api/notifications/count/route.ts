import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const count = await prisma.notification.count({ where: { userId: user.id, isRead: false } });
    return success({ unreadCount: count });
  } catch (e) {
    return handleError(e);
  }
}
