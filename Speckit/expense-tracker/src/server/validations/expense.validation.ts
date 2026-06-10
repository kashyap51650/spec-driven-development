import { z } from "zod";

import { ACCOUNT_TYPES, EXPENSE_CATEGORIES } from "@/constants/expense";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.enum(EXPENSE_CATEGORIES, { message: "Please select a category" }),
  account: z.enum(ACCOUNT_TYPES, { message: "Please select an account type" }),
  date: z.coerce.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  recurring: z.boolean().optional().default(false),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
