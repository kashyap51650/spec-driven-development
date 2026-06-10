import { z } from "zod";
import { EXPENSE_CATEGORIES, ACCOUNT_TYPES } from "@/constants/expense";

export const createExpenseSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  category: z.enum(EXPENSE_CATEGORIES as unknown as [string, ...string[]]),
  account: z.enum(ACCOUNT_TYPES as unknown as [string, ...string[]]),
  date: z.coerce.date(),
  notes: z.string().optional().nullable(),
  tags: z.array(z.string()).optional().default([]),
  recurring: z.boolean().optional().default(false),
});

export const updateExpenseSchema = createExpenseSchema.partial().extend({
  amount: z.number().positive().optional(),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
