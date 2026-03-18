import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const { contentId } = await params;
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { contentId: parseInt(contentId), isHidden: false, parentId: null };
    const [comments, total] = await Promise.all([
      prisma.comment.findMany({
        where,
        include: {
          user: { select: { id: true, username: true, fullName: true, profilePicture: true } },
          replies: {
            include: { user: { select: { id: true, username: true, fullName: true, profilePicture: true } } },
            orderBy: { createdAt: "asc" },
          },
        },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.comment.count({ where }),
    ]);

    return success({ content: comments, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    const user = await requireAuth(req);
    const { contentId } = await params;
    const { text, parentId } = await req.json();

    const comment = await prisma.comment.create({
      data: { text, userId: user.id, contentId: parseInt(contentId), parentId },
      include: { user: { select: { id: true, username: true, fullName: true, profilePicture: true } } },
    });

    return success(comment, "Commentaire ajouté", 201);
  } catch (e) {
    return handleError(e);
  }
}
