import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { success, handleError } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return success(
      "Token valide",
      `Token valide pour: ${user.email} | Role: ${user.role} | ID: ${user.id}`
    );
  } catch (e) {
    return handleError(e);
  }
}
