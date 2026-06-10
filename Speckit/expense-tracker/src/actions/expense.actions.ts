"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import * as expenseService from "@/server/services/expense.service";

export async function createExpenseAction(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const amount = Number(formData.get("amount"));
    const category = formData.get("category") as string;
    const account = formData.get("account") as string;
    const dateStr = formData.get("date") as string;
    const notes = (formData.get("notes") as string) || undefined;
    const tagsStr = (formData.get("tags") as string) ?? "";
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const recurring = formData.get("recurring") === "true";

    await expenseService.create(session.userId, {
      title,
      amount,
      category,
      account,
      date: new Date(dateStr),
      notes,
      tags,
      recurring,
    });

    revalidatePath("/expenses");
    return { success: true, message: "Expense created" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function updateExpenseAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const amount = Number(formData.get("amount"));
    const category = formData.get("category") as string;
    const account = formData.get("account") as string;
    const dateStr = formData.get("date") as string;
    const notes = (formData.get("notes") as string) || undefined;
    const tagsStr = (formData.get("tags") as string) ?? "";
    const tags = tagsStr
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
    const recurring = formData.get("recurring") === "true";

    await expenseService.update(id, session.userId, {
      title,
      amount,
      category,
      account,
      date: new Date(dateStr),
      notes,
      tags,
      recurring,
    });

    revalidatePath("/expenses");
    return { success: true, message: "Expense updated" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteExpenseAction(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    await expenseService.deleteExpense(id, session.userId);

    revalidatePath("/expenses");
    return { success: true, message: "Expense deleted" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
