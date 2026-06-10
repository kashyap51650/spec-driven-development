"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import * as authService from "@/server/services/auth.service";

const COOKIE_OPTIONS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
};

export async function registerAction(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const name = formData.get("name") as string;
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { token } = await authService.register({ name, email, password });
    const cookieStore = await cookies();
    cookieStore.set("token", token, COOKIE_OPTIONS);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }

  redirect("/dashboard");
}

export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const { token } = await authService.login({ email, password });
    const cookieStore = await cookies();
    cookieStore.set("token", token, COOKIE_OPTIONS);
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }

  redirect("/dashboard");
}

export async function logoutAction(): Promise<never> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
