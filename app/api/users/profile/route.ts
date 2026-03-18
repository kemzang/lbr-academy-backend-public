import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const profile = await prisma.user.findUnique({
      where: { id: user.id },
      include: {
        _count: { select: { contents: true, followers: true, following: true } },
      },
    });
    const { password, resetPasswordToken, emailVerificationToken, ...safe } = profile!;
    return success({ ...safe, followersCount: safe._count.followers, followingCount: safe._count.following, contentsCount: safe._count.contents });
  } catch (e) {
    return handleError(e);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const body = await req.json();
    const { fullName, bio, phone } = body;

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { fullName, bio, phone, profileComplete: true },
    });
    const { password, resetPasswordToken, emailVerificationToken, ...safe } = updated;
    return success(safe, "Profil mis à jour");
  } catch (e) {
    return handleError(e);
  }
}
