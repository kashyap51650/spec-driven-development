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

export async function findById(id: string): Promise<User | null> {
  const raw = await db.user.findUnique({
    where: { id },
    select: USER_SELECT,
  });
  return raw ? mapToUser(raw) : null;
}
