import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { token, newPassword } = await req.json();

    const user = await prisma.user.findFirst({
      where: { resetPasswordToken: token, resetPasswordExpiry: { gt: new Date() } },
    });
    if (!user) return error("Token invalide ou expiré", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(newPassword), resetPasswordToken: null, resetPasswordExpiry: null },
    });

    return success(undefined, "Mot de passe réinitialisé avec succès");
  } catch (e) {
    return handleError(e);
  }
}
