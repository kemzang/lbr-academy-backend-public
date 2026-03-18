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
        emailNewUser: body.enableEmailNotifications ?? body.emailNewUser,
        emailNewContent: body.emailNewContent,
        emailNewPurchase: body.emailNewPurchase,
        emailNewComment: body.emailNewComment,
      },
    });

    return success(updated, "Paramètres de notifications mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
