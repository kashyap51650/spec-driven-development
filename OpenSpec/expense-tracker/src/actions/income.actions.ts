"use server";

import { getSession } from "@/lib/auth";
import * as incomeService from "@/server/services/income.service";
import { revalidatePath } from "next/cache";
import type { CreateIncomeInput, UpdateIncomeInput } from "@/types/income";

type ActionResult = { success: boolean; message: string };

export async function createIncomeAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    const data: CreateIncomeInput = {
      title: String(formData.get("title") ?? ""),
      amount: Number(formData.get("amount")),
      source: String(formData.get("source") ?? ""),
      account: String(formData.get("account") ?? ""),
      date: new Date(String(formData.get("date") ?? new Date().toISOString())),
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    };

    await incomeService.create(session.userId as string, data);
    revalidatePath("/income");
    return { success: true, message: "Income created successfully" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}

export async function updateIncomeAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    const data: UpdateIncomeInput = {
      title: formData.get("title") ? String(formData.get("title")) : undefined,
      amount: formData.get("amount")
        ? Number(formData.get("amount"))
        : undefined,
      source: formData.get("source")
        ? String(formData.get("source"))
        : undefined,
      account: formData.get("account")
        ? String(formData.get("account"))
        : undefined,
      date: formData.get("date")
        ? new Date(String(formData.get("date")))
        : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
    };

    await incomeService.update(id, session.userId as string, data);
    revalidatePath("/income");
    return { success: true, message: "Income updated successfully" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}

export async function deleteIncomeAction(id: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    await incomeService.remove(id, session.userId as string);
    revalidatePath("/income");
    return { success: true, message: "Income deleted" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}
