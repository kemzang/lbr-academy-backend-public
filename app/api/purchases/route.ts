import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { contentId, paymentMethod } = await req.json();

    const content = await prisma.content.findUnique({ where: { id: contentId } });
    if (!content) return error("Contenu introuvable", 404);
    if (content.isFree) return error("Ce contenu est gratuit", 400);

    const commissionRate = parseFloat(process.env.PLATFORM_COMMISSION_RATE || "0.15");
    const platformCommission = content.price * commissionRate;
    const purchase = await prisma.purchase.create({
      data: {
        userId: user.id, contentId, amount: content.price, currency: content.currency,
        paymentMethod, platformCommission, creatorEarnings: content.price - platformCommission,
      },
      include: { content: { select: { id: true, title: true } } },
    });

    return success(purchase, "Achat initié", 201);
  } catch (e) {
    return handleError(e);
  }
}

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const page = parseInt(req.nextUrl.searchParams.get("page") || "0");
    const size = parseInt(req.nextUrl.searchParams.get("size") || "20");

    const where = { userId: user.id };
    const [purchases, total] = await Promise.all([
      prisma.purchase.findMany({
        where,
        include: { content: { select: { id: true, title: true, coverImage: true, type: true } } },
        skip: page * size, take: size, orderBy: { createdAt: "desc" },
      }),
      prisma.purchase.count({ where }),
    ]);

    return success({ content: purchases, page, size, totalElements: total, totalPages: Math.ceil(total / size) });
  } catch (e) {
    return handleError(e);
  }
}
