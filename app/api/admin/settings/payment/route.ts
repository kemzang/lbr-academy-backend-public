import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PUT(req: NextRequest) {
  try {
    await requireRole(req, ["ADMIN"]);
    const body = await req.json();

    let settings = await prisma.appSettings.findFirst();
    if (!settings) settings = await prisma.appSettings.create({ data: {} });

    const updated = await prisma.appSettings.update({
      where: { id: settings.id },
      data: {
        currency: body.currency,
        minPrice: body.minWithdrawal || body.minPrice,
        platformFee: body.platformCommission || body.platformFee,
        paymentMethods: Array.isArray(body.paymentMethods) ? body.paymentMethods.join(",") : body.paymentMethods,
      },
    });

    return success(updated, "Paramètres de paiement mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
