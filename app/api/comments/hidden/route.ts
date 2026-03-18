import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { isHidden: true };
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: { user: { select: { id: true, username: true, fullName: true } }, content: { select: { id: true, title: true } } },
        skip: page * size, take: size,
      }),
      prisma.comment.count({ where }),
    ]);

    return success({ content: comments, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
