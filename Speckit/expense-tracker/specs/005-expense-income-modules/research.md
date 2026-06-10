# Research: Expense and Income Modules

**Feature**: `005-expense-income-modules` | **Date**: 2026-06-10

All decisions are resolved from the spec, clarifications, existing codebase, and constitution. No external API or dependency research was required — the tech stack is fully established.

---

## Decision 1: Architecture Mirrors Existing Patterns Exactly

**Decision**: Follow the existing 4-layer call chain without modification: Server Component → `src/data/` → `src/server/services/` → `src/server/repositories/` → Prisma.

**Rationale**: The pattern is proven and mandated by constitution Principle II. The existing `auth` stack (`auth.repository.ts` → `auth.service.ts` → `auth.actions.ts`) provides an exact reference. The expense and income stacks replicate it verbatim, scoping every repository call by `userId`.

**Alternatives considered**: Calling the repository directly from the data function (skip service layer) — rejected by constitution; service layer is non-optional.

---

## Decision 2: Filter State Lives in URL Search Params (Not `useState`)

**Decision**: `ExpenseFiltersBar` and `IncomeFiltersBar` read filter values from their props (passed from `searchParams` by the page) and write changes via `useRouter().push()`. Constitution Principle VIII explicitly prohibits `useState` for filter values.

**Rationale**: URL-based state makes filtered views bookmarkable, shareable, and refresh-safe. The page is a Server Component that reads `searchParams` and passes them to `getExpenses(filters)`, so every URL change triggers a full Server Component re-render and fresh data fetch — no client-side state management for the list.

**URL parameter names**:
- Expenses: `category`, `startDate`, `endDate`, `search`
- Income: `source`, `startDate`, `endDate`, `search`

**Alternatives considered**: `useState` with `useEffect` to sync URL — explicitly prohibited by constitution; `nuqs` library — no new runtime dependencies permitted.

---

## Decision 3: FormData Bridge for Server Actions (RHF → Server Action)

**Decision**: `ExpenseForm` and `IncomeForm` use React Hook Form with a **client-side form schema** (tags as `z.string()` for comma-separated display). On RHF's `handleSubmit`, the component constructs a `FormData` object manually and calls the Server Action inside `startTransition`.

**Rationale**: Shadcn `Select`, `Calendar`, and `Checkbox` are controlled components that require `Controller` from RHF. RHF's `action` prop (native FormData binding) does not work cleanly with Shadcn controlled inputs. The manual FormData construction is the standard pattern for this combination.

**Client-side form schema note**: The form schema uses `z.string().optional()` for `tags` (comma-separated text). The Server Action splits the string (`split(",").map(t => t.trim()).filter(Boolean)`) before calling the service. This keeps the RHF schema simple and puts the parsing logic where it belongs (the action).

**Alternatives considered**: Using native `<form action={serverAction}>` — doesn't work with Shadcn controlled inputs (Select, Calendar). Using `useFormState` — adds complexity without benefit given the `startTransition` pattern already handles pending state via `useTransition`.

---

## Decision 4: Shadcn Calendar Date Display Uses `formatDate` Utility

**Decision**: The date Popover trigger displays the selected date using `formatDate(date)` from `src/utils/formatDate.ts`. The Calendar's selected/onSelect props are managed via RHF `Controller`.

**Rationale**: `date-fns` is not in `package.json`. When `npx shadcn@latest add calendar` installs `react-day-picker`, `date-fns` becomes available as a transitive dependency — but relying on undeclared transitive dependencies is fragile. Using our own `formatDate` utility is consistent, safe, and satisfies constitution Principle VI.

**Alternatives considered**: Using `format(date, "MMM dd, yyyy")` from `date-fns` — acceptable if `date-fns` is declared, but our utility is equivalent and already required for list display.

---

## Decision 5: `deleteExpense` Function Name in Service (Avoiding Reserved Keyword)

**Decision**: The expense service exports `deleteExpense(id, userId)` rather than `delete(id, userId)`. The income service exports `deleteIncome(id, userId)`.

**Rationale**: `delete` is a JavaScript reserved keyword. Exporting a function named `delete` from a module causes a TypeScript/linting error. All other service functions follow the plain verb pattern (`getAll`, `getById`, `create`, `update`).

**Alternatives considered**: Using `remove` as the verb — rejected for consistency; `deleteExpense` is explicit and matches the action name `deleteExpenseAction`.

---

## Decision 6: Prisma MongoDB Filter Construction

**Decision**: Build the `where` object via object spread inside `findAll` rather than mutating an intermediary object. Use `mode: "insensitive" as const` for the title search `contains` filter.

**Rationale**: Object spread avoids TypeScript complaints about assigning to partial types. The `mode: "insensitive"` cast is required because TypeScript infers `string` from a bare string literal in a spread, but Prisma expects the `QueryMode` enum type.

**Implementation note** for `findAll` in both repositories:
```
const where = {
  userId,
  ...(filters?.category && { category: filters.category }),
  ...((filters?.startDate || filters?.endDate) && {
    date: {
      ...(filters?.startDate && { gte: new Date(filters.startDate) }),
      ...(filters?.endDate && { lte: new Date(filters.endDate) }),
    },
  }),
  ...(filters?.search && {
    title: { contains: filters.search, mode: "insensitive" as const },
  }),
};
```

**Alternatives considered**: Building a `Prisma.ExpenseWhereInput` typed object — requires importing from the generated Prisma path (`@/generated/prisma`) which adds coupling; the spread approach is cleaner and equivalent.

---

## Decision 7: `getTotalByCategory` Uses Prisma `groupBy`

**Decision**: The expense repository's `getTotalByCategory` method uses `db.expense.groupBy({ by: ["category"], _sum: { amount: true }, where: { ... } })`. The income repository's `getMonthlyTotal` method uses `db.income.findMany` with a date range and sums amounts in JavaScript (`reduce`).

**Rationale**: Prisma supports `groupBy` with MongoDB for basic aggregation. For `getMonthlyTotal`, a `findMany` + JS sum is simpler than a `groupBy` with a single result. Both methods are forward-compatibility hooks for the Dashboard feature and are not called by any component in this feature.

**Alternatives considered**: Raw MongoDB aggregation via `$queryRaw` — rejected for complexity; Prisma `aggregate` for `getMonthlyTotal` — equivalent but `findMany` + reduce is more readable.

---

## Decision 8: Responsive Layout via Tailwind Visibility Classes

**Decision**: `ExpenseTable` carries `hidden md:block` and `ExpenseCardList` carries `block md:hidden`. Both are Server Components rendered unconditionally by the page; Tailwind CSS handles visibility.

**Rationale**: This is the approach mandated by the 004 plan and constitution Principle VIII. No JS-based viewport detection is needed. Both components render to HTML; the browser hides the appropriate one.

**Alternatives considered**: `useMediaQuery` hook to conditionally render one component — rejected; it requires "use client" and adds hydration complexity. Server Components are preferred.

---

## Decision 9: EmptyState Is Shared Across Both Modules

**Decision**: `src/components/shared/EmptyState.tsx` accepts `{ title, description, action? }`. Both the Expenses page and Income page use it, passing different `title` and `description` strings, and different `action` nodes (`<CreateExpenseButton />` or `<CreateIncomeButton />`).

**Rationale**: Constitution Principle VIII mandates "The shared `EmptyState` component... MUST be used for all zero-results views." One component serves both "no records at all" and "no records match filter" states — callers pass the appropriate copy.

**Alternatives considered**: Per-module empty state components — rejected by the constitution's explicit mandate for a shared component.

---

## Decision 10: `loading.tsx` and `error.tsx` Already Exist — Not Replaced

**Decision**: `src/app/(dashboard)/expenses/loading.tsx` and `src/app/(dashboard)/expenses/error.tsx` were created in feature 004-app-shell-nav. This feature replaces `expenses/page.tsx` with the full implementation but does NOT touch `loading.tsx` or `error.tsx` — they already satisfy the constitution.

**Rationale**: The `loading.tsx` skeleton (toolbar row + 5 record skeletons) and `error.tsx` boundary from feature 004 are exactly what this feature needs. Replacing them would be unnecessary churn.

**Alternatives considered**: Updating the skeletons to match the Expense table structure — acceptable as enhancement but out of scope; the generic skeleton is sufficient.
