import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { id } = await params;
    const active = req.nextUrl.searchParams.get("active");

    const category = await prisma.category.findUnique({ where: { id: parseInt(id) } });
    if (!category) return error("Catégorie introuvable", 404);

    const newStatus = active !== null ? active === "true" : !category.active;
    const updated = await prisma.category.update({ where: { id: parseInt(id) }, data: { active: newStatus } });

    return success(updated, newStatus ? "Catégorie activée" : "Catégorie désactivée");
  } catch (e) {
    return handleError(e);
  }
}
