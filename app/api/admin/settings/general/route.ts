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
        siteName: body.siteName,
        siteDescription: body.siteDescription,
        siteUrl: body.siteUrl,
        supportEmail: body.supportEmail || body.contactEmail,
        defaultLanguage: body.defaultLanguage,
      },
    });

    return success(updated, "Paramètres généraux mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
