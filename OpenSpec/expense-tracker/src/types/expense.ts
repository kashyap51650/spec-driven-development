/* eslint-disable @typescript-eslint/no-empty-object-type */
export interface Expense {
  id: string;
  title: string;
  amount: number;
  category: string;
  account: string;
  date: Date;
  notes: string | null;
  tags: string[];
  recurring: boolean;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateExpenseInput {
  title: string;
  amount: number;
  category: string;
  account: string;
  date: Date;
  notes?: string;
  tags?: string[];
  recurring?: boolean;
}

export interface UpdateExpenseInput extends Partial<CreateExpenseInput> {}

export interface ExpenseFilters {
  category?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
