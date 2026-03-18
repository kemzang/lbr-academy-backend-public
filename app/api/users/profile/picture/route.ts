import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { success, error, handleError } from "@/lib/api-response";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    if (!file) return error("Fichier requis", 400);

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const ext = path.extname(file.name) || ".jpg";
    const filename = `profile_${user.id}_${Date.now()}${ext}`;
    const uploadDir = path.join(process.cwd(), "public", "uploads", "profiles");
    await mkdir(uploadDir, { recursive: true });
    await writeFile(path.join(uploadDir, filename), buffer);

    const pictureUrl = `/uploads/profiles/${filename}`;
    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: pictureUrl },
    });
    const { password, resetPasswordToken, emailVerificationToken, ...safe } = updated;
    return success(safe, "Photo mise à jour");
  } catch (e) {
    return handleError(e);
  }
}
