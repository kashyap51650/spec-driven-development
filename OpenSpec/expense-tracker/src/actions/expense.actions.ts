"use server";

import { getSession } from "@/lib/auth";
import * as expenseService from "@/server/services/expense.service";
import { revalidatePath } from "next/cache";
import type { CreateExpenseInput, UpdateExpenseInput } from "@/types/expense";

type ActionResult = { success: boolean; message: string };

export async function createExpenseAction(
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    const data: CreateExpenseInput = {
      title: String(formData.get("title") ?? ""),
      amount: Number(formData.get("amount")),
      category: String(formData.get("category") ?? ""),
      account: String(formData.get("account") ?? ""),
      date: new Date(String(formData.get("date") ?? new Date().toISOString())),
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
      tags: formData.get("tags")
        ? String(formData.get("tags"))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : [],
      recurring: Boolean(formData.get("recurring")),
    };

    await expenseService.create(session.userId as string, data);
    revalidatePath("/expenses");
    return { success: true, message: "Expense created successfully" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}

export async function updateExpenseAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    const data: UpdateExpenseInput = {
      title: formData.get("title") ? String(formData.get("title")) : undefined,
      amount: formData.get("amount")
        ? Number(formData.get("amount"))
        : undefined,
      category: formData.get("category")
        ? String(formData.get("category"))
        : undefined,
      account: formData.get("account")
        ? String(formData.get("account"))
        : undefined,
      date: formData.get("date")
        ? new Date(String(formData.get("date")))
        : undefined,
      notes: formData.get("notes") ? String(formData.get("notes")) : undefined,
      tags: formData.get("tags")
        ? String(formData.get("tags"))
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
        : undefined,
      recurring: formData.get("recurring")
        ? Boolean(formData.get("recurring"))
        : undefined,
    };

    await expenseService.update(id, session.userId as string, data);
    revalidatePath("/expenses");
    return { success: true, message: "Expense updated successfully" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}

export async function deleteExpenseAction(id: string): Promise<ActionResult> {
  try {
    const session = await getSession();
    if (!session || !session.userId) throw new Error("Unauthorized");

    await expenseService.remove(id, session.userId as string);
    revalidatePath("/expenses");
    return { success: true, message: "Expense deleted" };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { success: false, message: message ?? "Unknown error" };
  }
}
