import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const limit = parseInt(req.nextUrl.searchParams.get("limit") || "10");
    const contents = await prisma.content.findMany({
      where: { status: "APPROVED", ratingCount: { gt: 0 } },
      include: { author: { select: { id: true, username: true, fullName: true, profilePicture: true } }, category: { select: { id: true, name: true } } },
      take: limit,
      orderBy: { rating: "desc" },
    });
    return success(contents);
  } catch (e) {
    return handleError(e);
  }
}
