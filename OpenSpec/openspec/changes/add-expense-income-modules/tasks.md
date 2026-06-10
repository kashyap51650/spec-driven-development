# Implementation Tasks — Expense & Income Modules

Order of work (apply in sequence):

1. Types & Constants
   - `src/types/expense.ts`, `src/types/income.ts`
   - `src/constants/expense.ts`, `src/constants/income.ts`

2. Validation Schemas
   - `src/server/validations/expense.validation.ts` (zod)
   - `src/server/validations/income.validation.ts` (zod)

3. Repositories
   - `src/server/repositories/expense.repository.ts`
   - `src/server/repositories/income.repository.ts`
   - Ensure prisma imports only from `src/lib/prisma.ts`

4. Services
   - `src/server/services/expense.service.ts`
   - `src/server/services/income.service.ts`
   - Services validate input and throw descriptive errors (e.g., "Expense not found")

5. Data helpers (server-only)
   - `src/data/expenses.ts`
   - `src/data/income.ts`
   - Call `getSession()` and throw "Unauthorized" when missing

6. Server Actions
   - `src/actions/expense.actions.ts`
   - `src/actions/income.actions.ts`
   - All actions use `"use server"` and return `{ success: boolean; message: string }`
   - Call `revalidatePath()` after mutations

7. Utilities + Shared
   - `src/utils/formatCurrency.ts`, `src/utils/formatDate.ts`
   - `src/components/shared/EmptyState.tsx`

8. Expenses UI (server + client components)
   - create components under `src/features/expenses/components/` as specified
   - `app/(dashboard)/expenses/page.tsx`
   - Ensure mobile/desktop responsive visibility

9. Income UI (mirror Expenses)
   - components under `src/features/income/components/`
   - `app/(dashboard)/income/page.tsx`

10. Typecheck and lint
    - `npx tsc --noEmit`
    - `npm run lint`

11. Manual verification
    - Create, edit, delete for both Expenses and Income
    - Filters and search
    - Mobile view

Notes

- Implement Expenses fully first, then copy/adjust for Income to reduce mistakes.
- If any Shadcn UI component is missing, run `npx shadcn@latest add <component>` before importing it.
