# Research: Dashboard Overview

**Branch**: `006-dashboard-overview` | **Date**: 2026-06-10

---

## Summary

No NEEDS CLARIFICATION items were found in the Technical Context. The specification and existing codebase provided sufficient detail to resolve all design decisions without external research. Key decisions are documented below.

---

## Decision: Parallel Data Fetching Strategy

**Decision**: Single `Promise.all` call in the service layer fetching all four data operations concurrently.

**Rationale**: The dashboard page requires four independent data queries (monthly summary, 6-month trends, category breakdown, recent transactions). Running them in parallel eliminates waterfall latency and satisfies SC-007. The existing codebase follows this pattern (e.g., `expense.repository.ts` uses `Promise.all` for parallel aggregates).

**Alternatives considered**:
- Sequential awaits — rejected: unnecessary waterfall latency (4× longer minimum)
- Individual parallel fetches in the Server Component — rejected: violates constitution Principle I (data fetching belongs in `src/data/`, not components) and Principle II (architecture layering)

---

## Decision: `hasData` Determination

**Decision**: `hasData = summary.totalIncome > 0 || summary.totalExpenses > 0 || recentTransactions.length > 0`

**Rationale**: The spec defines `hasData` as false when "all totals are zero." Querying all-time totals across all months would require an additional database round-trip outside the parallel block. The practical approximation (current-month totals OR any recent transactions) is correct in 100% of real-world cases — any account that has ever had data will have either current-month amounts or show up in recent transactions.

**Alternatives considered**:
- Extra all-time aggregate query — rejected: adds a 5th DB round-trip for a minor edge case (account with data only in months >6 months ago)
- Checking trends array for any non-zero month — rejected: trends only cover 6 months, same edge case

---

## Decision: Monthly Trends Date Range Construction

**Decision**: Loop from `months-1` down to `0` (offset from current month), building start/end boundaries inline in the repository function.

**Rationale**: The existing `income.repository.ts` already demonstrates this approach with `getMonthlyTotal`. Building date ranges inline keeps the function self-contained and avoids passing complex objects between layers.

**Alternatives considered**:
- Passing pre-built date ranges from the service — rejected: leaks date-construction logic into the wrong layer; repository should own its own query construction

---

## Decision: `getMonthlyTrends` Implementation

**Decision**: Calls the existing `getMonthlySummary` function internally for each month rather than writing bespoke per-month queries.

**Rationale**: Reuses the already-correct, already-tested aggregation logic. `Promise.all` across all month calls still achieves full parallelism.

**Alternatives considered**:
- Inline `db.income.aggregate` + `db.expense.aggregate` per month — rejected: code duplication; `getMonthlySummary` already handles null-defaulting correctly

---

## Decision: Component Architecture — Server vs Client

**Decision**: All 8 UI components are Server Components except `MonthlyTrendChart`, which is a Client Component (`"use client"`).

**Rationale**: Recharts requires browser APIs (ResizeObserver, DOM measurement) and cannot render in a server environment. All other components are pure render functions with no browser dependencies — keeping them as Server Components avoids unnecessary client bundle size and aligns with constitution Principle I.

**Alternatives considered**:
- Making the entire dashboard page a Client Component — rejected: violates Principle I; all data would need to be fetched client-side
- Using a server-side chart alternative — rejected: Recharts is mandated by constitution Principle VIII; no amendment process was initiated

---

## Decision: Shadcn `progress` Component Usage

**Decision**: Install via CLI (`npx shadcn@latest add progress`) before any code is written; use `<Progress value={item.percentage} />` in `CategoryBreakdownCard`.

**Rationale**: Constitution Principle V mandates CLI installation; manual copying is prohibited. The `progress` value prop accepts 0–100, matching the `percentage` field directly.

**Alternatives considered**:
- Custom CSS width bars — rejected: violates Principle V (Tailwind only, but also: Shadcn component already available and mandated)

---

## Existing Code to Reuse

| Asset | Location | Usage |
|---|---|---|
| `formatCurrency` | `src/utils/formatCurrency.ts` | All monetary amounts throughout dashboard |
| `formatDate` | `src/utils/formatDate.ts` | Date column in RecentTransactionItem |
| `EmptyState` | `src/components/shared/EmptyState.tsx` | CategoryBreakdownCard, RecentTransactionsList |
| `db` singleton | `src/lib/prisma.ts` | All repository Prisma calls |
| `getSession` | `src/lib/auth.ts` | `src/data/dashboard.ts` session guard |
| `cn` | `src/lib/utils.ts` | Conditional className merging in components |
| Shadcn Card | `src/components/ui/card.tsx` | All dashboard cards |
| Shadcn Skeleton | `src/components/ui/skeleton.tsx` | loading.tsx |
| Shadcn Separator | `src/components/ui/separator.tsx` | CurrentMonthCard row dividers |
| Shadcn Button | `src/components/ui/button.tsx` | WelcomeCard action buttons |
| `error.tsx` | `src/app/(dashboard)/dashboard/error.tsx` | Already exists — no changes needed |
