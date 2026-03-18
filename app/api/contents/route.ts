import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole, getCurrentUser } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { Prisma } from "@prisma/client";

const authorSelect = { id: true, username: true, fullName: true, profilePicture: true };
const categorySelect = { id: true, name: true, slug: true };

export async function GET(req: NextRequest) {
  try {
    const sp = req.nextUrl.searchParams;
    const query = sp.get("query");
    const type = sp.get("type");
    const categoryId = sp.get("categoryId");
    const isFree = sp.get("isFree");
    const page = parseInt(sp.get("page") || "0");
    const size = parseInt(sp.get("size") || "20");
    const sortBy = sp.get("sortBy") || "date";
    const sortDir = (sp.get("sortDir") || "desc") as "asc" | "desc";

    const where: Prisma.ContentWhereInput = { status: "APPROVED" };
    if (query) where.OR = [
      { title: { contains: query, mode: "insensitive" } },
      { description: { contains: query, mode: "insensitive" } },
    ];
    if (type) where.type = type as any;
    if (categoryId) where.categoryId = parseInt(categoryId);
    if (isFree !== null && isFree !== undefined) where.isFree = isFree === "true";

    const orderMap: Record<string, string> = { date: "publishedAt", views: "viewCount", rating: "rating", price: "price" };
    const orderField = orderMap[sortBy] || "publishedAt";

    const [contents, total] = await Promise.all([
      prisma.content.findMany({
        where,
        include: { author: { select: authorSelect }, category: { select: categorySelect } },
        skip: page * size,
        take: size,
        orderBy: { [orderField]: sortDir },
      }),
      prisma.content.count({ where }),
    ]);

    return success({ content: contents, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await requireRole(req, ["CREATEUR", "ENTREPRENEUR", "HYBRIDE", "COACH", "ADMIN"]);
    const body = await req.json();

    const content = await prisma.content.create({
      data: {
        title: body.title,
        description: body.description,
        summary: body.summary,
        type: body.type,
        isFree: body.isFree ?? true,
        price: body.price ?? 0,
        currency: body.currency || "XAF",
        language: body.language,
        pageCount: body.pageCount,
        duration: body.duration,
        tags: Array.isArray(body.tags) ? body.tags.join(",") : body.tags,
        slug: generateSlug(body.title),
        authorId: user.id,
        categoryId: body.categoryId,
      },
      include: { author: { select: authorSelect }, category: { select: categorySelect } },
    });

    return success(content, "Contenu créé", 201);
  } catch (e) {
    return handleError(e);
  }
}
