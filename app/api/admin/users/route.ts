import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { Prisma } from "@prisma/client";

export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const sp = req.nextUrl.searchParams;
    const role = sp.get("role");
    const status = sp.get("status");
    const search = sp.get("search");
    const page = parseInt(sp.get("page") || "0");
    const size = parseInt(sp.get("size") || "20");

    const where: Prisma.UserWhereInput = {};
    if (role) where.role = role.toUpperCase() as any;
    if (status === "active") where.enabled = true;
    if (status === "suspended") where.enabled = false;
    if (search) where.OR = [
      { username: { contains: search, mode: "insensitive" } },
      { fullName: { contains: search, mode: "insensitive" } },
      { email: { contains: search, mode: "insensitive" } },
    ];

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        select: {
          id: true, username: true, email: true, fullName: true, role: true,
          enabled: true, emailVerified: true, profilePicture: true, createdAt: true, lastLoginAt: true,
          _count: { select: { contents: true, purchases: true } },
        },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.user.count({ where }),
    ]);

    return success({ content: users, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
