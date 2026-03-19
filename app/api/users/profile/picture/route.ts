import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";
import { uploadFile } from "@/lib/cloudinary";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("Fichier requis", 400);

    const { url } = await uploadFile(file, "profiles");

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: url },
      select: {
        id: true, username: true, email: true, fullName: true, phone: true,
        bio: true, profilePicture: true, role: true, enabled: true,
        emailVerified: true, profileComplete: true, isCertified: true,
        totalViews: true, totalSales: true, totalEarnings: true,
        createdAt: true, updatedAt: true, lastLoginAt: true,
      },
    });
    return success(updated, "Photo mise à jour");
  } catch (e) {
    return handleError(e);
  }
}
