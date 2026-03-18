import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, handleError } from "@/lib/api-response";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();
    const user = await prisma.user.findUnique({ where: { email } });

    if (user) {
      const token = crypto.randomBytes(32).toString("hex");
      await prisma.user.update({
        where: { id: user.id },
        data: {
          resetPasswordToken: token,
          resetPasswordExpiry: new Date(Date.now() + 3600000), // 1h
        },
      });
      // TODO: envoyer l'email
    }

    return success(undefined, "Si l'email existe, un lien de réinitialisation a été envoyé");
  } catch (e) {
    return handleError(e);
  }
}
