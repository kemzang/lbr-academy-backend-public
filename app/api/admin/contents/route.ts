import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const type = sp.get("type");
    const search = sp.get("search");
    const page = parseInt(sp.get("page") || "0");
    const size = parseInt(sp.get("size") || "20");

    const where: Prisma.ContentWhereInput = {};
    if (status) where.status = status.toUpperCase() as any;
    if (type) where.type = type.toUpperCase() as any;
    if (search) where.OR = [
      { title: { contains: search, mode: "insensitive" } },
      { description: { contains: search, mode: "insensitive" } },
    ];

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: {
          author: { select: { id: true, username: true, fullName: true } },
          category: { select: { id: true, name: true } },
        },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.content.count({ where }),
    ]);

    return success({ content: contents, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
