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
        emailNewContent: body.emailNewContent,
        emailNewFollower: body.emailNewFollower,
        emailComments: body.emailComments,
        emailNewsletter: body.emailNewsletter,
        pushEnabled: body.pushEnabled,
      },
      create: { userId: user.id, ...body },
    });

    return success(settings, "Préférences de notifications mises à jour");
  } catch (e) {
    return handleError(e);
  }
}
