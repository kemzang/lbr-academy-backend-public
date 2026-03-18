import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortDir = searchParams.get("sortDir") || "desc";

    const where = { role: { in: ["CREATEUR" as const, "ENTREPRENEUR" as const, "HYBRIDE" as const, "COACH" as const] } };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, username: true, fullName: true, profilePicture: true, role: true, bio: true,
          isCertified: true, totalViews: true, totalSales: true, createdAt: true,
          _count: { select: { contents: true, followers: true } },
        },
        skip: page * size,
        take: size,
        orderBy: { [sortBy]: sortDir as "asc" | "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return success({ content: users, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
