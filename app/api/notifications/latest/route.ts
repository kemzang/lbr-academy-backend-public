import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const notifications = await prisma.notification.findMany({
      where: { userId: user.id },
      take: 10,
      orderBy: { createdAt: "desc" },
    });
    return success(notifications);
  } catch (e) {
    return handleError(e);
  }
}
