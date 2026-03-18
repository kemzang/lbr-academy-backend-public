import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    let settings = await prisma.appSettings.findFirst();
    if (!settings) settings = await prisma.appSettings.create({ data: {} });
    return success(settings);
  } catch (e) {
    return handleError(e);
  }
}
