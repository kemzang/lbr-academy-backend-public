import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { userId } = await params;
    const role = req.nextUrl.searchParams.get("role")?.toUpperCase() as any;

    const user = await prisma.user.update({
      where: { id: parseInt(userId) },
      data: { role },
      select: { id: true, username: true, email: true, fullName: true, role: true },
    });

    return success(user, "Rôle modifié");
  } catch (e) {
    return handleError(e);
  }
}
