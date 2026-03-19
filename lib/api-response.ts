import { NextResponse } from "next/server";
import { AuthError } from "./auth";

export function success<T>(data?: T, message?: string, status = 200) {
  return NextResponse.json({ success: true, message, data }, { status });
}

export function error(message: string, status = 400) {
  return NextResponse.json(
    { success: false, message, timestamp: new Date().toISOString() },
    { status }
  );
}

export function handleError(e: unknown) {
  if (e instanceof AuthError) return error(e.message, e.status);
  if (e instanceof Error) {
    if (e.message.includes("Unique constraint")) return error("Cette ressource existe déjà", 409);
    if (e.message.includes("not found") || e.message.includes("introuvable"))
      return error(e.message, 404);
    return error(e.message, 400);
  }
  return error("Erreur interne du serveur", 500);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function excludeSensitiveFields(user: any) {
  if (!user) return user;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { password, resetPasswordToken, resetPasswordExpiry, emailVerificationToken, ...safe } = user;
  return safe;
}
