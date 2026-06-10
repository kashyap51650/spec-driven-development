import bcrypt from "bcryptjs";

import { signToken } from "@/lib/auth";
import {
  createUser,
  findUserByEmail,
  findUserByEmailWithPassword,
} from "@/server/repositories/auth.repository";
import {
  loginSchema,
  registerSchema,
} from "@/server/validations/auth.validation";
import type { LoginInput, RegisterInput, User } from "@/types/auth";

export async function register(
  input: RegisterInput
): Promise<{ user: User; token: string }> {
  const result = registerSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid input";
    throw new Error(message);
  }

  const { name, email, password } = result.data;

  const existing = await findUserByEmail(email);
  if (existing) {
    throw new Error("Email already in use");
  }

  const hashedPassword = await bcrypt.hash(password, 12);
  const user = await createUser({ name, email, hashedPassword });
  const token = await signToken({ userId: user.id, email: user.email });

  return { user, token };
}

export async function login(
  input: LoginInput
): Promise<{ user: User; token: string }> {
  const result = loginSchema.safeParse(input);
  if (!result.success) {
    const message = result.error.issues[0]?.message ?? "Invalid input";
    throw new Error(message);
  }

  const { email, password } = result.data;

  const userWithPassword = await findUserByEmailWithPassword(email);
  if (!userWithPassword) {
    throw new Error("Invalid email or password");
  }

  const passwordMatch = await bcrypt.compare(password, userWithPassword.password);
  if (!passwordMatch) {
    throw new Error("Invalid email or password");
  }

  const { password: _pwd, ...user } = userWithPassword;
  void _pwd;

  const token = await signToken({ userId: user.id, email: user.email });

  return { user, token };
}
