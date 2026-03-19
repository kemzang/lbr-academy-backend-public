import { NextRequest } from "next/server";
import { requireAuth } from "@/lib/auth";
import { success, handleError, excludeSensitiveFields } from "@/lib/api-response";

export async function GET(req: NextRequest) {
  try {
    const user = await requireAuth(req);
    return success(excludeSensitiveFields(user));
  } catch (e) {
    return handleError(e);
  }
}
