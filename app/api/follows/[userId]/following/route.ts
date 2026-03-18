import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { followerId: parseInt(userId) };
    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: { followed: { select: { id: true, username: true, fullName: true, profilePicture: true, role: true } } },
        skip: page * size, take: size,
      }),
      prisma.follow.count({ where }),
    ]);

    return success({ content: follows.map((f) => f.followed), page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
