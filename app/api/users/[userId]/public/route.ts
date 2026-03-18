import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { success, error, handleError } from "@/lib/api-response";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const { userId } = await params;
    const user = await prisma.user.findUnique({
      where: { id: parseInt(userId) },
      select: {
        id: true, username: true, fullName: true, bio: true, profilePicture: true,
        role: true, isCertified: true, createdAt: true,
        _count: { select: { contents: true, followers: true, following: true } },
      },
    });
    if (!user) return error("Utilisateur introuvable", 404);
    return success(user);
  } catch (e) {
    return handleError(e);
  }
}
