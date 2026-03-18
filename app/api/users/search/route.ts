import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = req.nextUrl;
    const query = searchParams.get("query") || "";
    const page = parseInt(searchParams.get("page") || "0");
    const size = parseInt(searchParams.get("size") || "20");

    const where = {
      OR: [
        { username: { contains: query, mode: "insensitive" as const } },
        { fullName: { contains: query, mode: "insensitive" as const } },
      ],
    };

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: { id: true, username: true, fullName: true, profilePicture: true, role: true, bio: true },
        skip: page * size,
        take: size,
      }),
      prisma.user.count({ where }),
    ]);

    return success({ content: users, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
