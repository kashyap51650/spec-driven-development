# Tasks: Expense and Income Modules

**Input**: Design documents from `specs/005-expense-income-modules/`

**Prerequisites**: [plan.md](./plan.md) · [spec.md](./spec.md) · [data-model.md](./data-model.md) · [contracts/component-props.md](./contracts/component-props.md) · [research.md](./research.md)

**Tests**: Not requested — no test tasks included.

**Organization**: Expenses built completely end-to-end (Phases 1–6) before any Income file is touched (Phases 7–11). Within each module, layers complete in dependency order.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story from spec.md (US1–US8)
- Exact file paths included in every task description

---

## Phase 1: Setup — Foundation (Shared by Both Modules)

**Purpose**: Install UI dependencies and create all shared/type/constant files. No component imports Shadcn yet — safe to run T002–T008 in parallel with T001, but T001 must complete before Phase 3+.

- [x] T001 Install 9 Shadcn components: `npx shadcn@latest add table dialog alert-dialog select textarea checkbox badge popover calendar` (verify absence in `src/components/ui/` first)
- [x] T002 [P] Create `src/utils/formatCurrency.ts` — `export function formatCurrency(amount: number): string` using `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`
- [x] T003 [P] Create `src/utils/formatDate.ts` — `export function formatDate(date: Date): string` using `Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" })`
- [x] T004 [P] Create `src/components/shared/EmptyState.tsx` — Server Component; props `{ title, description, action? }`; renders `Inbox` icon (lucide-react) + title + description + optional action slot (see [contracts](./contracts/component-props.md))
- [x] T005 [P] Create `src/types/expense.ts` — exports `interface Expense`, `interface CreateExpenseInput`, `type UpdateExpenseInput`, `interface ExpenseFilters` (see [data-model.md](./data-model.md))
- [x] T006 [P] Create `src/types/income.ts` — exports `interface Income`, `interface CreateIncomeInput`, `type UpdateIncomeInput`, `interface IncomeFilters` (see [data-model.md](./data-model.md))
- [x] T007 [P] Create `src/constants/expense.ts` — exports `EXPENSE_CATEGORIES` (10 values, `as const`), `ExpenseCategory`, `ACCOUNT_TYPES` (4 values, `as const`), `AccountType` (see [data-model.md](./data-model.md))
- [x] T008 [P] Create `src/constants/income.ts` — exports `INCOME_SOURCES` (6 values, `as const`), `IncomeSource`; does NOT duplicate `ACCOUNT_TYPES` (imported from `@/constants/expense` when needed)

**Checkpoint**: Foundation complete. Run `npx tsc --noEmit` — zero errors expected on these files.

---

## Phase 2: Expense Backend (Blocking Prerequisite for Expense UI)

**Purpose**: Full data access layer for Expenses. Must complete before any Expense UI component.

⚠️ **CRITICAL**: No Expense UI work begins until this phase is complete.

- [x] T009 [P] Create `src/server/validations/expense.validation.ts` — `createExpenseSchema` (title min 1, amount positive, category enum, account enum, date coerce, notes optional, tags array default [], recurring boolean default false); export `CreateExpenseInput` + `updateExpenseSchema` + `UpdateExpenseInput` (see [data-model.md](./data-model.md))
- [x] T010 [P] Create `src/server/repositories/expense.repository.ts` — `EXPENSE_SELECT` constant; `mapToExpense` helper; five functions: `findAll` (userId-scoped, all filters, `orderBy date desc`), `findById` (scoped by userId after lookup), `create`, `update`, `deleteById`; plus `getTotalByCategory` (reserved for dashboard, uses `db.expense.groupBy`) (see [plan.md](./plan.md) Layer 10)
- [x] T011 Create `src/server/services/expense.service.ts` — `getAll`, `getById` (throws "Expense not found"), `create` (validates with schema), `update` (ownership check via getById first), `deleteExpense` (ownership check first) — depends on T009 + T010
- [x] T012 [P] Create `src/data/expenses.ts` — `getExpenses(filters?)` and `getExpenseById(id)`: both call `getSession()` first, throw "Unauthorized" if null, delegate to service — depends on T011
- [x] T013 [P] Create `src/actions/expense.actions.ts` — `"use server"`; `createExpenseAction(formData)`, `updateExpenseAction(id, formData)`, `deleteExpenseAction(id)`; each calls `getSession()` internally; tags parsed via `split(",").map(t=>t.trim()).filter(Boolean)`; `revalidatePath("/expenses")` called BEFORE `return` on success path (see [contracts](./contracts/component-props.md)) — depends on T011

**Checkpoint**: Expense backend complete. Verify `npx tsc --noEmit` still passes.

---

## Phase 3: US1 — Create Expense (Priority: P1) 🎯 Expense MVP

**Goal**: Users can open a dialog, fill a form, submit, and see the new expense record appear immediately.

**Independent Test**: Visit `/expenses` (empty state shows), click "+ Add Expense", fill form, submit — record appears in list; all amounts in INR, dates in MMM dd, yyyy format.

- [x] T014 [US1] Create `src/features/expenses/components/ExpenseForm.tsx` — `"use client"`; props `{ mode, expense?, onSuccess }`; React Hook Form + `zodResolver`; all 8 fields (title Input, amount Input, category/account Select with `Controller`, date Popover+Calendar with `Controller`, notes Textarea, tags Input via `Controller` with join/split, recurring Checkbox via `Controller`); manual FormData build on submit; `startTransition` + action call; `SubmitButton` from auth components; inline `formError` state — depends on T001, T005, T007, T009, T013 (see [contracts](./contracts/component-props.md))
- [x] T015 [P] [US1] Create `src/features/expenses/components/CreateExpenseButton.tsx` — `"use client"`; `useState<boolean>` for open; renders "+ Add Expense" `Button` + `<CreateExpenseDialog open={open} onOpenChange={setOpen} />` — depends on T001
- [x] T016 [US1] Create `src/features/expenses/components/CreateExpenseDialog.tsx` — `"use client"`; props `{ open, onOpenChange }`; Shadcn `Dialog` titled "Add Expense"; contains `<ExpenseForm mode="create" onSuccess={() => onOpenChange(false)} />` — depends on T014, T015

**Checkpoint**: Open `/expenses` in browser. EmptyState + "+ Add Expense" button visible. Click, fill form, submit — record appears. Form validation fires on empty/invalid submit.

---

## Phase 4: US3 & US4 — Edit and Delete Expense (Priority: P2)

**Goal**: Users can edit any field of an existing expense and delete expenses with confirmation.

**Independent Test**: Click pencil icon → dialog pre-populated → change title → save → list updates. Click trash icon → AlertDialog appears → cancel keeps record → confirm removes it.

- [x] T017 [P] [US3] Create `src/features/expenses/components/EditExpenseButton.tsx` — `"use client"`; props `{ expense: Expense }`; `useState<boolean>` for open; ghost icon button with `Pencil` icon + `<EditExpenseDialog expense={expense} open={open} onOpenChange={setOpen} />` — depends on T001, T005
- [x] T018 [US3] Create `src/features/expenses/components/EditExpenseDialog.tsx` — `"use client"`; props `{ expense, open, onOpenChange }`; Shadcn `Dialog` titled "Edit Expense"; contains `<ExpenseForm mode="edit" expense={expense} onSuccess={() => onOpenChange(false)} />` — depends on T014, T017
- [x] T019 [US4] Create `src/features/expenses/components/DeleteExpenseButton.tsx` — `"use client"`; props `{ id: string }`; `useTransition` for pending; ghost icon button with `Trash2` icon; Shadcn `AlertDialog` with title "Delete Expense" + description "This will permanently delete this expense. This action cannot be undone."; `deleteExpenseAction(id)` called in `startTransition` on confirm — depends on T001, T013

**Checkpoint**: Create an expense, click pencil, change a field, save — updated value shown. Click trash, confirm — record gone. Click trash, cancel — record remains.

---

## Phase 5: US7 & US8 — Expense Responsive Views (Priority: P3)

**Goal**: Records display as a table on desktop (≥768px) and as cards on mobile (<768px). Both expose edit/delete actions. Empty state renders when no records match.

**Independent Test**: Add 3+ expenses. View on desktop → table layout. View on mobile (375px) → card layout. Both show same data + edit/delete buttons.

- [x] T020 [P] [US7] Create `src/features/expenses/components/ExpenseCard.tsx` — Server Component; props `{ expense: Expense }`; Shadcn `Card` with header (title + date), content (amount in `text-red-600`, category Badge, account), footer (notes if present + `<EditExpenseButton>` + `<DeleteExpenseButton>`) — depends on T002, T003, T005, T017, T019
- [x] T021 [US7] Create `src/features/expenses/components/ExpenseCardList.tsx` — Server Component; props `{ expenses: Expense[] }`; `div.flex.flex-col.gap-3.block.md:hidden` mapping to `<ExpenseCard>` — depends on T020
- [x] T022 [P] [US7] Create `src/features/expenses/components/ExpenseTable.tsx` — Server Component; props `{ expenses: Expense[] }`; `div.hidden.md:block`; Shadcn `Table`; columns: Date · Title · Category (Badge) · Account · Amount (right-aligned, `text-red-600`) · Actions (`<EditExpenseButton>` + `<DeleteExpenseButton>`) — depends on T002, T003, T005, T017, T019

**Checkpoint**: `/expenses` with records — desktop shows table (`hidden md:block`), mobile shows cards (`block md:hidden`). Both have working edit/delete.

---

## Phase 6: US5 — Expense Filters & Full Page (Priority: P3)

**Goal**: Users filter by category, date range, and title search. All filter state persists in URL.

**Independent Test**: Create 3 expenses with different categories/dates. Apply category filter → only matching shown. Refresh page → filter preserved. Clear all → all records shown.

- [x] T023 [US5] Create `src/features/expenses/components/ExpenseFiltersBar.tsx` — `"use client"`; props `{ category?, startDate?, endDate?, search? }`; `useRouter` + `usePathname`; NO `useState` for filter values (URL is source of truth); controls: debounced Search Input (400ms), Category Select (EXPENSE_CATEGORIES + "All Categories"), Start/End date Popovers + Calendars, Clear All button (shown when any filter active); URL mutations via `router.push` (see [contracts](./contracts/component-props.md) and [research.md](./research.md) Decision 2)
- [x] T024 [US1] [US5] [US7] [US8] Replace `src/app/(dashboard)/expenses/page.tsx` with full Server Component implementation — `searchParams: Promise<{...}>` (await in body); build `ExpenseFilters` from params; call `getExpenses(filters)`; render: page header row (`<h1>Expenses</h1>` + `<CreateExpenseButton />`); `<ExpenseFiltersBar>` with current filter values; conditional on `expenses.length === 0` → `<EmptyState title="No expenses yet" description="Track your spending by adding your first expense." action={<CreateExpenseButton />} />` else `<ExpenseTable>` + `<ExpenseCardList>` — depends on T012, T015, T021, T022, T023

**Checkpoint**: Run all Quickstart scenarios 1–8 from [quickstart.md](./quickstart.md). TypeScript gate: `npx tsc --noEmit` — zero errors. **Expenses module is complete.**

---

## Phase 7: Income Backend (Blocking Prerequisite for Income UI)

**Purpose**: Full data access layer for Income. Mirror of Phase 2 — complete before any Income UI.

⚠️ **CRITICAL**: No Income UI work begins until this phase is complete.

- [x] T025 [P] Create `src/server/validations/income.validation.ts` — `createIncomeSchema` (title min 1, amount positive, source enum INCOME_SOURCES, account enum ACCOUNT_TYPES, date coerce, notes optional); no tags, no recurring; export `CreateIncomeInput` + `updateIncomeSchema` + `UpdateIncomeInput` (see [data-model.md](./data-model.md))
- [x] T026 [P] Create `src/server/repositories/income.repository.ts` — `INCOME_SELECT` (10 fields); `mapToIncome` helper; five functions: `findAll` (userId-scoped, source/date/search filters, `orderBy date desc`), `findById` (scoped by userId after lookup), `create`, `update`, `deleteById`; plus `getMonthlyTotal(userId, year, month)` (reserved for dashboard, uses `findMany` + JS reduce) (see [plan.md](./plan.md) Layer 24)
- [x] T027 Create `src/server/services/income.service.ts` — `getAll`, `getById` (throws "Income not found"), `create` (validates with schema), `update` (ownership check first), `deleteIncome` (ownership check first) — depends on T025 + T026
- [x] T028 [P] Create `src/data/income.ts` — `getIncomes(filters?)` and `getIncomeById(id)`: both call `getSession()` first, throw "Unauthorized" if null, delegate to service — depends on T027
- [x] T029 [P] Create `src/actions/income.actions.ts` — `"use server"`; `createIncomeAction(formData)`, `updateIncomeAction(id, formData)`, `deleteIncomeAction(id)`; each calls `getSession()` internally; no tags parsing; `revalidatePath("/income")` called BEFORE `return` on success path — depends on T027

**Checkpoint**: Income backend complete. Run `npx tsc --noEmit` — zero errors.

---

## Phase 8: US2 — Create Income (Priority: P1) 🎯 Income MVP

**Goal**: Users can open a dialog, fill a form, submit, and see the new income record appear immediately.

**Independent Test**: Visit `/income` (empty state), click "+ Add Income", fill form (no tags/recurring), submit — record appears with amount in green INR format.

- [x] T030 [US2] Create `src/features/income/components/IncomeForm.tsx` — `"use client"`; props `{ mode, income?, onSuccess }`; React Hook Form + `zodResolver(createIncomeSchema/updateIncomeSchema)`; 5 fields: title Input, amount Input, source Select (INCOME_SOURCES), account Select (ACCOUNT_TYPES), date Popover+Calendar, notes Textarea; NO tags, NO recurring; manual FormData build; calls `createIncomeAction`/`updateIncomeAction` in `startTransition`; `SubmitButton` — depends on T001, T006, T007, T008, T025, T029
- [x] T031 [P] [US2] Create `src/features/income/components/CreateIncomeButton.tsx` — `"use client"`; `useState<boolean>` for open; "+ Add Income" Button + `<CreateIncomeDialog open={open} onOpenChange={setOpen} />` — depends on T001
- [x] T032 [US2] Create `src/features/income/components/CreateIncomeDialog.tsx` — `"use client"`; props `{ open, onOpenChange }`; Shadcn `Dialog` titled "Add Income"; contains `<IncomeForm mode="create" onSuccess={() => onOpenChange(false)} />` — depends on T030, T031

**Checkpoint**: Open `/income` — EmptyState + "+ Add Income". Click, fill form, submit — record appears. Amount in green. Validation fires on empty/invalid submit.

---

## Phase 9: US3 & US4 — Edit and Delete Income (Priority: P2)

**Goal**: Users can edit any field of an existing income record and delete with confirmation.

**Independent Test**: Create income, edit title → updated. Delete → AlertDialog → confirm → removed.

- [x] T033 [P] [US3] Create `src/features/income/components/EditIncomeButton.tsx` — `"use client"`; props `{ income: Income }`; ghost icon button with `Pencil` + `<EditIncomeDialog income={income} open={open} onOpenChange={setOpen} />` — depends on T001, T006
- [x] T034 [US3] Create `src/features/income/components/EditIncomeDialog.tsx` — `"use client"`; props `{ income, open, onOpenChange }`; Shadcn `Dialog` titled "Edit Income"; `<IncomeForm mode="edit" income={income} onSuccess={() => onOpenChange(false)} />` — depends on T030, T033
- [x] T035 [US4] Create `src/features/income/components/DeleteIncomeButton.tsx` — `"use client"`; props `{ id: string }`; `useTransition`; ghost icon button with `Trash2`; Shadcn `AlertDialog` description "This will permanently delete this income record. This action cannot be undone."; `deleteIncomeAction(id)` on confirm — depends on T001, T029

**Checkpoint**: Edit income title → updated. Confirm delete → removed. Cancel delete → remains.

---

## Phase 10: US7 & US8 — Income Responsive Views (Priority: P3)

**Goal**: Income records display as table on desktop and cards on mobile. EmptyState shows when empty.

**Independent Test**: Add 3+ income records. Desktop → table with Source column (not Category), green amounts. Mobile → cards with green amounts.

- [x] T036 [P] [US7] Create `src/features/income/components/IncomeCard.tsx` — Server Component; props `{ income: Income }`; same Card layout as ExpenseCard; amount in `text-green-600`; shows `income.source` instead of category Badge — depends on T002, T003, T006, T033, T035
- [x] T037 [US7] Create `src/features/income/components/IncomeCardList.tsx` — Server Component; props `{ incomes: Income[] }`; `div.flex.flex-col.gap-3.block.md:hidden` mapping to `<IncomeCard>` — depends on T036
- [x] T038 [P] [US7] Create `src/features/income/components/IncomeTable.tsx` — Server Component; props `{ incomes: Income[] }`; `div.hidden.md:block`; Shadcn `Table`; columns: Date · Title · Source (Badge) · Account · Amount (green) · Actions — depends on T002, T003, T006, T033, T035

**Checkpoint**: `/income` with records — desktop table (Source column), mobile cards. Both green amounts, working edit/delete.

---

## Phase 11: US5 — Income Filters & Full Page (Priority: P3)

**Goal**: Users filter income by source, date range, and title search. All filter state persists in URL.

**Independent Test**: Create 3 income records with different sources/dates. Filter by source → correct records shown. Refresh → filter preserved. Clear → all shown.

- [x] T039 [US5] Create `src/features/income/components/IncomeFiltersBar.tsx` — `"use client"`; props `{ source?, startDate?, endDate?, search? }`; same pattern as ExpenseFiltersBar; Source Select uses `INCOME_SOURCES` + "All Sources" option; URL param name is `source` (not `category`); no `useState` for filter values
- [x] T040 [US2] [US5] [US7] [US8] Replace `src/app/(dashboard)/income/page.tsx` with full Server Component implementation — `searchParams: Promise<{...}>`; build `IncomeFilters` from params (reads `source` not `category`); call `getIncomes(filters)`; render: header (`<h1>Income</h1>` + `<CreateIncomeButton />`); `<IncomeFiltersBar>`; conditional on empty → `<EmptyState title="No income yet" description="Track your earnings by adding your first income record." action={<CreateIncomeButton />} />` else `<IncomeTable>` + `<IncomeCardList>` — depends on T028, T031, T037, T038, T039

**Checkpoint**: Run Quickstart scenarios 9–12 from [quickstart.md](./quickstart.md). **Income module complete.**

---

## Phase 12: Polish & Quality Gate

**Purpose**: Final validation across both modules.

- [x] T041 Run TypeScript compilation gate — `npx tsc --noEmit` from repo root; fix any type errors before marking complete
- [x] T042 Validate all 12 Quickstart scenarios from [quickstart.md](./quickstart.md) pass end-to-end in a running browser

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─ Phase 2 (Expense Backend) ← T001 must be done; T005,T007,T009 available
       └─ Phase 3 (US1 Create Expense)
            └─ Phase 4 (US3+US4 Edit/Delete Expense)
                 └─ Phase 5 (US7+US8 Expense Views)
                      └─ Phase 6 (US5 Expense Filters + Page)
                           └─ Phase 7 (Income Backend)
                                └─ Phase 8 (US2 Create Income)
                                     └─ Phase 9 (US3+US4 Edit/Delete Income)
                                          └─ Phase 10 (US7+US8 Income Views)
                                               └─ Phase 11 (US5 Income Filters + Page)
                                                    └─ Phase 12 (Polish)
```

### User Story to Task Mapping

| User Story | Priority | Phase | Tasks |
|---|---|---|---|
| US1 — Create Expense | P1 | 3 + 6 | T014–T016, T024 |
| US2 — Create Income | P1 | 8 + 11 | T030–T032, T040 |
| US6 — Data Isolation | P1 | 2 + 7 | Enforced by repository `userId` scoping in T010, T026 |
| US3 — Edit Record | P2 | 4 + 9 | T017–T018, T033–T034 |
| US4 — Delete Record | P2 | 4 + 9 | T019, T035 |
| US5 — Filter & Search | P3 | 6 + 11 | T023–T024, T039–T040 |
| US7 — Responsive Views | P3 | 5 + 10 | T020–T022, T036–T038 |
| US8 — Empty States | P3 | 1 + 6 + 11 | T004, T024, T040 |

### Within-Phase Parallel Opportunities

**Phase 1** — All of T002–T008 can run in parallel with each other (and with T001):
```
T001 (Shadcn install)    — independent
T002 (formatCurrency)    — independent
T003 (formatDate)        — independent
T004 (EmptyState)        — independent
T005 (expense types)     — independent
T006 (income types)      — independent
T007 (expense constants) — independent
T008 (income constants)  — independent
```

**Phase 2** — T009 and T010 in parallel; then T011; then T012 and T013 in parallel:
```
T009 (expense validation)  ─┐
T010 (expense repository)  ─┴→ T011 (expense service) ─┬→ T012 (data function)
                                                         └→ T013 (actions)
```

**Phase 4** — T017 and T019 in parallel; T018 depends on T017:
```
T017 (EditExpenseButton)  → T018 (EditExpenseDialog)
T019 (DeleteExpenseButton) — independent of T017
```

**Phase 5** — T020 and T022 in parallel:
```
T020 (ExpenseCard)     → T021 (ExpenseCardList)
T022 (ExpenseTable)    — independent of T020
```

**Phase 7** — mirrors Phase 2:
```
T025 (income validation)  ─┐
T026 (income repository)  ─┴→ T027 (income service) ─┬→ T028 (data function)
                                                        └→ T029 (actions)
```

**Phase 9+10** — mirrors Phase 4+5 for income.

---

## Implementation Strategy

### MVP: Expense Create (US1) Only

1. Complete Phase 1 (T001–T008)
2. Complete Phase 2 (T009–T013)
3. Complete Phase 3 (T014–T016) — ExpenseForm + dialogs
4. Create a minimal `/expenses/page.tsx` (just renders `<CreateExpenseButton />` and a list) — enough to test create flow
5. **STOP and VALIDATE**: Can create expenses, sees them in list
6. Continue to Phase 4+

### Incremental Delivery (Recommended for Solo Developer)

Following the phase order exactly:
1. Phase 1 → Foundation ready
2. Phase 2 → Expense data layer ready
3. Phase 3 → Expense create works
4. Phase 4 → Expense edit + delete works
5. Phase 5 → Expense list looks correct on desktop + mobile
6. Phase 6 → Expense filters + URL state + final page — **Expenses DONE**
7. Phase 7 → Income data layer ready
8. Phase 8 → Income create works
9. Phase 9 → Income edit + delete works
10. Phase 10 → Income list looks correct
11. Phase 11 → Income filters + final page — **Income DONE**
12. Phase 12 → TypeScript gate passes, all scenarios validated

---

## Notes

- `[P]` tasks operate on different files with no shared dependencies — safe to implement simultaneously
- `[US?]` labels trace each task back to its user story in spec.md
- Data isolation (US6) is enforced architecturally by `userId` scoping in T010 and T026 — no separate tasks needed
- `loading.tsx` and `error.tsx` for both pages already exist from feature 004 — do NOT recreate
- `deleteExpense` (service) and `deleteIncome` (service) avoid the JS reserved keyword `delete`
- `ACCOUNT_TYPES` lives only in `src/constants/expense.ts`; income components import it from there
- The `tags` field in `ExpenseForm` uses a `Controller` with join/split to bridge `string[]` ↔ comma-separated `Input`
- In Next.js 16 App Router, `searchParams` is a `Promise` — must be awaited in the page component
