import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();

    const settings = await prisma.userSettings.upsert({
      where: { userId: user.id },
      update: {
        profilePublic: body.profilePublic,
        showEmail: body.showEmail,
        showActivity: body.showActivity,
      },
      create: { userId: user.id, ...body },
    });

    return success(settings, "Paramètres de confidentialité mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
