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

export type UpdateExpenseInput = Partial<CreateExpenseInput>;

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
