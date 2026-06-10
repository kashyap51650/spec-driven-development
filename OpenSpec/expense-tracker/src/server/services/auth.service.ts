import bcrypt from "bcrypt";
import { signToken } from "@/lib/auth";
import {
  registerSchema,
  loginSchema,
} from "@/server/validations/auth.validation";
import type { RegisterInput, LoginInput, User } from "@/types/auth";
import * as repo from "@/server/repositories/auth.repository";

const SALT_ROUNDS = 12;

export async function register(
  input: RegisterInput,
): Promise<{ user: User; token: string }> {
  const parsed = registerSchema.parse(input);
  const existing = await repo.findUserByEmail(parsed.email);
  if (existing) {
    throw new Error("Email already in use");
  }
  const hashed = await bcrypt.hash(parsed.password, SALT_ROUNDS);
  const user = await repo.createUser({
    name: parsed.name,
    email: parsed.email,
    hashedPassword: hashed,
  });
  const token = signToken({ userId: user.id, email: user.email });
  return { user, token };
}

export async function login(
  input: LoginInput,
): Promise<{ user: User; token: string }> {
  const parsed = loginSchema.parse(input);
  const userRecord = await repo.findUserByEmail(parsed.email);
  if (!userRecord) {
    throw new Error("Invalid email or password");
  }
  const match = await repo.verifyUserPassword(parsed.email, parsed.password);
  if (!match) {
    throw new Error("Invalid email or password");
  }
  const token = signToken({ userId: userRecord.id, email: userRecord.email });
  return { user: userRecord, token };
}
