import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    const { password, resetPasswordToken, emailVerificationToken, ...safeUser } = user;
    return success(safeUser);
  } catch (e) {
    return handleError(e);
  }
}
