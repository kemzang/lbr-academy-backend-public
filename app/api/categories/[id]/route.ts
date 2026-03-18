import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const category = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { subcategories: true, _count: { select: { contents: true } } },
    });
    if (!category) return error("Catégorie introuvable", 404);
    return success(category);
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { id } = await params;
    const body = await req.json();

    const updated = await prisma.category.update({
      where: { id: parseInt(id) },
      data: { name: body.name, description: body.description, iconUrl: body.icon || body.iconUrl, parentId: body.parentId },
    });

    return success(updated, "Catégorie mise à jour");
  } catch (e) {
    return handleError(e);
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { id } = await params;
    await prisma.category.delete({ where: { id: parseInt(id) } });
    return success(undefined, "Catégorie supprimée");
  } catch (e) {
    return handleError(e);
  }
}
