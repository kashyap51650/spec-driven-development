# Implementation Plan: Dashboard Overview

**Branch**: `006-dashboard-overview` | **Date**: 2026-06-10 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/006-dashboard-overview/spec.md`

---

## Summary

Build a read-only financial dashboard that aggregates expense and income data for the authenticated user and presents it across five sections: summary cards (current-month totals), a 6-month trend area chart, a category spending breakdown, a current-month snapshot card, and a recent-transactions list. A welcome card is shown to new users with zero data. All data is fetched in one parallel server-side round-trip. No mutations occur on this page.

---

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Next.js 16 App Router

**Primary Dependencies**: Prisma (MongoDB), Shadcn UI (Card, Skeleton, Progress, Separator), Recharts (AreaChart), lucide-react icons

**Storage**: MongoDB via Prisma — reads from existing `Expense` and `Income` collections

**Testing**: `npx tsc --noEmit` after each phase (TypeScript gate); manual browser validation per quickstart.md

**Target Platform**: Web (Next.js App Router, `/dashboard` route, authenticated layout)

**Project Type**: Web application — server-rendered Next.js pages

**Performance Goals**: All dashboard data fetched in a single parallel `Promise.all` round-trip; page renders within 3 seconds under normal load (SC-001, SC-007)

**Constraints**: Read-only (no mutations); no pagination; all amounts INR; dates MMM dd, yyyy; data scoped strictly to `session.userId`

**Scale/Scope**: Single-user dashboard; up to a few hundred expense/income records

---

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked post-design — all gates pass.*

| Principle | Gate | Status |
|---|---|---|
| I. Server-First Data Access | `getDashboardData` in `src/data/dashboard.ts` calls `getSession()`; no `useEffect`, no Route Handlers, no client fetching | ✅ PASS |
| II. Architecture Layering | Read chain: Server Component → `src/data/` → `src/server/services/` → `src/server/repositories/` → Prisma | ✅ PASS |
| II. userId scoping | Every repository query scoped by `userId`; service never accepts userId from external caller | ✅ PASS |
| III. TypeScript Discipline | All interfaces in `src/types/dashboard.ts`; strict mode; `interface` for shapes; explicit return types; no `any` | ✅ PASS |
| IV. Response Contract | Data functions return data directly (no `{ success, message }` envelope); errors propagate to `error.tsx` | ✅ PASS |
| V. UI Component Integrity | `progress` installed via CLI before use; Recharts for chart (per constitution) | ✅ PASS |
| VI. Formatting | `formatCurrency` (INR) and `formatDate` (MMM dd, yyyy) from `src/utils/` — no hardcoded formats | ✅ PASS |
| VII. Auth & Session | `getSession()` in data function; throws `"Unauthorized"` if null; middleware already protects `/dashboard/*` | ✅ PASS |
| VIII. UI Patterns | `loading.tsx` with Skeleton layout; `error.tsx` already exists; `EmptyState` for zero-data views; Recharts for charts | ✅ PASS |

**No violations. No Complexity Tracking needed.**

---

## Project Structure

### Documentation (this feature)

```text
specs/006-dashboard-overview/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code

```text
src/types/
└── dashboard.ts                    ← DashboardSummary, MonthlyTrend, CategoryBreakdown,
                                       RecentTransaction, CurrentMonth, DashboardData

src/server/repositories/
└── dashboard.repository.ts         ← getMonthlySummary, getMonthlyTrends,
                                       getCategoryBreakdown, getRecentTransactions

src/server/services/
└── dashboard.service.ts            ← getDashboardData (parallel fetch + derived values)

src/data/
└── dashboard.ts                    ← getDashboardData (session guard + service call)

src/features/dashboard/components/
├── WelcomeCard.tsx                 ← zero-data onboarding card (Server Component)
├── DashboardHeader.tsx             ← h1 + month label (Server Component)
├── SummaryCard.tsx                 ← single stat card, reusable (Server Component)
├── SummaryCards.tsx                ← 4-card grid (Server Component)
├── MonthlyTrendChart.tsx           ← Recharts AreaChart ("use client")
├── CategoryBreakdownCard.tsx       ← ranked category list with Progress (Server Component)
├── CurrentMonthCard.tsx            ← income/expense/balance rows (Server Component)
├── RecentTransactionItem.tsx       ← single transaction row (Server Component)
└── RecentTransactionsList.tsx      ← card wrapper + list (Server Component)

src/app/(dashboard)/dashboard/
├── page.tsx                        ← async Server Component, replaces placeholder
└── loading.tsx                     ← updated skeleton matching real layout
```

**Structure Decision**: Next.js App Router web application. Feature components live under `src/features/dashboard/components/` following the established pattern used by `expenses` and `income` modules. Data layer follows the existing `data/ → services/ → repositories/ → Prisma` chain.

---

## Build Phases

### Phase 1 — Install Dependencies

Run before writing any code:

```bash
npx shadcn@latest add progress
npx shadcn@latest add tabs
npm install recharts
```

Verify `src/components/ui/progress.tsx` exists after install.

**Gate**: `npx tsc --noEmit` — must pass with zero errors.

---

### Phase 2 — Types and Repository

#### Step 1 — `src/types/dashboard.ts`

Define all six interfaces exported from this file:

```typescript
export interface DashboardSummary {
  totalIncome: number;
  totalExpenses: number;
  netSavings: number;
  savingsRate: number;  // (netSavings / totalIncome) * 100, or 0
}

export interface MonthlyTrend {
  month: string;        // short label e.g. "Jan"
  income: number;
  expenses: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  percentage: number;   // (category.total / totalExpenses) * 100, or 0
  count: number;
}

export interface RecentTransaction {
  id: string;
  title: string;
  amount: number;
  type: "expense" | "income";
  category: string;     // expense category or income source
  date: Date;
}

export interface CurrentMonth {
  income: number;
  expenses: number;
  balance: number;      // income - expenses
  label: string;        // e.g. "June 2026"
}

export interface DashboardData {
  summary: DashboardSummary;
  monthlyTrends: MonthlyTrend[];
  categoryBreakdown: CategoryBreakdown[];
  recentTransactions: RecentTransaction[];
  currentMonth: CurrentMonth;
  hasData: boolean;     // true when any income or expense exists
}
```

#### Step 2 — `src/server/repositories/dashboard.repository.ts`

Four functions, all scoped by `userId`, all importing `db` from `@/lib/prisma`. Import `RecentTransaction` type from `@/types/dashboard`.

**`getMonthlySummary`**

```typescript
export async function getMonthlySummary(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ totalIncome: number; totalExpenses: number }> {
  const [incomeResult, expenseResult] = await Promise.all([
    db.income.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
    db.expense.aggregate({
      where: { userId, date: { gte: startDate, lte: endDate } },
      _sum: { amount: true },
    }),
  ]);
  return {
    totalIncome: incomeResult._sum.amount ?? 0,
    totalExpenses: expenseResult._sum.amount ?? 0,
  };
}
```

**`getMonthlyTrends`**

```typescript
export async function getMonthlyTrends(
  userId: string,
  months: number = 6,
): Promise<{ month: string; income: number; expenses: number }[]> {
  const now = new Date();
  const monthRanges = Array.from({ length: months }, (_, i) => {
    const offset = months - 1 - i;  // oldest first
    const d = new Date(now.getFullYear(), now.getMonth() - offset, 1);
    const year = d.getFullYear();
    const month = d.getMonth();
    return {
      label: new Intl.DateTimeFormat("en-IN", { month: "short" }).format(d),
      startDate: new Date(year, month, 1, 0, 0, 0),
      endDate: new Date(year, month + 1, 0, 23, 59, 59),
    };
  });

  const results = await Promise.all(
    monthRanges.map(({ startDate, endDate }) =>
      getMonthlySummary(userId, startDate, endDate),
    ),
  );

  return monthRanges.map(({ label }, i) => ({
    month: label,
    income: results[i].totalIncome,
    expenses: results[i].totalExpenses,
  }));
}
```

**`getCategoryBreakdown`**

```typescript
export async function getCategoryBreakdown(
  userId: string,
  startDate: Date,
  endDate: Date,
): Promise<{ category: string; total: number; count: number }[]> {
  const rows = await db.expense.groupBy({
    by: ["category"],
    where: { userId, date: { gte: startDate, lte: endDate } },
    _sum: { amount: true },
    _count: { id: true },
    orderBy: { _sum: { amount: "desc" } },
  });
  return rows.map((r) => ({
    category: r.category,
    total: r._sum.amount ?? 0,
    count: r._count.id,
  }));
}
```

**`getRecentTransactions`**

```typescript
export async function getRecentTransactions(
  userId: string,
  limit: number = 8,
): Promise<RecentTransaction[]> {
  const [expenses, incomes] = await Promise.all([
    db.expense.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, category: true, date: true },
    }),
    db.income.findMany({
      where: { userId },
      orderBy: { date: "desc" },
      take: limit,
      select: { id: true, title: true, amount: true, source: true, date: true },
    }),
  ]);

  const mapped: RecentTransaction[] = [
    ...expenses.map((e) => ({
      id: e.id,
      title: e.title,
      amount: e.amount,
      type: "expense" as const,
      category: e.category,
      date: e.date,
    })),
    ...incomes.map((i) => ({
      id: i.id,
      title: i.title,
      amount: i.amount,
      type: "income" as const,
      category: i.source,
      date: i.date,
    })),
  ];

  return mapped.sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, limit);
}
```

**Gate**: `npx tsc --noEmit` — zero errors.

---

### Phase 3 — Service and Data Function

#### Step 3 — `src/server/services/dashboard.service.ts`

```typescript
import * as dashboardRepository from "@/server/repositories/dashboard.repository";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(userId: string): Promise<DashboardData> {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const startDate = new Date(year, month, 1, 0, 0, 0);
  const endDate = new Date(year, month + 1, 0, 23, 59, 59);

  const [summary, monthlyTrends, rawCategories, recentTransactions] = await Promise.all([
    dashboardRepository.getMonthlySummary(userId, startDate, endDate),
    dashboardRepository.getMonthlyTrends(userId, 6),
    dashboardRepository.getCategoryBreakdown(userId, startDate, endDate),
    dashboardRepository.getRecentTransactions(userId, 8),
  ]);

  const netSavings = summary.totalIncome - summary.totalExpenses;
  const savingsRate =
    summary.totalIncome > 0 ? (netSavings / summary.totalIncome) * 100 : 0;

  const categoryBreakdown = rawCategories.map((c) => ({
    ...c,
    percentage:
      summary.totalExpenses > 0 ? (c.total / summary.totalExpenses) * 100 : 0,
  }));

  const label = new Intl.DateTimeFormat("en-IN", {
    month: "long",
    year: "numeric",
  }).format(now);

  const hasData =
    summary.totalIncome > 0 ||
    summary.totalExpenses > 0 ||
    recentTransactions.length > 0;

  return {
    summary: {
      totalIncome: summary.totalIncome,
      totalExpenses: summary.totalExpenses,
      netSavings,
      savingsRate,
    },
    monthlyTrends,
    categoryBreakdown,
    recentTransactions,
    currentMonth: {
      income: summary.totalIncome,
      expenses: summary.totalExpenses,
      balance: summary.totalIncome - summary.totalExpenses,
      label,
    },
    hasData,
  };
}
```

#### Step 4 — `src/data/dashboard.ts`

```typescript
import { getSession } from "@/lib/auth";
import * as dashboardService from "@/server/services/dashboard.service";
import type { DashboardData } from "@/types/dashboard";

export async function getDashboardData(): Promise<DashboardData> {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");
  return dashboardService.getDashboardData(session.userId);
}
```

**Gate**: `npx tsc --noEmit` — zero errors.

---

### Phase 4 — Server Components

All components live in `src/features/dashboard/components/`. All are Server Components (no `"use client"`) except `MonthlyTrendChart`.

#### Step 5 — `WelcomeCard.tsx`

```typescript
import Link from "next/link";
import { Wallet } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function WelcomeCard(): React.JSX.Element {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <Wallet className="h-12 w-12 text-muted-foreground mb-4" />
        <h2 className="text-xl font-semibold mb-2">Welcome to Expense Tracker</h2>
        <p className="text-sm text-muted-foreground max-w-sm mb-6">
          Start by adding your first income or expense to see your dashboard come to life.
        </p>
        <div className="flex gap-3">
          <Button asChild>
            <Link href="/income">Add Income</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/expenses">Add Expense</Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Step 6 — `DashboardHeader.tsx`

```typescript
interface DashboardHeaderProps {
  label: string;
}

export function DashboardHeader({ label }: DashboardHeaderProps): React.JSX.Element {
  return (
    <div>
      <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
      <p className="text-sm text-muted-foreground mt-1">Overview for {label}</p>
    </div>
  );
}
```

#### Step 7 — `SummaryCard.tsx`

```typescript
import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface SummaryCardProps {
  label: string;
  value: string;
  description?: string;
  icon: LucideIcon;
  iconClassName?: string;
  valueClassName?: string;
}

export function SummaryCard({
  label, value, description, icon: Icon, iconClassName, valueClassName,
}: SummaryCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{label}</CardTitle>
        <Icon className={cn("h-4 w-4", iconClassName)} />
      </CardHeader>
      <CardContent>
        <div className={cn("text-2xl font-bold", valueClassName)}>{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Step 8 — `SummaryCards.tsx`

```typescript
import { ArrowUpCircle, ArrowDownCircle, PiggyBank, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/utils/formatCurrency";
import type { DashboardSummary } from "@/types/dashboard";
import { SummaryCard } from "./SummaryCard";

interface SummaryCardsProps {
  summary: DashboardSummary;
}

export function SummaryCards({ summary }: SummaryCardsProps): React.JSX.Element {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      <SummaryCard
        label="Total Income"
        value={formatCurrency(summary.totalIncome)}
        icon={ArrowUpCircle}
        iconClassName="text-green-500"
        valueClassName="text-green-600"
      />
      <SummaryCard
        label="Total Expenses"
        value={formatCurrency(summary.totalExpenses)}
        icon={ArrowDownCircle}
        iconClassName="text-red-500"
        valueClassName="text-red-600"
      />
      <SummaryCard
        label="Net Savings"
        value={formatCurrency(summary.netSavings)}
        icon={PiggyBank}
        iconClassName="text-blue-500"
        valueClassName={summary.netSavings >= 0 ? "text-green-600" : "text-red-600"}
      />
      <SummaryCard
        label="Savings Rate"
        value={`${summary.savingsRate.toFixed(1)}%`}
        description="of income saved this month"
        icon={TrendingUp}
        iconClassName="text-purple-500"
      />
    </div>
  );
}
```

#### Step 9 — `CategoryBreakdownCard.tsx`

```typescript
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CategoryBreakdown } from "@/types/dashboard";

interface CategoryBreakdownCardProps {
  breakdown: CategoryBreakdown[];
}

export function CategoryBreakdownCard({ breakdown }: CategoryBreakdownCardProps): React.JSX.Element {
  const visible = breakdown.slice(0, 6);
  const remaining = breakdown.length - 6;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        {breakdown.length === 0 ? (
          <EmptyState
            title="No expenses this month"
            description="Add some expenses to see your spending breakdown."
          />
        ) : (
          <div className="space-y-3">
            {visible.map((item) => (
              <div key={item.category}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="font-medium truncate">{item.category}</span>
                  <span className="text-muted-foreground ml-2 shrink-0">
                    {formatCurrency(item.total)} · {item.percentage.toFixed(1)}%
                  </span>
                </div>
                <Progress value={item.percentage} className="h-1.5" />
              </div>
            ))}
            {remaining > 0 && (
              <p className="text-xs text-muted-foreground pt-1">
                and {remaining} more {remaining === 1 ? "category" : "categories"}
              </p>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

#### Step 10 — `CurrentMonthCard.tsx`

```typescript
import { ArrowUpCircle, ArrowDownCircle, Wallet } from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { formatCurrency } from "@/utils/formatCurrency";
import type { CurrentMonth } from "@/types/dashboard";

interface CurrentMonthCardProps {
  currentMonth: CurrentMonth;
}

export function CurrentMonthCard({ currentMonth }: CurrentMonthCardProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month</CardTitle>
      </CardHeader>
      <CardContent className="space-y-0">
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <ArrowUpCircle className="h-4 w-4 text-green-500" />
            <span>Income</span>
          </div>
          <span className="text-sm font-medium text-green-600">
            {formatCurrency(currentMonth.income)}
          </span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <ArrowDownCircle className="h-4 w-4 text-red-500" />
            <span>Expenses</span>
          </div>
          <span className="text-sm font-medium text-red-600">
            {formatCurrency(currentMonth.expenses)}
          </span>
        </div>
        <Separator className="my-3" />
        <div className="flex items-center justify-between py-1">
          <div className="flex items-center gap-2 text-sm">
            <Wallet className="h-4 w-4 text-muted-foreground" />
            <span>Balance</span>
          </div>
          <span
            className={cn(
              "text-sm font-medium",
              currentMonth.balance >= 0 ? "text-green-600" : "text-red-600",
            )}
          >
            {formatCurrency(currentMonth.balance)}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
```

#### Step 11 — `RecentTransactionItem.tsx`

```typescript
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatDate } from "@/utils/formatDate";
import type { RecentTransaction } from "@/types/dashboard";

interface RecentTransactionItemProps {
  transaction: RecentTransaction;
}

export function RecentTransactionItem({ transaction }: RecentTransactionItemProps): React.JSX.Element {
  const isExpense = transaction.type === "expense";
  return (
    <div className="flex items-center gap-3 py-2">
      <div
        className={cn(
          "h-9 w-9 rounded-full flex items-center justify-center shrink-0",
          isExpense ? "bg-red-50" : "bg-green-50",
        )}
      >
        {isExpense ? (
          <ArrowDownCircle className="h-4 w-4 text-red-500" />
        ) : (
          <ArrowUpCircle className="h-4 w-4 text-green-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{transaction.title}</p>
        <p className="text-xs text-muted-foreground truncate">{transaction.category}</p>
      </div>
      <div className="text-right shrink-0">
        <p
          className={cn(
            "text-sm font-medium",
            isExpense ? "text-red-600" : "text-green-600",
          )}
        >
          {isExpense ? "–" : "+"}{formatCurrency(transaction.amount)}
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDate(transaction.date)}
        </p>
      </div>
    </div>
  );
}
```

#### Step 12 — `RecentTransactionsList.tsx`

```typescript
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/shared/EmptyState";
import type { RecentTransaction } from "@/types/dashboard";
import { RecentTransactionItem } from "./RecentTransactionItem";

interface RecentTransactionsListProps {
  transactions: RecentTransaction[];
}

export function RecentTransactionsList({ transactions }: RecentTransactionsListProps): React.JSX.Element {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Recent Transactions</CardTitle>
        <Link
          href="/expenses"
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          View all
        </Link>
      </CardHeader>
      <CardContent>
        {transactions.length === 0 ? (
          <EmptyState
            title="No recent transactions"
            description="Your recent income and expense records will appear here."
          />
        ) : (
          <div className="divide-y">
            {transactions.map((t) => (
              <RecentTransactionItem key={t.id} transaction={t} />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

**Gate**: `npx tsc --noEmit` — zero errors.

---

### Phase 5 — Client Component (Chart)

#### Step 13 — `MonthlyTrendChart.tsx`

```typescript
"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/utils/formatCurrency";
import type { MonthlyTrend } from "@/types/dashboard";

interface MonthlyTrendChartProps {
  trends: MonthlyTrend[];
}

export function MonthlyTrendChart({ trends }: MonthlyTrendChartProps): React.JSX.Element {
  const hasAnyData = trends.some((t) => t.income > 0 || t.expenses > 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Overview</CardTitle>
      </CardHeader>
      <CardContent>
        {!hasAnyData ? (
          <div className="h-75 flex items-center justify-center">
            <p className="text-sm text-muted-foreground">No data yet</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={trends} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="incomeGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expensesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                tickFormatter={(v: number) =>
                  `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`
                }
                tick={{ fontSize: 12 }}
                tickLine={false}
                axisLine={false}
              />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Area
                type="monotone"
                dataKey="income"
                name="Income"
                stroke="#22c55e"
                fill="url(#incomeGradient)"
                strokeWidth={2}
                dot={false}
              />
              <Area
                type="monotone"
                dataKey="expenses"
                name="Expenses"
                stroke="#ef4444"
                fill="url(#expensesGradient)"
                strokeWidth={2}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
```

**Gate**: `npx tsc --noEmit` — zero errors.

---

### Phase 6 — Page and Loading

#### Step 14 — `app/(dashboard)/dashboard/page.tsx`

Replace the "Coming soon" placeholder (file exists — overwrite it):

```typescript
import { getDashboardData } from "@/data/dashboard";
import { WelcomeCard }            from "@/features/dashboard/components/WelcomeCard";
import { DashboardHeader }        from "@/features/dashboard/components/DashboardHeader";
import { SummaryCards }           from "@/features/dashboard/components/SummaryCards";
import { MonthlyTrendChart }      from "@/features/dashboard/components/MonthlyTrendChart";
import { CategoryBreakdownCard }  from "@/features/dashboard/components/CategoryBreakdownCard";
import { CurrentMonthCard }       from "@/features/dashboard/components/CurrentMonthCard";
import { RecentTransactionsList } from "@/features/dashboard/components/RecentTransactionsList";

export default async function DashboardPage(): Promise<React.ReactElement> {
  const data = await getDashboardData();
  const { summary, monthlyTrends, categoryBreakdown, recentTransactions, currentMonth, hasData } = data;

  return (
    <div className="space-y-6">
      {!hasData && <WelcomeCard />}
      <DashboardHeader label={currentMonth.label} />
      <SummaryCards summary={summary} />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <MonthlyTrendChart trends={monthlyTrends} />
        </div>
        <CategoryBreakdownCard breakdown={categoryBreakdown} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CurrentMonthCard currentMonth={currentMonth} />
        <RecentTransactionsList transactions={recentTransactions} />
      </div>
    </div>
  );
}
```

#### Step 15 — `app/(dashboard)/dashboard/loading.tsx`

Replace the partial skeleton to match the real dashboard layout exactly:

```typescript
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading(): React.ReactElement {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-4 w-32" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="lg:col-span-2 h-72 rounded-lg" />
        <Skeleton className="h-72 rounded-lg" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Skeleton className="h-48 rounded-lg" />
        <Skeleton className="h-48 rounded-lg" />
      </div>
    </div>
  );
}
```

**Gate**: `npx tsc --noEmit` — zero errors after final phase.

---

## Complexity Tracking

No constitution violations. No entries required.
