import { z } from "zod";
import { INCOME_SOURCES } from "@/constants/income";
import { ACCOUNT_TYPES } from "@/constants/expense";

export const createIncomeSchema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
  source: z.enum(INCOME_SOURCES as unknown as [string, ...string[]]),
  account: z.enum(ACCOUNT_TYPES as unknown as [string, ...string[]]),
  date: z.coerce.date(),
  notes: z.string().optional().nullable(),
});

export const updateIncomeSchema = createIncomeSchema.partial();

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
