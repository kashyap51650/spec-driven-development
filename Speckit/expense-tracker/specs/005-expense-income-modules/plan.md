# Implementation Plan: Expense and Income Modules

**Branch**: `005-expense-income-modules` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/005-expense-income-modules/spec.md`

## Summary

Build full CRUD for Expenses and Income — two symmetric modules sharing the same architecture. Expenses are built first (Phases 1–3), then Income (Phases 4–5). Each layer is completed before the next begins. The full stack for both modules is: types + constants + validation schemas → repositories → services → data functions → Server Actions → UI components → page. Filter state lives in URL search params; list refreshes via Next.js Server Component re-render triggered by `revalidatePath`.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16 App Router, Shadcn UI (CLI-managed), Tailwind CSS, lucide-react, React Hook Form 7.x, Zod 4.x, Prisma 6.x

**Storage**: MongoDB via Prisma (existing `db` singleton in `src/lib/prisma.ts`)

**Testing**: `tsc --noEmit` (TypeScript compilation gate — zero errors required)

**Target Platform**: Web — desktop (≥768px) and mobile (<768px)

**Project Type**: Next.js 16 App Router web application, server-first

**Performance Goals**: List update visible within 2 seconds after any mutation (SC-002); filter result visible within 1 second (SC-003)

**Constraints**: No new runtime dependencies; Shadcn components installed via CLI only; all Next.js app files under `src/app/` (not root `app/`)

**Scale/Scope**: Single-user sessions; all records for one user fetched in a single query (no pagination in this version)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status | Notes |
|---|---|---|---|
| I. Server-First Data Access | `getExpenses`, `getIncomes` in `src/data/`; no `useEffect` fetching; mutations as Server Actions only | ✅ Pass | All reads in RSC via data functions; 6 Server Actions handle all mutations |
| II. Architecture Layering | RSC → `src/data/` → `src/server/services/` → `src/server/repositories/` → Prisma; every repo method scoped by `userId` | ✅ Pass | Full 4-layer stack for both modules; `userId` passed to every repository call |
| III. TypeScript Discipline | `interface` for all props; explicit return types on all functions; no `any`; Zod schemas export inferred types | ✅ Pass | 4 type interfaces per module; all component props use `interface`; Zod schemas export named types |
| IV. Response Contract | Data functions return directly / throw; Server Actions return `{ success: boolean; message: string }`; `revalidatePath` called before `return` on success | ✅ Pass | `getExpenses`/`getIncomes` throw on session failure; all 6 actions call `revalidatePath` before returning success |
| V. UI Component Integrity | 9 Shadcn components installed via CLI before any code; React Hook Form + `zodResolver`; lucide-react icons only | ✅ Pass | Layer 1 installs all 9 components; `zodResolver` used in both form components; all icons from lucide-react |
| VI. Formatting & Localisation | `formatCurrency`: `Intl.NumberFormat("en-IN", { style:"currency", currency:"INR" })`; `formatDate`: `Intl.DateTimeFormat("en-IN", ...)`; both in `src/utils/` | ✅ Pass | Two utility files centralise all formatting; no hardcoded currency symbols elsewhere |
| VII. Auth & Session Management | `getSession()` called internally in all data functions and Server Actions; Server Actions MUST NOT accept `userId` as argument | ✅ Pass | Both data functions call `getSession()` first; actions call `getSession()` internally |
| VIII. UI Interaction Patterns | Dialog for create/edit; AlertDialog for delete; Table+Card responsive layout; URL search params for filters; existing `loading.tsx`+`error.tsx` per page; `EmptyState` shared component | ✅ Pass | All patterns satisfied; `loading.tsx` and `error.tsx` already exist from feature 004 — not replaced |

**Complexity Tracking**: No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/005-expense-income-modules/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── component-props.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── types/
│   ├── expense.ts                                    ← NEW
│   └── income.ts                                     ← NEW
│
├── constants/
│   ├── expense.ts                                    ← NEW
│   └── income.ts                                     ← NEW
│
├── utils/
│   ├── formatCurrency.ts                             ← NEW
│   └── formatDate.ts                                 ← NEW
│
├── components/shared/
│   └── EmptyState.tsx                                ← NEW
│
├── server/
│   ├── validations/
│   │   ├── expense.validation.ts                     ← NEW
│   │   └── income.validation.ts                      ← NEW
│   ├── repositories/
│   │   ├── expense.repository.ts                     ← NEW
│   │   └── income.repository.ts                      ← NEW
│   └── services/
│       ├── expense.service.ts                        ← NEW
│       └── income.service.ts                         ← NEW
│
├── data/
│   ├── expenses.ts                                   ← NEW
│   └── income.ts                                     ← NEW
│
├── actions/
│   ├── expense.actions.ts                            ← NEW
│   └── income.actions.ts                             ← NEW
│
└── features/
    ├── expenses/components/
    │   ├── ExpenseForm.tsx                           ← NEW
    │   ├── CreateExpenseButton.tsx                   ← NEW
    │   ├── CreateExpenseDialog.tsx                   ← NEW
    │   ├── EditExpenseButton.tsx                     ← NEW
    │   ├── EditExpenseDialog.tsx                     ← NEW
    │   ├── DeleteExpenseButton.tsx                   ← NEW
    │   ├── ExpenseCard.tsx                           ← NEW
    │   ├── ExpenseCardList.tsx                       ← NEW
    │   ├── ExpenseTable.tsx                          ← NEW
    │   └── ExpenseFiltersBar.tsx                     ← NEW
    └── income/components/
        ├── IncomeForm.tsx                            ← NEW
        ├── CreateIncomeButton.tsx                    ← NEW
        ├── CreateIncomeDialog.tsx                    ← NEW
        ├── EditIncomeButton.tsx                      ← NEW
        ├── EditIncomeDialog.tsx                      ← NEW
        ├── DeleteIncomeButton.tsx                    ← NEW
        ├── IncomeCard.tsx                            ← NEW
        ├── IncomeCardList.tsx                        ← NEW
        ├── IncomeTable.tsx                           ← NEW
        └── IncomeFiltersBar.tsx                      ← NEW

src/app/(dashboard)/
├── expenses/
│   ├── page.tsx                                      ← REPLACE (placeholder → full implementation)
│   ├── loading.tsx                                   ← KEEP (already exists from feature 004)
│   └── error.tsx                                     ← KEEP (already exists from feature 004)
└── income/
    ├── page.tsx                                      ← REPLACE (placeholder → full implementation)
    ├── loading.tsx                                   ← KEEP (already exists from feature 004)
    └── error.tsx                                     ← KEEP (already exists from feature 004)
```

**Structure Decision**: Single Next.js App Router project under `src/`. Feature components in `src/features/{expenses,income}/components/` follow the established `src/features/auth/` pattern. Shared utilities in `src/utils/`, shared components in `src/components/shared/`. No new Prisma models required.

## Implementation Layers

Ordered strictly by dependency. Complete each layer before starting the next. Build Expenses end-to-end (Phases 1–3) before touching any Income file.

---

### Phase 1 — Foundation (Shared by Both Modules)

#### Layer 1 — Install Shadcn Components

Run before writing any code. Verify absence in `src/components/ui/` first.

```bash
npx shadcn@latest add table
npx shadcn@latest add dialog
npx shadcn@latest add alert-dialog
npx shadcn@latest add select
npx shadcn@latest add textarea
npx shadcn@latest add checkbox
npx shadcn@latest add badge
npx shadcn@latest add popover
npx shadcn@latest add calendar
```

#### Layer 2 — `src/utils/formatCurrency.ts`

```typescript
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
  }).format(amount);
}
```

#### Layer 3 — `src/utils/formatDate.ts`

```typescript
export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
```

Note: `en-IN` with these options produces "09 Jun 2026" ordering (day-month-year). This satisfies the constitution's `MMM dd, yyyy` intent with the locale-appropriate date representation.

#### Layer 4 — `src/components/shared/EmptyState.tsx` — Server Component

Props: `interface EmptyStateProps { title: string; description: string; action?: React.ReactNode }`

Layout: `div.flex.flex-col.items-center.justify-center.py-16.text-center`:
- `Inbox` icon from lucide-react (`h-12 w-12 text-muted-foreground mb-4`)
- `<h3 className="text-lg font-semibold mb-1">{title}</h3>`
- `<p className="text-sm text-muted-foreground mb-6 max-w-sm">{description}</p>`
- `{action}` (optional slot)

#### Layer 5 — `src/types/expense.ts`

Four exports: `interface Expense`, `interface CreateExpenseInput`, `type UpdateExpenseInput = Partial<CreateExpenseInput>`, `interface ExpenseFilters`. See [data-model.md](./data-model.md) for exact field listings.

#### Layer 6 — `src/types/income.ts`

Four exports: `interface Income`, `interface CreateIncomeInput`, `type UpdateIncomeInput = Partial<CreateIncomeInput>`, `interface IncomeFilters`. See [data-model.md](./data-model.md).

#### Layer 7 — `src/constants/expense.ts`

Exports `EXPENSE_CATEGORIES` (10 values, `as const`), `ExpenseCategory` (typeof type), `ACCOUNT_TYPES` (4 values, `as const`), `AccountType` (typeof type). See [data-model.md](./data-model.md) for exact values.

#### Layer 8 — `src/constants/income.ts`

Exports `INCOME_SOURCES` (6 values, `as const`), `IncomeSource` (typeof type). `ACCOUNT_TYPES` is NOT duplicated here — income components import it from `@/constants/expense`.

---

### Phase 2 — Expense Backend

#### Layer 9 — `src/server/validations/expense.validation.ts`

Imports `EXPENSE_CATEGORIES`, `ACCOUNT_TYPES` from `@/constants/expense`.

`createExpenseSchema`: `title` (min 1), `amount` (positive), `category` (`z.enum(EXPENSE_CATEGORIES)`), `account` (`z.enum(ACCOUNT_TYPES)`), `date` (`z.coerce.date()`), `notes` (optional string), `tags` (optional string array, default `[]`), `recurring` (optional boolean, default `false`).

Exports:
- `createExpenseSchema` + `export type CreateExpenseInput = z.infer<typeof createExpenseSchema>`
- `updateExpenseSchema = createExpenseSchema.partial()` + `export type UpdateExpenseInput = z.infer<typeof updateExpenseSchema>`

#### Layer 10 — `src/server/repositories/expense.repository.ts`

Imports: `db` from `@/lib/prisma`; types from `@/types/expense`.

Constant `EXPENSE_SELECT` — all 12 fields set to `true` (excludes no field; `userId` IS selected for mapping).

`mapToExpense(raw)` helper — returns `Expense` from Prisma raw result.

Five exported async functions (all with explicit return types):

**`findAll(userId: string, filters?: ExpenseFilters): Promise<Expense[]>`**
```
where = {
  userId,
  ...(category filter → exact match),
  ...(date range → gte/lte on date field),
  ...(search → title contains, mode: "insensitive" as const),
}
db.expense.findMany({ where, select: EXPENSE_SELECT, orderBy: { date: "desc" } })
```

**`findById(id: string, userId: string): Promise<Expense | null>`**
```
db.expense.findUnique({ where: { id }, select: EXPENSE_SELECT })
→ return null if not found OR if raw.userId !== userId
```
Note: scopes by `userId` after the lookup to prevent cross-user access.

**`create(userId: string, data: CreateExpenseInput): Promise<Expense>`**
```
db.expense.create({ data: { ...data, userId }, select: EXPENSE_SELECT })
```

**`update(id: string, userId: string, data: UpdateExpenseInput): Promise<Expense>`**
```
db.expense.update({ where: { id }, data, select: EXPENSE_SELECT })
```
The service verifies ownership before calling this.

**`deleteById(id: string, userId: string): Promise<void>`**
```
db.expense.delete({ where: { id } })
```
The service verifies ownership before calling this.

**`getTotalByCategory(userId: string, startDate: Date, endDate: Date): Promise<{ category: string; total: number }[]>`**
```
db.expense.groupBy({
  by: ["category"],
  where: { userId, date: { gte: startDate, lte: endDate } },
  _sum: { amount: true },
})
→ map to [{ category, total: _sum.amount ?? 0 }]
```
Reserved for Dashboard feature — not called by any component in this feature.

#### Layer 11 — `src/server/services/expense.service.ts`

Imports: `* as expenseRepository` from `@/server/repositories/expense.repository`; validation schemas from `@/server/validations/expense.validation`; types from `@/types/expense`.

Five exported async functions:

- **`getAll(userId, filters?)`** → delegates to `expenseRepository.findAll`
- **`getById(id, userId)`** → calls `findById`; throws `new Error("Expense not found")` if null; returns `Expense`
- **`create(userId, input)`** → `createExpenseSchema.parse(input)`; then `expenseRepository.create`
- **`update(id, userId, input)`** → calls `getById(id, userId)` first (ownership check); `updateExpenseSchema.parse(input)`; then `expenseRepository.update`
- **`deleteExpense(id, userId)`** → calls `getById(id, userId)` first (ownership check); then `expenseRepository.deleteById`

Note: function is named `deleteExpense` (not `delete`) to avoid the reserved keyword.

#### Layer 12 — `src/data/expenses.ts`

Server-only. Imports: `getSession` from `@/lib/auth`; `* as expenseService`; types.

```typescript
export async function getExpenses(filters?: ExpenseFilters): Promise<Expense[]> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return expenseService.getAll(session.userId, filters);
}

export async function getExpenseById(id: string): Promise<Expense> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return expenseService.getById(id, session.userId);
}
```

#### Layer 13 — `src/actions/expense.actions.ts`

Top of file: `"use server"`. Imports: `revalidatePath` from `next/cache`; `getSession` from `@/lib/auth`; `* as expenseService`.

**`createExpenseAction(formData: FormData)`**:
1. `getSession()` → throw if null
2. Extract all fields from `formData`
3. Tags: `(formData.get("tags") as string ?? "").split(",").map(t => t.trim()).filter(Boolean)`
4. `expenseService.create(userId, { title, amount: Number(amount), category, account, date: new Date(dateStr), notes: notes || undefined, tags, recurring: recurring === "true" })`
5. `revalidatePath("/expenses")`
6. `return { success: true, message: "Expense created" }`
7. Catch: `return { success: false, message: (error as Error).message }`

**`updateExpenseAction(id: string, formData: FormData)`**: same extraction pattern; calls `expenseService.update(id, userId, parsed)`; `revalidatePath("/expenses")`; returns `{ success: true, message: "Expense updated" }`.

**`deleteExpenseAction(id: string)`**: `getSession()`; `expenseService.deleteExpense(id, userId)`; `revalidatePath("/expenses")`; returns `{ success: true, message: "Expense deleted" }`.

---

### Phase 3 — Expense UI

All files in `src/features/expenses/components/`. See [contracts/component-props.md](./contracts/component-props.md) for all prop interfaces.

#### Layer 14 — `ExpenseForm.tsx` — Client Component

`"use client"`. Imports: React Hook Form + `zodResolver`; `useTransition`; `useState`; validation schemas; constants; `createExpenseAction` / `updateExpenseAction`; `SubmitButton` from `src/features/auth/components/SubmitButton.tsx`; Shadcn Input, Select, Textarea, Checkbox, Popover, Calendar; `formatDate` from utils.

Props: `interface ExpenseFormProps { mode: "create" | "edit"; expense?: Expense; onSuccess: () => void }`

`useForm({ resolver: zodResolver(mode === "create" ? createExpenseSchema : updateExpenseSchema), defaultValues: ... })`

Default values for `mode === "edit"`: pre-fill all fields from `expense` prop.

Fields layout (each wrapped in `FormField`-style div with label + control + error):
- `title`: `Input` via `register("title")`
- `amount`: `Input type="number" step="0.01"` via `register("amount", { valueAsNumber: true })`
- `category`: `Controller` → Shadcn `Select` with `SelectItem` for each `EXPENSE_CATEGORIES` value
- `account`: `Controller` → Shadcn `Select` with `SelectItem` for each `ACCOUNT_TYPES` value
- `date`: `Controller` → `Popover` trigger button showing `formatDate(field.value)` or "Pick a date" + `Calendar mode="single" selected={field.value} onSelect={field.onChange}`
- `notes`: `Textarea` via `register("notes")`
- `tags`: `Controller` — `Input value={field.value?.join(", ") ?? ""}` with `onChange` that calls `field.onChange(e.target.value.split(",").map(t => t.trim()))`
- `recurring`: `Controller` → `Checkbox checked={field.value} onCheckedChange={field.onChange}` with inline label

Submit handler (`handleSubmit`): builds `FormData` manually, calls action in `startTransition`, calls `onSuccess()` on `result.success`, sets local `formError` state on failure.

Error display: `<p className="text-sm text-destructive">{formError}</p>` below submit button.

Submit button: `<SubmitButton isPending={isPending}>` — shows loading state while pending.

#### Layer 15 — `CreateExpenseButton.tsx` + `CreateExpenseDialog.tsx`

**`CreateExpenseButton.tsx`** (`"use client"`): `useState<boolean>(false)` for `open`. Renders `<Button onClick={() => setOpen(true)}>+ Add Expense</Button>` + `<CreateExpenseDialog open={open} onOpenChange={setOpen} />`.

**`CreateExpenseDialog.tsx`** (`"use client"`): Props `{ open: boolean; onOpenChange: (open: boolean) => void }`. Renders Shadcn `Dialog` with `DialogHeader` title "Add Expense" and `<ExpenseForm mode="create" onSuccess={() => onOpenChange(false)} />`.

#### Layer 16 — `EditExpenseButton.tsx` + `EditExpenseDialog.tsx`

**`EditExpenseButton.tsx`** (`"use client"`): Props `{ expense: Expense }`. `useState<boolean>(false)` for `open`. Renders `<Button variant="ghost" size="icon"><Pencil className="h-4 w-4" /></Button>` + `<EditExpenseDialog expense={expense} open={open} onOpenChange={setOpen} />`.

**`EditExpenseDialog.tsx`** (`"use client"`): Props `{ expense: Expense; open: boolean; onOpenChange: (open: boolean) => void }`. Dialog title "Edit Expense" + `<ExpenseForm mode="edit" expense={expense} onSuccess={() => onOpenChange(false)} />`.

#### Layer 17 — `DeleteExpenseButton.tsx` — Client Component

Props: `{ id: string }`. Uses `useTransition` for `isPending`. `useState<boolean>(false)` for AlertDialog open.

Renders:
- `<Button variant="ghost" size="icon" onClick={() => setOpen(true)}><Trash2 className="h-4 w-4" /></Button>`
- Shadcn `AlertDialog` (controlled by `open`):
  - `AlertDialogTitle`: "Delete Expense"
  - `AlertDialogDescription`: "This will permanently delete this expense. This action cannot be undone."
  - Cancel: `<AlertDialogCancel>`
  - Confirm: `<AlertDialogAction disabled={isPending} onClick={() => startTransition(async () => { const r = await deleteExpenseAction(id); if (!r.success) { /* show error */ } setOpen(false); })}>`

#### Layer 18 — `ExpenseCard.tsx` — Server Component

Props: `{ expense: Expense }`. Shadcn `Card`:
- `CardHeader`: flex row — title (left) + `formatDate(expense.date)` (right, `text-sm text-muted-foreground`)
- `CardContent`: `formatCurrency(expense.amount)` (`text-2xl font-bold text-red-600`) + `<Badge variant="secondary">{expense.category}</Badge>` + account text
- `CardFooter`: `{expense.notes && <p className="text-sm text-muted-foreground flex-1">{expense.notes}</p>}` + `<EditExpenseButton>` + `<DeleteExpenseButton>` aligned right

#### Layer 19 — `ExpenseCardList.tsx` — Server Component

Props: `{ expenses: Expense[] }`. `div.flex.flex-col.gap-3.block.md:hidden` mapping each expense to `<ExpenseCard expense={expense} />`.

#### Layer 20 — `ExpenseTable.tsx` — Server Component

Props: `{ expenses: Expense[] }`. `div.hidden.md:block`. Shadcn `Table` with header row: Date | Title | Category | Account | Amount | Actions.

Each `TableRow`:
- Date: `formatDate(expense.date)` (`text-muted-foreground text-sm`)
- Title: `expense.title` (`font-medium`)
- Category: `<Badge variant="secondary">{expense.category}</Badge>`
- Account: `expense.account`
- Amount: `formatCurrency(expense.amount)` (`text-red-600 font-medium text-right`)
- Actions: `<div className="flex gap-1"><EditExpenseButton expense={expense} /><DeleteExpenseButton id={expense.id} /></div>`

#### Layer 21 — `ExpenseFiltersBar.tsx` — Client Component

Props: `{ category?: string; startDate?: string; endDate?: string; search?: string }`. `"use client"`.

Uses `useRouter()` and `usePathname()`. **Never `useState` for filter values** — they are derived from props.

Internal `updateParam(key: string, value: string | undefined)` helper: clones current `URLSearchParams`, sets or deletes the key, calls `router.push(pathname + "?" + params.toString())`.

Controls in a `div.flex.flex-wrap.gap-3.mb-4`:
1. **Search** `<Input placeholder="Search expenses..." defaultValue={search}/>` — `onChange` debounced 400ms via `useRef` timeout, calls `updateParam("search", value || undefined)`
2. **Category** `<Select value={category ?? ""} onValueChange={v => updateParam("category", v || undefined)}>` — first item is `<SelectItem value="">All Categories</SelectItem>` then one per `EXPENSE_CATEGORIES`
3. **Start date** `<Popover>` trigger "From" or formatted date + `<Calendar mode="single" selected={startDate ? new Date(startDate) : undefined} onSelect={d => updateParam("startDate", d?.toISOString())}`
4. **End date** same pattern for "To" / `endDate`
5. **Clear all** `<Button variant="ghost" onClick={() => router.push(pathname)}>Clear all</Button>` — only rendered if `category || startDate || endDate || search`

#### Layer 22 — `src/app/(dashboard)/expenses/page.tsx` — Server Component (REPLACE placeholder)

```typescript
interface ExpensesPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}

export default async function ExpensesPage({ searchParams }: ExpensesPageProps): Promise<React.JSX.Element> {
  const params = await searchParams;
  const filters: ExpenseFilters = {
    category: params.category,
    startDate: params.startDate,
    endDate: params.endDate,
    search: params.search,
  };
  const expenses = await getExpenses(filters);
  // render...
}
```

Renders: page header row (`<h1>Expenses</h1>` + `<CreateExpenseButton />`); `<ExpenseFiltersBar ...filters />`; conditional on `expenses.length === 0` → `<EmptyState title="No expenses yet" description="..." action={<CreateExpenseButton />} />` else `<ExpenseTable>` (hidden md:block) + `<ExpenseCardList>` (block md:hidden).

---

### Phase 4 — Income Backend

Phases 4–5 mirror Phases 2–3 exactly. All differences are listed below; everything else is identical.

#### Layer 23 — `src/server/validations/income.validation.ts`

Fields: `title` (min 1), `amount` (positive), `source` (`z.enum(INCOME_SOURCES)`), `account` (`z.enum(ACCOUNT_TYPES)`), `date` (`z.coerce.date()`), `notes` (optional). No `tags`, no `recurring`.

Exports: `createIncomeSchema`, `CreateIncomeInput`, `updateIncomeSchema`, `UpdateIncomeInput`.

#### Layer 24 — `src/server/repositories/income.repository.ts`

Same pattern as expense repository. `INCOME_SELECT` — all 10 income fields. Filter uses `source` (not `category`). Extra method:

**`getMonthlyTotal(userId: string, year: number, month: number): Promise<number>`**
```
const start = new Date(year, month - 1, 1);
const end = new Date(year, month, 0, 23, 59, 59); // last day of month
const rows = await db.income.findMany({ where: { userId, date: { gte: start, lte: end } }, select: { amount: true } });
return rows.reduce((sum, r) => sum + r.amount, 0);
```
Reserved for Dashboard — not called in this feature.

#### Layer 25 — `src/server/services/income.service.ts`

Same pattern as expense service. `getById` throws `"Income not found"`. Delete method named `deleteIncome(id, userId)`.

#### Layer 26 — `src/data/income.ts`

Exports `getIncomes(filters?: IncomeFilters): Promise<Income[]>` and `getIncomeById(id: string): Promise<Income>`. Same session-check pattern.

#### Layer 27 — `src/actions/income.actions.ts`

Exports `createIncomeAction`, `updateIncomeAction`, `deleteIncomeAction`. FormData extraction: same pattern, no `tags` or `recurring`. `revalidatePath("/income")` on all three.

---

### Phase 5 — Income UI

All in `src/features/income/components/`. Identical to Expenses UI with these differences:

| Component | Difference from Expense equivalent |
|---|---|
| `IncomeTable` | Columns: Date \| Title \| Source \| Account \| Amount \| Actions; amount in `text-green-600` |
| `IncomeCard` | Amount in `text-green-600`; shows `income.source` instead of category |
| `IncomeFiltersBar` | `source` prop/param instead of `category`; `INCOME_SOURCES` for select options; `updateParam("source", ...)` |
| `CreateIncomeButton` | Button label "+ Add Income"; opens `CreateIncomeDialog` |
| `CreateIncomeDialog` | Title "Add Income"; contains `IncomeForm mode="create"` |
| `EditIncomeDialog` | Title "Edit Income" |
| `DeleteIncomeButton` | AlertDialog description "…permanently delete this income record…"; calls `deleteIncomeAction` |
| `IncomeForm` | Schema: `createIncomeSchema`/`updateIncomeSchema`; no tags field, no recurring field; `source` Select using `INCOME_SOURCES`; calls income actions |

#### Layer 36 — `src/app/(dashboard)/income/page.tsx` — Server Component (REPLACE placeholder)

Same structure as expenses page. Reads `source` param (not `category`). Calls `getIncomes(filters)`. `<EmptyState title="No income yet" description="Track your earnings by adding your first income record." .../>`. Renders income variants of all components.
