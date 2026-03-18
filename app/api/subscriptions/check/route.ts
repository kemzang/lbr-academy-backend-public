import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const sub = await prisma.userSubscription.findFirst({
      where: { userId: user.id, status: "ACTIVE", endDate: { gt: new Date() } },
    });
    return success({ subscribed: !!sub });
  } catch (e) {
    return handleError(e);
  }
}
