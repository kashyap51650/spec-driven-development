## Why

The expense tracker app has fully implemented Expense and Income modules but lacks a Dashboard page that gives users an at-a-glance summary of their financial health. Users need a single view to understand their income vs. expenses, savings rate, spending by category, and recent activity without navigating to individual modules.

## What Changes

- Add a Dashboard page at `app/(dashboard)/dashboard/page.tsx` as a Server Component that aggregates income and expense data
- Add Dashboard types (`DashboardSummary`, `MonthlyTrend`, `CategoryBreakdown`, `RecentTransaction`, `DashboardData`) to `src/types/dashboard.ts`
- Add a Dashboard repository (`src/server/repositories/dashboard.repository.ts`) with aggregation queries: summary totals, monthly trends, category breakdown, and recent transactions
- Add a Dashboard service (`src/server/services/dashboard.service.ts`) that computes derived values (net savings, savings rate, category percentages)
- Add a data-layer function (`src/data/dashboard.ts`) with session-gated access following the same pattern as expenses and income
- Add 9 dashboard components under `src/features/dashboard/components/`: header, summary cards (4-up grid), monthly area chart (client component using Recharts), category breakdown with progress bars, current month summary, recent transactions list, and a welcome card for new users
- Add `app/(dashboard)/dashboard/loading.tsx` with a skeleton layout matching the dashboard structure
- Install Shadcn UI components (card, tabs, progress, separator) and Recharts if not already present

## Capabilities

### New Capabilities

- `dashboard-overview`: Aggregated financial summary page showing total income, total expenses, net savings, savings rate, monthly trends chart, category spending breakdown, current month summary, and a recent transactions list — all fetched server-side in a single parallel call

### Modified Capabilities

_(none — no existing spec requirements are changing)_

## Impact

- **New files**: `src/types/dashboard.ts`, `src/server/repositories/dashboard.repository.ts`, `src/server/services/dashboard.service.ts`, `src/data/dashboard.ts`, `src/features/dashboard/components/` (9 components), `src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/dashboard/loading.tsx`
- **No existing files modified**
- **Dependencies added**: `recharts`, `@types/recharts` (dev); Shadcn card, tabs, progress, separator components installed via CLI
- **Database**: Read-only queries against existing `Expense` and `Income` Prisma models; no schema changes
- **Auth**: Session-gated via `getSession()` from `@/lib/auth`, consistent with existing data layer pattern
