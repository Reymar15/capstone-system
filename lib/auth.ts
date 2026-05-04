import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "kzens-puto-bumbong-super-secret-2025";

export type JWTPayload = {
  id: string;
  email: string;
  role: "admin" | "customer";
  firstName: string;
};

export function signToken(payload: JWTPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, SECRET) as JWTPayload;
  } catch {
    return null;
  }
}
