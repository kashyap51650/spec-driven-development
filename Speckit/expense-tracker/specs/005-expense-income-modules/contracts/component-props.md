# Component Props Contracts: Expense and Income Modules

**Feature**: `005-expense-income-modules` | **Date**: 2026-06-10

All components use `interface` (never `type alias`) for props, per constitution Principle III. Every component has an explicit return type of `React.JSX.Element`.

---

## Shared Components

### `src/components/shared/EmptyState.tsx` — Server Component

```typescript
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}
```

Renders: centered flex column — `Inbox` icon (lucide-react, `h-12 w-12 text-muted-foreground`), `<h3>` title, `<p>` description, optional action slot. Used for both "no records" and "no records match filter" states.

---

## Expense Components

All in `src/features/expenses/components/`.

---

### `ExpenseTable.tsx` — Server Component

```typescript
interface ExpenseTableProps {
  expenses: Expense[];
}
```

Renders Shadcn `Table` with columns: **Date** | **Title** | **Category** (Badge) | **Account** | **Amount** | **Actions**.
- Amount: `formatCurrency(expense.amount)` in red (`text-red-600 font-medium`)
- Date: `formatDate(expense.date)`
- Category: Shadcn `Badge` (variant `secondary`)
- Actions cell: `<EditExpenseButton expense={expense} />` + `<DeleteExpenseButton id={expense.id} />`
- Visibility: `hidden md:block`

---

### `ExpenseCardList.tsx` — Server Component

```typescript
interface ExpenseCardListProps {
  expenses: Expense[];
}
```

Renders a `div.flex.flex-col.gap-3` mapping each expense to `<ExpenseCard expense={expense} />`.
Visibility: `block md:hidden`

---

### `ExpenseCard.tsx` — Server Component

```typescript
interface ExpenseCardProps {
  expense: Expense;
}
```

Renders Shadcn `Card`:
- `CardHeader`: title (left) + `formatDate(expense.date)` (right, `text-muted-foreground text-sm`)
- `CardContent`: amount (`formatCurrency(expense.amount)` in large red text) + Category Badge + account text
- `CardFooter`: notes (if present, `text-sm text-muted-foreground`) + `<EditExpenseButton>` + `<DeleteExpenseButton>` aligned right

---

### `ExpenseFiltersBar.tsx` — Client Component (`"use client"`)

```typescript
interface ExpenseFiltersBarProps {
  category?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
```

Uses `useRouter()` and `usePathname()`. Never uses `useState` for filter values.

Controls (all changes push to URL via `router.push`):
1. **Search**: `Input` with 400ms debounce; updates `search` param
2. **Category**: Shadcn `Select`; options: "All Categories" (clears param) + each `EXPENSE_CATEGORIES` value; updates `category` param
3. **Start date**: Shadcn `Popover` + `Calendar`; updates `startDate` param as ISO string
4. **End date**: Shadcn `Popover` + `Calendar`; updates `endDate` param as ISO string
5. **Clear all**: `Button` (variant `ghost`), visible only when at least one filter is active; resets all four params

URL mutation helper (internal): build new `URLSearchParams` from current params, set/delete individual key, `router.push(pathname + "?" + params.toString())`.

---

### `CreateExpenseButton.tsx` — Client Component (`"use client"`)

```typescript
// No external props
```

Manages `open: boolean` via `useState`. Renders:
```
<Button onClick={() => setOpen(true)}>+ Add Expense</Button>
<CreateExpenseDialog open={open} onOpenChange={setOpen} />
```

---

### `CreateExpenseDialog.tsx` — Client Component (`"use client"`)

```typescript
interface CreateExpenseDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

Renders Shadcn `Dialog` with `DialogHeader` title "Add Expense" + `<ExpenseForm mode="create" onSuccess={() => onOpenChange(false)} />`.

---

### `EditExpenseButton.tsx` — Client Component (`"use client"`)

```typescript
interface EditExpenseButtonProps {
  expense: Expense;
}
```

Manages `open: boolean` via `useState`. Renders:
```
<Button variant="ghost" size="icon" onClick={() => setOpen(true)}>
  <Pencil className="h-4 w-4" />
</Button>
<EditExpenseDialog expense={expense} open={open} onOpenChange={setOpen} />
```

---

### `EditExpenseDialog.tsx` — Client Component (`"use client"`)

```typescript
interface EditExpenseDialogProps {
  expense: Expense;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

Renders Shadcn `Dialog` with title "Edit Expense" + `<ExpenseForm mode="edit" expense={expense} onSuccess={() => onOpenChange(false)} />`.

---

### `DeleteExpenseButton.tsx` — Client Component (`"use client"`)

```typescript
interface DeleteExpenseButtonProps {
  id: string;
}
```

Manages AlertDialog open state internally. Uses `useTransition` for pending state.

Renders:
- Ghost icon button with `Trash2` icon (triggers AlertDialog open)
- Shadcn `AlertDialog`:
  - Title: "Delete Expense"
  - Description: "This will permanently delete this expense. This action cannot be undone."
  - Cancel button + Confirm button (disabled + "Deleting…" text while `isPending`)
  - On confirm: `startTransition(() => deleteExpenseAction(id).then(...))` — shows toast/error on failure

---

### `ExpenseForm.tsx` — Client Component (`"use client"`)

```typescript
interface ExpenseFormProps {
  mode: "create" | "edit";
  expense?: Expense;
  onSuccess: () => void;
}
```

Uses `useForm` with `zodResolver(createExpenseSchema)` (create) or `zodResolver(updateExpenseSchema)` (edit).
Uses `useTransition` for pending state.

**Default values** when `mode === "edit"` and `expense` is provided:
```typescript
defaultValues: {
  title: expense.title,
  amount: expense.amount,
  category: expense.category,
  account: expense.account,
  date: expense.date,
  notes: expense.notes ?? "",
  tags: expense.tags,
  recurring: expense.recurring,
}
```

**Fields and controls**:

| Field | Control | RHF bind |
|---|---|---|
| `title` | `Input` | `register("title")` |
| `amount` | `Input type="number" step="0.01"` | `register("amount", { valueAsNumber: true })` |
| `category` | Shadcn `Select` + `SelectItem` per `EXPENSE_CATEGORIES` | `Controller` |
| `account` | Shadcn `Select` + `SelectItem` per `ACCOUNT_TYPES` | `Controller` |
| `date` | `Popover` trigger + `Calendar mode="single"` | `Controller` (value: `Date \| undefined`) |
| `notes` | Shadcn `Textarea` | `register("notes")` |
| `tags` | `Input` (comma-separated display) | `Controller` — `field.value.join(", ")` ↔ `field.onChange(str.split(",").map(t=>t.trim()))` |
| `recurring` | Shadcn `Checkbox` | `Controller` (checked: `field.value`, onCheckedChange: `field.onChange`) |

**Submit handler**:
```
handleSubmit(async (data) => {
  const fd = new FormData();
  fd.set("title", data.title);
  fd.set("amount", String(data.amount));
  fd.set("category", data.category);
  fd.set("account", data.account);
  fd.set("date", data.date.toISOString());
  fd.set("notes", data.notes ?? "");
  fd.set("tags", (data.tags ?? []).join(", "));
  fd.set("recurring", String(data.recurring ?? false));

  startTransition(async () => {
    const result = mode === "create"
      ? await createExpenseAction(fd)
      : await updateExpenseAction(expense!.id, fd);

    if (result.success) {
      onSuccess();
    } else {
      setFormError(result.message); // local useState string
    }
  });
})
```

**Error display**: a `<p className="text-sm text-destructive">` shown below the form when `formError` is non-null.

**Submit button**: `<SubmitButton isPending={isPending}>` from `src/features/auth/components/SubmitButton.tsx`.

---

## Income Components

All in `src/features/income/components/`. Identical structure to Expenses with the following differences.

---

### `IncomeTable.tsx` — Server Component

```typescript
interface IncomeTableProps {
  incomes: Income[];
}
```

Table columns: **Date** | **Title** | **Source** (Badge) | **Account** | **Amount** | **Actions**.
Amount: `formatCurrency(income.amount)` in green (`text-green-600 font-medium`).

---

### `IncomeCardList.tsx` — Server Component

```typescript
interface IncomeCardListProps {
  incomes: Income[];
}
```

---

### `IncomeCard.tsx` — Server Component

```typescript
interface IncomeCardProps {
  income: Income;
}
```

Same Card layout as ExpenseCard. Amount in green.

---

### `IncomeFiltersBar.tsx` — Client Component (`"use client"`)

```typescript
interface IncomeFiltersBarProps {
  source?: string;
  startDate?: string;
  endDate?: string;
  search?: string;
}
```

Same pattern as `ExpenseFiltersBar`. Category Select replaced by **Source Select** using `INCOME_SOURCES`. URL param name is `source` (not `category`). All other controls identical.

---

### `CreateIncomeButton.tsx` — Client Component

No external props. Same pattern as `CreateExpenseButton` — renders "+ Add Income" button + `<CreateIncomeDialog>`.

---

### `CreateIncomeDialog.tsx` — Client Component

```typescript
interface CreateIncomeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

Dialog title: "Add Income". Contains `<IncomeForm mode="create" onSuccess={() => onOpenChange(false)} />`.

---

### `EditIncomeButton.tsx` — Client Component

```typescript
interface EditIncomeButtonProps {
  income: Income;
}
```

Same pattern as `EditExpenseButton`.

---

### `EditIncomeDialog.tsx` — Client Component

```typescript
interface EditIncomeDialogProps {
  income: Income;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}
```

Dialog title: "Edit Income".

---

### `DeleteIncomeButton.tsx` — Client Component

```typescript
interface DeleteIncomeButtonProps {
  id: string;
}
```

AlertDialog description: "This will permanently delete this income record. This action cannot be undone."

---

### `IncomeForm.tsx` — Client Component (`"use client"`)

```typescript
interface IncomeFormProps {
  mode: "create" | "edit";
  income?: Income;
  onSuccess: () => void;
}
```

Same pattern as `ExpenseForm`. Differences:
- Schema: `createIncomeSchema` / `updateIncomeSchema`
- No `tags` field, no `recurring` field
- `source` field (Select with `INCOME_SOURCES`) instead of `category`
- `account` field (Select with `ACCOUNT_TYPES`) — same as ExpenseForm
- Default values use `income.source` instead of `income.category`
- Submit: calls `createIncomeAction` / `updateIncomeAction`

---

## Page Components

### `src/app/(dashboard)/expenses/page.tsx` — Server Component

```typescript
interface ExpensesPageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
```

**Note**: In Next.js 16 App Router, `searchParams` is a `Promise` — must be `await`ed.

```typescript
const params = await searchParams;
const filters: ExpenseFilters = {
  category: params.category,
  startDate: params.startDate,
  endDate: params.endDate,
  search: params.search,
};
const expenses = await getExpenses(filters);
```

Renders:
```
<div>
  <div className="flex items-center justify-between mb-6">
    <h1 className="text-2xl font-bold">Expenses</h1>
    <CreateExpenseButton />
  </div>
  <ExpenseFiltersBar category={filters.category} startDate={filters.startDate} endDate={filters.endDate} search={filters.search} />
  {expenses.length === 0 ? (
    <EmptyState
      title="No expenses yet"
      description="Track your spending by adding your first expense."
      action={<CreateExpenseButton />}
    />
  ) : (
    <>
      <ExpenseTable expenses={expenses} />     {/* hidden md:block */}
      <ExpenseCardList expenses={expenses} />  {/* block md:hidden */}
    </>
  )}
</div>
```

### `src/app/(dashboard)/income/page.tsx` — Server Component

```typescript
interface IncomePageProps {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}
```

Same structure as Expenses page. Reads `source` param instead of `category`. Calls `getIncomes(filters)`. Renders Income variants of all components.

---

## Server Action Signatures

### `src/actions/expense.actions.ts`

```typescript
"use server";

export async function createExpenseAction(
  formData: FormData
): Promise<{ success: boolean; message: string }>

export async function updateExpenseAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; message: string }>

export async function deleteExpenseAction(
  id: string
): Promise<{ success: boolean; message: string }>
```

All three call `getSession()` internally. `revalidatePath("/expenses")` is called before the `return` on the success path.

### `src/actions/income.actions.ts`

```typescript
"use server";

export async function createIncomeAction(
  formData: FormData
): Promise<{ success: boolean; message: string }>

export async function updateIncomeAction(
  id: string,
  formData: FormData
): Promise<{ success: boolean; message: string }>

export async function deleteIncomeAction(
  id: string
): Promise<{ success: boolean; message: string }>
```

`revalidatePath("/income")` called before the `return` on the success path.

---

## Data Function Signatures

### `src/data/expenses.ts`

```typescript
export async function getExpenses(
  filters?: ExpenseFilters
): Promise<Expense[]>

export async function getExpenseById(
  id: string
): Promise<Expense>
```

### `src/data/income.ts`

```typescript
export async function getIncomes(
  filters?: IncomeFilters
): Promise<Income[]>

export async function getIncomeById(
  id: string
): Promise<Income>
```

Both call `getSession()` first; throw `"Unauthorized"` if null.
