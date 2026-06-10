import jwt, { type Secret, type SignOptions } from "jsonwebtoken";
import { cookies } from "next/headers";

type JWTPayload = {
  sub?: string;
  email?: string;
  name?: string;
  [key: string]: unknown;
};

export function verifyToken(token: string): JWTPayload | null {
  try {
    const secret = process.env.JWT_SECRET || "";
    const payload = jwt.verify(token, secret) as JWTPayload;
    return payload;
  } catch {
    return null;
  }
}

export async function getSession(): Promise<JWTPayload | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}

export function signToken(payload: { userId: string; email: string }): string {
  const secret = process.env.JWT_SECRET || "";
  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  const signOptions: SignOptions = {
    expiresIn: expiresIn as unknown as SignOptions["expiresIn"],
  };
  return jwt.sign(
    { userId: payload.userId, email: payload.email },
    secret as unknown as Secret,
    signOptions,
  );
}
