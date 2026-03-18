import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const request = await prisma.roleUpgradeRequest.create({
      data: {
        userId: user.id,
        currentRole: user.role,
        requestedRole: body.requestedRole,
        motivation: body.motivation,
        bio: body.bio || body.experience,
        portfolioUrl: body.portfolioUrl || body.portfolio,
        linkedinUrl: body.linkedinUrl,
        specialization: body.specialization,
      },
    });

    return success(request, "Demande soumise avec succès", 201);
  } catch (e) {
    return handleError(e);
  }
}

// GET /role-upgrades (admin - toutes les demandes)
export async function GET(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const sp = req.nextUrl.searchParams;
    const status = sp.get("status");
    const page = parseInt(sp.get("page") || "0");
    const size = parseInt(sp.get("size") || "20");

    const where: any = {};
    if (status) where.status = status.toUpperCase();

    const [requests, total] = await Promise.all([
      prisma.roleUpgradeRequest.findMany({
        where,
        include: { user: { select: { id: true, username: true, fullName: true, email: true, role: true } } },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.roleUpgradeRequest.count({ where }),
    ]);

    return success({ content: requests, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
