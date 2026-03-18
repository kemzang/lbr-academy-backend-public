import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const page = parseInt(sp.get("page") || "0");
    const size = parseInt(sp.get("size") || "20");

    const where: Prisma.ContentWhereInput = { authorId: user.id };
    if (status) where.status = status as any;

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: { category: { select: { id: true, name: true } } },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.content.count({ where }),
    ]);

    return success({ content: contents, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
