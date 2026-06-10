export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
] as const;

export type IncomeSource = (typeof INCOME_SOURCES)[number];
