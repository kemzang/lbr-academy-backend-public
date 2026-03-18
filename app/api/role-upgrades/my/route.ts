import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { userId: user.id };
    const [requests, total] = await Promise.all([
      prisma.roleUpgradeRequest.findMany({ where, skip: page * size, take: size, orderBy: { createdAt: "desc" } }),
      prisma.roleUpgradeRequest.count({ where }),
    ]);

    return success({ content: requests, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
