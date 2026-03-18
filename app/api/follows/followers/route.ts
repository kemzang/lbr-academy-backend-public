import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { followedId: user.id };
    const [follows, total] = await Promise.all([
      prisma.follow.findMany({
        where,
        include: { follower: { select: { id: true, username: true, fullName: true, profilePicture: true, role: true } } },
        skip: page * size, take: size,
      }),
      prisma.follow.count({ where }),
    ]);

    return success({ content: follows.map((f) => f.follower), page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
