import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { verifyToken, generateToken } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) return error("Token manquant", 401);

    const refreshToken = authHeader.substring(7);
    const decoded = verifyToken(refreshToken);
    if (!decoded) return error("Token invalide ou expiré", 401);

    const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
    if (!user) return error("Utilisateur introuvable", 404);

    const payload = { userId: user.id, email: user.email, role: user.role };
    const newAccessToken = generateToken(payload);

    return success(
      {
        accessToken: newAccessToken,
        refreshToken,
        expiresIn: 86400000,
        user: { id: user.id, username: user.username, email: user.email, role: user.role, fullName: user.fullName },
      },
      "Token rafraîchi"
    );
  } catch (e) {
    return handleError(e);
  }
}
