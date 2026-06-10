import { getSession } from "@/lib/auth";
import { findById } from "@/server/repositories/user.repository";
import type { User } from "@/types/auth";

export async function getUserById(): Promise<User> {
  const session = await getSession();
  if (!session) {
    throw new Error("Unauthorized");
  }

  const user = await findById(session.userId);
  if (!user) {
    throw new Error("User not found");
  }

  return user;
}
