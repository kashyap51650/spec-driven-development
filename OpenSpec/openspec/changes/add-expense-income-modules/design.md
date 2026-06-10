# Design — Expense & Income Modules

This document describes the implementation approach, file layout, and important rules to follow.

High-level architecture

- UI pages (server components) → call `src/data/*` server-only helpers
- Data helpers → call service layer in `src/server/services/*`
- Services → enforce validation and business logic, call repositories
- Repositories → only import `prisma` from `src/lib/prisma.ts` and perform DB queries
- Server Actions → live in `src/actions/*` and call services; must `revalidatePath()` after mutations

Files to add (summary)

- `src/types/expense.ts`, `src/types/income.ts`
- `src/constants/expense.ts`, `src/constants/income.ts`
- `src/server/validations/expense.validation.ts`, `src/server/validations/income.validation.ts` (zod)
- Repositories: `src/server/repositories/expense.repository.ts`, `src/server/repositories/income.repository.ts`
- Services: `src/server/services/expense.service.ts`, `src/server/services/income.service.ts`
- Data helpers: `src/data/expenses.ts`, `src/data/income.ts`
- Actions: `src/actions/expense.actions.ts`, `src/actions/income.actions.ts`
- Utils: `src/utils/formatCurrency.ts`, `src/utils/formatDate.ts`
- Shared component: `src/components/shared/EmptyState.tsx`
- Feature components under `src/features/expenses/components/` and `src/features/income/components/`
- Pages: `app/(dashboard)/expenses/page.tsx`, `app/(dashboard)/income/page.tsx`

Important implementation rules (must follow)

- Services own validation and business rules; repositories only do DB access.
- Always scope repository queries with `userId` to prevent cross-user access.
- Import Prisma only from `src/lib/prisma.ts` inside repositories.
- Use `getSession()` from `src/lib/auth.ts` in server-only entry points (data functions and server actions) and throw "Unauthorized" when missing.
- Always call `revalidatePath()` after a mutation.
- Use explicit TypeScript return types on every function.
- No client-side fetch for reading data; server components should call data helpers directly.
- Follow Shadcn component availability rule before importing (add via `npx shadcn@latest add <component>` if missing).

Shadcn components to ensure installed

- `table`, `dialog`, `select`, `textarea`, `badge`, `alert-dialog`, `popover`, `calendar`

Formatting and utils

- `formatCurrency(amount)` → INR via `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`
- `formatDate(date)` → `MMM dd, yyyy` using `Intl.DateTimeFormat` and `toLocaleDateString` options.

Testing and verification

- `npx tsc --noEmit` and `npm run lint` must pass
- Manual verification: create/edit/delete flows, filters, mobile/table responsive behavior
