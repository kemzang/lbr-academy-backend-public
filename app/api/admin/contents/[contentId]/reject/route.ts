import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ contentId: string }> }) {
  try {
    await requireRole(req, ["ADMIN"]);
    const { contentId } = await params;
    const body = await req.json();

    const content = await prisma.content.update({
      where: { id: parseInt(contentId) },
      data: { status: "REJECTED", rejectionReason: body.reason },
    });

    await prisma.notification.create({
      data: {
        userId: content.authorId,
        title: "Contenu rejeté",
        message: `Votre contenu "${content.title}" a été rejeté. Raison: ${body.reason || "Non spécifiée"}`,
        type: "CONTENT_REJECTED",
        targetType: "content",
        targetId: content.id,
      },
    });

    return success(content, "Contenu rejeté");
  } catch (e) {
    return handleError(e);
  }
}
