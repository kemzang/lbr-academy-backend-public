import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, generateToken, generateRefreshToken } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";
import { sendWelcomeEmail, sendVerificationEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { username, email, password, fullName } = body;

    if (!username || !email || !password) {
      throw new Error("username, email et password sont requis");
    }

    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashPassword(password),
        fullName,
        emailVerificationToken: verificationToken,
      },
    });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Envoyer les emails en arrière-plan (sans bloquer la réponse)
    sendWelcomeEmail(user.email, user.username).catch(console.error);
    sendVerificationEmail(user.email, verificationToken).catch(console.error);

    return success(
      {
        accessToken,
        refreshToken,
        expiresIn: parseInt(process.env.JWT_EXPIRATION || "86400000"),
        user: { id: user.id, username: user.username, email: user.email, role: user.role, fullName: user.fullName },
      },
      "Compte créé avec succès",
      201
    );
  } catch (e) {
    return handleError(e);
  }
}
