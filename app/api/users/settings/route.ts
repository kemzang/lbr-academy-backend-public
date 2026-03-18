import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    let settings = await prisma.userSettings.findUnique({ where: { userId: user.id } });
    if (!settings) {
      settings = await prisma.userSettings.create({ data: { userId: user.id } });
    }
    return success(settings);
  } catch (e) {
    return handleError(e);
  }
}
