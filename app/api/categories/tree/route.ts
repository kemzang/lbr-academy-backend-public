import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";

export async function GET() {
  try {
    const categories = await prisma.category.findMany({
      where: { active: true, parentId: null },
      include: {
        subcategories: { where: { active: true }, include: { _count: { select: { contents: true } } } },
        _count: { select: { contents: true } },
      },
      orderBy: { displayOrder: "asc" },
    });
    return success(categories);
  } catch (e) {
    return handleError(e);
  }
}
