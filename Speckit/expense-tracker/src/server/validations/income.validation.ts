import { z } from "zod";

import { ACCOUNT_TYPES } from "@/constants/expense";
import { INCOME_SOURCES } from "@/constants/income";

export const createIncomeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  source: z.enum(INCOME_SOURCES, { message: "Please select a source" }),
  account: z.enum(ACCOUNT_TYPES, { message: "Please select an account type" }),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export const updateIncomeSchema = createIncomeSchema.partial();
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
