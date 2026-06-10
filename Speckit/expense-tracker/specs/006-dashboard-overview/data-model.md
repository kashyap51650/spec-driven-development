# Data Model: Dashboard Overview

**Branch**: `006-dashboard-overview` | **Date**: 2026-06-10

---

## Overview

The dashboard reads from two existing Prisma collections (`Expense`, `Income`) and derives all display data in the service layer. No new database collections or schema changes are required.

---

## Derived Interfaces (`src/types/dashboard.ts`)

### `DashboardSummary`

Aggregated totals for the current calendar month.

| Field | Type | Derivation |
|---|---|---|
| `totalIncome` | `number` | Sum of `Income.amount` where `date` in current month, for `userId` |
| `totalExpenses` | `number` | Sum of `Expense.amount` where `date` in current month, for `userId` |
| `netSavings` | `number` | `totalIncome - totalExpenses` |
| `savingsRate` | `number` | `totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0` |

### `MonthlyTrend`

One entry per month across a rolling N-month window. Array is sorted oldest → newest.

| Field | Type | Derivation |
|---|---|---|
| `month` | `string` | Short month label, e.g. `"Jan"` — `Intl.DateTimeFormat("en-IN", { month: "short" })` |
| `income` | `number` | Sum of `Income.amount` for that month and `userId` |
| `expenses` | `number` | Sum of `Expense.amount` for that month and `userId` |

### `CategoryBreakdown`

One entry per expense category for the current calendar month, sorted by `total` descending.

| Field | Type | Derivation |
|---|---|---|
| `category` | `string` | `Expense.category` value |
| `total` | `number` | Sum of `Expense.amount` for that category, current month, `userId` |
| `count` | `number` | Count of expense records in that category |
| `percentage` | `number` | `totalExpenses > 0 ? (total / totalExpenses) * 100 : 0` |

### `RecentTransaction`

One entry per recent record, across both `Expense` and `Income`, sorted by date descending and sliced to `limit` (default 8).

| Field | Type | Source |
|---|---|---|
| `id` | `string` | `Expense.id` or `Income.id` |
| `title` | `string` | `Expense.title` or `Income.title` |
| `amount` | `number` | `Expense.amount` or `Income.amount` |
| `type` | `"expense" \| "income"` | Literal assigned during mapping |
| `category` | `string` | `Expense.category` (for expenses) or `Income.source` (for income) |
| `date` | `Date` | `Expense.date` or `Income.date` |

### `CurrentMonth`

Summary card for the current calendar month (same data as `DashboardSummary` with balance and label).

| Field | Type | Derivation |
|---|---|---|
| `income` | `number` | `DashboardSummary.totalIncome` |
| `expenses` | `number` | `DashboardSummary.totalExpenses` |
| `balance` | `number` | `income - expenses` |
| `label` | `string` | `Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(now)` e.g. `"June 2026"` |

### `DashboardData`

Top-level container returned by `getDashboardData()`.

| Field | Type | Notes |
|---|---|---|
| `summary` | `DashboardSummary` | Current-month aggregates |
| `monthlyTrends` | `MonthlyTrend[]` | Last 6 months, oldest first |
| `categoryBreakdown` | `CategoryBreakdown[]` | Current month, ranked by total |
| `recentTransactions` | `RecentTransaction[]` | Up to 8, most recent first |
| `currentMonth` | `CurrentMonth` | Current-month snapshot with label |
| `hasData` | `boolean` | `totalIncome > 0 \|\| totalExpenses > 0 \|\| recentTransactions.length > 0` |

---

## Source Collections (Existing — No Schema Changes)

### `Expense` (existing)

Fields used by the dashboard repository:

| Field | Type | Used by |
|---|---|---|
| `id` | `string` | `getRecentTransactions` |
| `userId` | `string` | All queries (scoping) |
| `title` | `string` | `getRecentTransactions` |
| `amount` | `number` | All aggregate queries |
| `category` | `string` | `getCategoryBreakdown`, `getRecentTransactions` |
| `date` | `Date` | All date-range queries |

### `Income` (existing)

Fields used by the dashboard repository:

| Field | Type | Used by |
|---|---|---|
| `id` | `string` | `getRecentTransactions` |
| `userId` | `string` | All queries (scoping) |
| `title` | `string` | `getRecentTransactions` |
| `amount` | `number` | All aggregate queries |
| `source` | `string` | `getRecentTransactions` (mapped to `category`) |
| `date` | `Date` | All date-range queries |

---

## Data Flow

```
MongoDB
  └─ Expense collection  ─┐
  └─ Income collection   ─┤
                           ▼
dashboard.repository.ts  (4 functions, all userId-scoped)
  getMonthlySummary        → { totalIncome, totalExpenses }
  getMonthlyTrends         → MonthlyTrend[] (6 entries)
  getCategoryBreakdown     → { category, total, count }[]
  getRecentTransactions    → RecentTransaction[] (≤8)
                           ▼
dashboard.service.ts
  getDashboardData         → derives netSavings, savingsRate, percentages, balance, label, hasData
                           → returns DashboardData
                           ▼
src/data/dashboard.ts
  getDashboardData         → session guard → service call → DashboardData
                           ▼
app/(dashboard)/dashboard/page.tsx  (async Server Component)
  Destructures DashboardData → passes props to each component
```

---

## Validation Rules

- All monetary amounts are non-negative numbers (enforced at the Expense/Income creation layer)
- `savingsRate` and `percentage` are clamped to `0` when their denominator is `0` to prevent `NaN`/`Infinity`
- `hasData` is a boolean derived from data, never stored in the database
- `monthlyTrends` always contains exactly `months` entries (default 6), with `0` values for months with no records
