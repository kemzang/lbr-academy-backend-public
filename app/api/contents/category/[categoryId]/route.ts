import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ categoryId: string }> }) {
  try {
    const { categoryId } = await params;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { categoryId: parseInt(categoryId), status: "APPROVED" as const };
    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: { author: { select: { id: true, username: true, fullName: true, profilePicture: true } }, category: { select: { id: true, name: true } } },
        skip: page * size, take: size, orderBy: { publishedAt: "desc" },
      }),
      prisma.content.count({ where }),
    ]);

    return success({ content: contents, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
