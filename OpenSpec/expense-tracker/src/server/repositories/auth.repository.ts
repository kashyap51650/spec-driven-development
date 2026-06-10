import { prisma } from "@/lib/prisma";
import type { User } from "@/types/auth";
import type { User as PrismaUser } from "@prisma/client";
import bcrypt from "bcrypt";

export async function findUserByEmail(email: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as User;
}

export async function findUserById(id: string): Promise<User | null> {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as User;
}

export async function createUser(data: {
  name: string;
  email: string;
  hashedPassword: string;
}): Promise<User> {
  const user = await prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      password: data.hashedPassword,
    },
  });
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  } as User;
}

export async function verifyUserPassword(
  email: string,
  plainPassword: string,
): Promise<boolean> {
  const user = (await prisma.user.findUnique({
    where: { email },
  })) as PrismaUser | null;
  if (!user || typeof user.password !== "string") return false;
  return bcrypt.compare(plainPassword, user.password);
}
