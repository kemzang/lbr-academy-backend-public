import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, getCurrentUser } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { generateSlug } from "@/lib/slug";
import { uploadFile } from "@/lib/cloudinary";
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
    const user = await requireAuth(req);

    const contentType = req.headers.get("content-type") || "";
    let title: string, description: string | undefined, summary: string | undefined;
    let type: string, isFree: boolean, price: number, currency: string;
    let language: string | undefined, pageCount: number | undefined, duration: number | undefined;
    let tags: string | undefined, categoryId: number | undefined;
    let coverFile: File | null = null;
    let contentFile: File | null = null;

    if (contentType.includes("multipart/form-data")) {
      const formData = await req.formData();
      title = formData.get("title") as string;
      description = formData.get("description") as string | undefined;
      summary = formData.get("summary") as string | undefined;
      type = formData.get("type") as string;
      isFree = formData.get("isFree") === "true" || formData.get("isFree") === "1";
      price = parseFloat(formData.get("price") as string) || 0;
      currency = (formData.get("currency") as string) || "XAF";
      language = formData.get("language") as string | undefined;
      pageCount = formData.get("pageCount") ? parseInt(formData.get("pageCount") as string) : undefined;
      duration = formData.get("duration") ? parseInt(formData.get("duration") as string) : undefined;
      const rawTags = formData.get("tags") as string | undefined;
      tags = rawTags || undefined;
      categoryId = formData.get("categoryId") ? parseInt(formData.get("categoryId") as string) : undefined;
      coverFile = formData.get("coverImage") as File | null;
      contentFile = formData.get("file") as File | null;
    } else {
      const body = await req.json();
      title = body.title;
      description = body.description;
      summary = body.summary;
      type = body.type;
      isFree = body.isFree ?? true;
      price = body.price ?? 0;
      currency = body.currency || "XAF";
      language = body.language;
      pageCount = body.pageCount;
      duration = body.duration;
      tags = Array.isArray(body.tags) ? body.tags.join(",") : body.tags;
      categoryId = body.categoryId;
    }

    // Upload fichiers vers Cloudinary
    let coverImageUrl: string | undefined;
    let fileUrl: string | undefined;

    if (coverFile && coverFile.size > 0) {
      const result = await uploadFile(coverFile, "covers");
      coverImageUrl = result.url;
    }
    if (contentFile && contentFile.size > 0) {
      const result = await uploadFile(contentFile, "contents");
      fileUrl = result.url;
    }

    const content = await prisma.content.create({
      data: {
        title,
        description,
        summary,
        type: type as any,
        isFree,
        price,
        currency,
        language,
        pageCount,
        duration,
        tags,
        slug: generateSlug(title),
        authorId: user.id,
        categoryId,
        coverImage: coverImageUrl,
        fileUrl,
      },
      include: { author: { select: authorSelect }, category: { select: categorySelect } },
    });

    return success(content, "Contenu créé", 201);
  } catch (e) {
    return handleError(e);
  }
}
