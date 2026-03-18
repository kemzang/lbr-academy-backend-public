import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const user = await requireAuth(req);
    const { id } = await params;
    const contentId = parseInt(id);

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return error("Contenu introuvable", 404);
    if (content.isFree) return error("Ce contenu est gratuit", 400);

    const existing = await prisma.purchase.findUnique({ where: { userId_contentId: { userId: user.id, contentId } } });
    if (existing) return error("Contenu déjà acheté", 409);

    const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0.15");
    const platformCommission = content.price * commissionRate;
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id,
        contentId,
        amount: content.price,
        currency: content.currency,
        platformCommission,
        creatorEarnings: content.price - platformCommission,
      },
      include: { content: { select: { id: true, title: true } } },
    });

    return success(purchase, "Achat initié", 201);
  } catch (e) {
    return handleError(e);
  }
}
