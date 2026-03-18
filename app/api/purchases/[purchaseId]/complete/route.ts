import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest, { params }: { params: Promise<{ purchaseId: string }> }) {
  try {
    await requireAuth(req);
    const { purchaseId } = await params;
    const paymentReference = req.nextUrl.searchParams.get("paymentReference");

    const purchase = await prisma.purchase.findUnique({ where: { id: parseInt(purchaseId) } });
    if (!purchase) return error("Achat introuvable", 404);

    const updated = await prisma.purchase.update({
      where: { id: parseInt(purchaseId) },
      data: { status: "COMPLETED", paymentReference, completedAt: new Date() },
      include: { content: { select: { id: true, title: true } } },
    });

    // Incrémenter les stats
    await prisma.content.update({ where: { id: purchase.contentId }, data: { purchaseCount: { increment: 1 } } });

    return success(updated, "Achat complété");
  } catch (e) {
    return handleError(e);
  }
}
