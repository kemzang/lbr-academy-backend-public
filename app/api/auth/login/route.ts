import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, generateToken, generateRefreshToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const { emailOrUsername, password } = await req.json();

    const user = await prisma.user.findFirst({
      where: { OR: [{ email: emailOrUsername }, { username: emailOrUsername }] },
    });

    if (!user || !comparePassword(password, user.password)) {
      return error("Email ou mot de passe incorrect", 401);
    }
    if (!user.enabled) return error("Compte suspendu", 403);

    await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

    const payload = { userId: user.id, email: user.email, role: user.role };
    const accessToken = generateToken(payload);
    const refreshToken = generateRefreshToken(payload);

    return success(
      {
        accessToken,
        refreshToken,
        expiresIn: 86400000,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, fullName: user.fullName, profilePicture: user.profilePicture },
      },
      "Connexion réussie"
    );
  } catch (e) {
    return handleError(e);
  }
}
