import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User, { IUser } from "@/lib/models/User";
import "@/lib/models/School"; // ensure School model is registered for populate

const JWT_SECRET = process.env.JWT_SECRET!;
const SALT_ROUNDS = 12;

export interface JWTPayload {
  userId: string;
  schoolId: string;
  role: "superadmin" | "school_admin" | "editor" | "sales";
}

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

export function verifyToken(token: string): JWTPayload {
  return jwt.verify(token, JWT_SECRET) as JWTPayload;
}

export function extractToken(request: NextRequest): string | null {
  // Check Authorization header first
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }
  // Fallback to cookie
  const cookie = request.cookies.get("admin-token");
  return cookie?.value || null;
}

export function getAuthPayload(request: NextRequest): JWTPayload | null {
  const token = extractToken(request);
  if (!token) return null;
  try {
    return verifyToken(token);
  } catch {
    return null;
  }
}

export async function getAuthUser(request: NextRequest): Promise<IUser | null> {
  const payload = getAuthPayload(request);
  if (!payload) return null;
  await connectDB();
  const user = await User.findById(payload.userId).select("-passwordHash").populate("schoolId", "slug name");
  if (!user || !user.isActive) return null;
  return user;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

type AllowedRoles = ("superadmin" | "school_admin" | "editor" | "sales")[];

/**
 * Validate auth and optionally check roles.
 * Returns the JWT payload or null if unauthorized.
 */
export function requireAuth(
  request: NextRequest,
  allowedRoles?: AllowedRoles
): JWTPayload | null {
  const payload = getAuthPayload(request);
  if (!payload) return null;
  if (allowedRoles && !allowedRoles.includes(payload.role)) return null;
  return payload;
}

/**
 * Check if user can access a specific school's data.
 * Superadmins can access everything.
 */
export function canAccessSchool(
  payload: JWTPayload,
  schoolId: string
): boolean {
  if (payload.role === "superadmin") return true;
  return payload.schoolId === schoolId;
}

export function unauthorizedResponse(message = "Unauthorized") {
  return Response.json(
    { success: false, error: message },
    { status: 401 }
  );
}

export function forbiddenResponse(message = "Forbidden") {
  return Response.json(
    { success: false, error: message },
    { status: 403 }
  );
}
