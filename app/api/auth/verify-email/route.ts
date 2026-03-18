import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get("token");
    if (!token) return error("Token manquant", 400);

    const user = await prisma.user.findFirst({ where: { emailVerificationToken: token } });
    if (!user) return error("Token invalide", 400);

    await prisma.user.update({
      where: { id: user.id },
      data: { emailVerified: true, emailVerificationToken: null },
    });

    return success(undefined, "Email vérifié avec succès");
  } catch (e) {
    return handleError(e);
  }
}
