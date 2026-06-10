import { db } from "@/lib/prisma";
import type { User } from "@/types/auth";

const USER_SELECT = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
} as const;

function mapToUser(raw: {
  id: string;
  name: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
}): User {
  return {
    id: raw.id,
    name: raw.name,
    email: raw.email,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
  };
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const raw = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: USER_SELECT,
  });
  return raw ? mapToUser(raw) : null;
}

export async function findUserByEmailWithPassword(
  email: string
): Promise<(User & { password: string }) | null> {
  const raw = await db.user.findUnique({
    where: { email: email.toLowerCase() },
    select: { ...USER_SELECT, password: true },
  });
  if (!raw) return null;
  return { ...mapToUser(raw), password: raw.password };
}

export async function findUserById(id: string): Promise<User | null> {
  const raw = await db.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
  return raw ? mapToUser(raw) : null;
}

export async function createUser(data: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<User> {
  const raw = await db.user.create({
    data: {
      name: data.name,
      email: data.email.toLowerCase(),
      password: data.hashedPassword,
    },
    select: USER_SELECT,
  });
  return mapToUser(raw);
}
