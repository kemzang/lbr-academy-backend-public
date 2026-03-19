import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { NextRequest } from "next/server";

const JWT_SECRET: jwt.Secret = process.env.JWT_SECRET || "fallback-secret";
const JWT_EXPIRATION_MS = parseInt(process.env.JWT_EXPIRATION || "86400000");
const JWT_REFRESH_EXPIRATION_MS = parseInt(process.env.JWT_REFRESH_EXPIRATION || "604800000");
const JWT_EXPIRATION = Math.floor(JWT_EXPIRATION_MS / 1000);
const JWT_REFRESH_EXPIRATION = Math.floor(JWT_REFRESH_EXPIRATION_MS / 1000);

export function hashPassword(password: string) {
  return bcrypt.hashSync(password, 10);
}

export function comparePassword(password: string, hash: string) {
  return bcrypt.compareSync(password, hash);
}

export function generateToken(payload: { userId: number; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRATION });
}

export function generateRefreshToken(payload: { userId: number; email: string; role: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_REFRESH_EXPIRATION });
}

export function verifyToken(token: string) {
  try {
    return jwt.verify(token, JWT_SECRET) as { userId: number; email: string; role: string };
  } catch {
    return null;
  }
}

export async function getCurrentUser(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;

  const token = authHeader.substring(7);
  const decoded = verifyToken(token);
  if (!decoded) return null;

  const user = await prisma.user.findUnique({ where: { id: decoded.userId } });
  if (!user || !user.enabled) return null;
  return user;
}

export async function requireAuth(req: NextRequest) {
  const user = await getCurrentUser(req);
  if (!user) throw new AuthError("Non authentifié", 401);
  return user;
}

export async function requireRole(req: NextRequest, roles: string[]) {
  const user = await requireAuth(req);
  if (!roles.includes(user.role)) throw new AuthError("Accès refusé", 403);
  return user;
}

export class AuthError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}
