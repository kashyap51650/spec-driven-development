"use server";

import { revalidatePath } from "next/cache";

import { getSession } from "@/lib/auth";
import * as incomeService from "@/server/services/income.service";

export async function createIncomeAction(
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const amount = Number(formData.get("amount"));
    const source = formData.get("source") as string;
    const account = formData.get("account") as string;
    const dateStr = formData.get("date") as string;
    const notes = (formData.get("notes") as string) || undefined;

    await incomeService.create(session.userId, {
      title,
      amount,
      source,
      account,
      date: new Date(dateStr),
      notes,
    });

    revalidatePath("/income");
    return { success: true, message: "Income created" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function updateIncomeAction(
  id: string,
  formData: FormData,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    const title = formData.get("title") as string;
    const amount = Number(formData.get("amount"));
    const source = formData.get("source") as string;
    const account = formData.get("account") as string;
    const dateStr = formData.get("date") as string;
    const notes = (formData.get("notes") as string) || undefined;

    await incomeService.update(id, session.userId, {
      title,
      amount,
      source,
      account,
      date: new Date(dateStr),
      notes,
    });

    revalidatePath("/income");
    return { success: true, message: "Income updated" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}

export async function deleteIncomeAction(
  id: string,
): Promise<{ success: boolean; message: string }> {
  try {
    const session = await getSession();
    if (!session) return { success: false, message: "Unauthorized" };

    await incomeService.deleteIncome(id, session.userId);

    revalidatePath("/income");
    return { success: true, message: "Income deleted" };
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
}
