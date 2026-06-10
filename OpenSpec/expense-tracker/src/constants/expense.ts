export const EXPENSE_CATEGORIES = [
  "Food & Dining",
  "Transport",
  "Shopping",
  "Entertainment",
  "Health",
  "Utilities",
  "Rent",
  "Education",
  "Travel",
  "Other",
] as const;

export const ACCOUNT_TYPES = [
  "Cash",
  "Bank Account",
  "Credit Card",
  "Savings",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];
export type AccountType = (typeof ACCOUNT_TYPES)[number];
