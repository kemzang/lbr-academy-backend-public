import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true },
      include: { _count: { select: { contents: true } } },
      orderBy: { displayOrder: "asc" },
    });
    return success(categories);
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const body = await req.json();

    const category = await prisma.category.create({
      data: {
        name: body.name,
        description: body.description,
        iconUrl: body.icon || body.iconUrl,
        slug: generateSlug(body.name),
        parentId: body.parentId,
        displayOrder: body.displayOrder || 0,
      },
    });

    return success(category, "Catégorie créée", 201);
  } catch (e) {
    return handleError(e);
  }
}
