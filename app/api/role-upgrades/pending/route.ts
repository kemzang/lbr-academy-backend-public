import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { status: "PENDING" as const };
    const [requests, total] = await Promise.all([
      prisma.roleUpgradeRequest.findMany({
        where,
        include: { user: { select: { id: true, username: true, fullName: true, email: true, role: true } } },
        skip: page * size, take: size, orderBy: { createdAt: "asc" },
      }),
      prisma.roleUpgradeRequest.count({ where }),
    ]);

    return success({ content: requests, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
