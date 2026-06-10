# Data Model: Expense and Income Modules

**Feature**: `005-expense-income-modules` | **Date**: 2026-06-10

Both Expense and Income entities already exist in the Prisma schema (`schema.prisma`). This feature adds no new schema migrations. All type definitions, validation schemas, and constants are new TypeScript files.

---

## Existing Entity: Expense (read/write in this feature)

Defined in `schema.prisma`. No schema changes required.

| Field | Prisma Type | TS Type | Notes |
|---|---|---|---|
| `id` | `String @id @ObjectId` | `string` | MongoDB ObjectId, auto-generated |
| `title` | `String` | `string` | Min 1 character; user-provided |
| `amount` | `Float` | `number` | Must be > 0 |
| `category` | `String` | `string` | Constrained to `EXPENSE_CATEGORIES` enum |
| `account` | `String` | `string` | Constrained to `ACCOUNT_TYPES` enum |
| `date` | `DateTime` | `Date` | User-selected; used for sorting and date-range filter |
| `notes` | `String?` | `string \| null` | Optional free text |
| `tags` | `String[]` | `string[]` | Optional; zero or more labels; stored as entered, split from comma-separated form input |
| `recurring` | `Boolean @default(false)` | `boolean` | Display-only flag; no scheduling logic in this feature |
| `userId` | `String @ObjectId` | `string` | Foreign key to `User.id`; every query MUST be scoped by this |
| `createdAt` | `DateTime @default(now())` | `Date` | Auto-set |
| `updatedAt` | `DateTime @updatedAt` | `Date` | Auto-updated |

**Access patterns**:
- `findAll(userId, filters?)` — list page; all queries scoped by `userId`; sorted by `date desc`
- `findById(id, userId)` — edit/delete; scoped by both `id` AND `userId` (prevents cross-user access)
- `create(userId, data)` — form submission
- `update(id, userId, data)` — form submission; service verifies ownership via `findById` first
- `deleteById(id, userId)` — alert-dialog confirmation; service verifies ownership via `findById` first
- `getTotalByCategory(userId, startDate, endDate)` — reserved for Dashboard; not called by any component in this feature

---

## Existing Entity: Income (read/write in this feature)

Defined in `schema.prisma`. No schema changes required.

| Field | Prisma Type | TS Type | Notes |
|---|---|---|---|
| `id` | `String @id @ObjectId` | `string` | MongoDB ObjectId, auto-generated |
| `title` | `String` | `string` | Min 1 character; user-provided |
| `amount` | `Float` | `number` | Must be > 0 |
| `source` | `String` | `string` | Constrained to `INCOME_SOURCES` enum |
| `account` | `String` | `string` | Constrained to `ACCOUNT_TYPES` enum (shared with Expense) |
| `date` | `DateTime` | `Date` | User-selected; used for sorting and date-range filter |
| `notes` | `String?` | `string \| null` | Optional free text |
| `userId` | `String @ObjectId` | `string` | Foreign key to `User.id`; every query MUST be scoped by this |
| `createdAt` | `DateTime @default(now())` | `Date` | Auto-set |
| `updatedAt` | `DateTime @updatedAt` | `Date` | Auto-updated |

**Access patterns**: Identical to Expense (minus `tags`, `recurring`, and `getTotalByCategory`).
- `findAll / findById / create / update / deleteById` — same scoping rules
- `getMonthlyTotal(userId, year, month)` — reserved for Dashboard; sums `amount` for all income records in the given calendar month

---

## New TypeScript Interfaces: `src/types/expense.ts`

```typescript
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
  startDate?: string;   // ISO string from URL query param, parsed to Date in repository
  endDate?: string;     // ISO string from URL query param, parsed to Date in repository
  search?: string;
}
```

---

## New TypeScript Interfaces: `src/types/income.ts`

```typescript
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
  startDate?: string;
  endDate?: string;
  search?: string;
}
```

---

## New Constants: `src/constants/expense.ts`

```typescript
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

export type ExpenseCategory = typeof EXPENSE_CATEGORIES[number];

export const ACCOUNT_TYPES = [
  "Cash",
  "Bank Account",
  "Credit Card",
  "Savings",
] as const;

export type AccountType = typeof ACCOUNT_TYPES[number];
```

**Note**: `ACCOUNT_TYPES` is shared — income components import it from `@/constants/expense`. No `ACCOUNT_TYPES` duplication in `income.ts`.

---

## New Constants: `src/constants/income.ts`

```typescript
export const INCOME_SOURCES = [
  "Salary",
  "Freelance",
  "Business",
  "Investment",
  "Gift",
  "Other",
] as const;

export type IncomeSource = typeof INCOME_SOURCES[number];
```

---

## New Validation Schemas: `src/server/validations/expense.validation.ts`

```typescript
import { z } from "zod";
import { EXPENSE_CATEGORIES, ACCOUNT_TYPES } from "@/constants/expense";

export const createExpenseSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  category: z.enum(EXPENSE_CATEGORIES, {
    errorMap: () => ({ message: "Please select a category" }),
  }),
  account: z.enum(ACCOUNT_TYPES, {
    errorMap: () => ({ message: "Please select an account type" }),
  }),
  date: z.coerce.date(),
  notes: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  recurring: z.boolean().optional().default(false),
});

export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const updateExpenseSchema = createExpenseSchema.partial();
export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>;
```

---

## New Validation Schemas: `src/server/validations/income.validation.ts`

```typescript
import { z } from "zod";
import { INCOME_SOURCES } from "@/constants/income";
import { ACCOUNT_TYPES } from "@/constants/expense";

export const createIncomeSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.number().positive("Amount must be greater than zero"),
  source: z.enum(INCOME_SOURCES, {
    errorMap: () => ({ message: "Please select a source" }),
  }),
  account: z.enum(ACCOUNT_TYPES, {
    errorMap: () => ({ message: "Please select an account type" }),
  }),
  date: z.coerce.date(),
  notes: z.string().optional(),
});

export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export const updateIncomeSchema = createIncomeSchema.partial();
export type UpdateIncomeInput = z.infer<typeof updateIncomeSchema>;
```

---

## Client-Side Form Schemas

The server validation schemas above are reused in `ExpenseForm` / `IncomeForm` via `zodResolver`. The only mismatch is the `tags` field: the server schema has `z.array(z.string())` but the form input is a comma-separated text field. The form manages `tags` as a `string[]` via a custom `Controller` that converts between comma-separated display and array value (see contracts).

---

## Data Flow

### Read Path (Expenses)

```
Browser navigates to /expenses?category=Food+%26+Dining&search=lunch
  ↓ Next.js App Router: middleware validates JWT cookie
  ↓ src/app/(dashboard)/layout.tsx (Server Component)
  ↓ src/app/(dashboard)/expenses/page.tsx (Server Component)
    → reads searchParams: { category: "Food & Dining", search: "lunch" }
    → calls getExpenses({ category: "Food & Dining", search: "lunch" })
  ↓ src/data/expenses.ts :: getExpenses(filters)
    → getSession() → { userId, email }
    → expenseService.getAll(userId, filters)
  ↓ src/server/services/expense.service.ts :: getAll(userId, filters)
    → expenseRepository.findAll(userId, filters)
  ↓ src/server/repositories/expense.repository.ts :: findAll(userId, filters)
    → db.expense.findMany({ where: { userId, category: "Food & Dining", title: { contains: "lunch", mode: "insensitive" } }, orderBy: { date: "desc" } })
  → Expense[] returned up the chain
  ↓ page.tsx renders:
    <ExpenseTable expenses={[...]} />   (hidden md:block)
    <ExpenseCardList expenses={[...]} /> (block md:hidden)
    or <EmptyState> if list is empty
```

### Write Path (Create Expense)

```
User fills ExpenseForm and clicks Submit
  ↓ RHF handleSubmit validates against createExpenseSchema
  ↓ ExpenseForm builds FormData manually, calls createExpenseAction(formData) in startTransition
  ↓ src/actions/expense.actions.ts :: createExpenseAction(formData)
    → getSession() → { userId } (Server Action — userId NOT accepted as arg)
    → parses FormData fields (tags: split by comma)
    → expenseService.create(userId, parsedInput)
  ↓ src/server/services/expense.service.ts :: create(userId, input)
    → createExpenseSchema.parse(input) (server-side validation)
    → expenseRepository.create(userId, data)
  ↓ src/server/repositories/expense.repository.ts :: create(userId, data)
    → db.expense.create({ data: { ...data, userId } })
  → revalidatePath("/expenses") triggered in action
  → Next.js re-renders /expenses Server Component with fresh data
  → Dialog closes (onSuccess callback)
```

---

## Filter Behaviour Reference

| Filter | URL param | Prisma clause | Behaviour |
|---|---|---|---|
| Category (expense) | `category` | `{ category: value }` | Exact string match |
| Source (income) | `source` | `{ source: value }` | Exact string match |
| Start date | `startDate` | `{ date: { gte: new Date(value) } }` | Inclusive lower bound |
| End date | `endDate` | `{ date: { lte: new Date(value) } }` | Inclusive upper bound |
| Title search | `search` | `{ title: { contains: value, mode: "insensitive" } }` | Case-insensitive partial match |
| Sort | (always) | `orderBy: { date: "desc" }` | Newest first; not user-configurable |

---

## No Schema Migrations Required

Both `Expense` and `Income` models are fully defined in the existing Prisma schema. This feature creates no new models, fields, or indexes.
