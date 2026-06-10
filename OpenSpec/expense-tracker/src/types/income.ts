export interface Income {
  id: string;
  title: string;
  amount: number;
  source: string;
  account: string;
  date: Date;
  notes: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateIncomeInput {
  title: string;
  amount: number;
  source: string;
  account: string;
  date: Date;
  notes?: string;
}

export type UpdateIncomeInput = Partial<CreateIncomeInput>;

export interface IncomeFilters {
  source?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
