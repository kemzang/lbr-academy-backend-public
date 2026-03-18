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
        requireApproval: body.requireContentApproval ?? body.requireApproval,
        allowComments: body.allowComments,
        allowRatings: body.allowRatings,
        maxFileSize: body.maxFileSize,
        allowedFileTypes: Array.isArray(body.allowedFileTypes) ? body.allowedFileTypes.join(",") : body.allowedFileTypes,
      },
    });

    return success(updated, "Paramètres de contenu mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
