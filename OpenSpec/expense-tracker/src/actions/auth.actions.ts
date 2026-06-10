"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  register as registerService,
  login as loginService,
} from "@/server/services/auth.service";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export async function registerAction(
  formData: FormData,
): Promise<{ success: boolean; message: string } | void> {
  try {
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const { token } = await registerService({ name, email, password });
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    redirect("/dashboard");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message || "Registration failed" };
  }
}

export async function loginAction(
  formData: FormData,
): Promise<{ success: boolean; message: string } | void> {
  try {
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    const { token } = await loginService({ email, password });
    const cookieStore = await cookies();
    cookieStore.set({
      name: "token",
      value: token,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });
    redirect("/dashboard");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message || "Login failed" };
  }
}

export async function logoutAction(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete("token");
  redirect("/login");
}
