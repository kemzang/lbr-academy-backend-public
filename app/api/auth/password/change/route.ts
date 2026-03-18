import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, comparePassword, hashPassword } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { currentPassword, newPassword } = await req.json();

    if (!comparePassword(currentPassword, user.password)) {
      return error("Mot de passe actuel incorrect", 400);
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword) },
    });

    return success(undefined, "Mot de passe changé avec succès");
  } catch (e) {
    return handleError(e);
  }
}
