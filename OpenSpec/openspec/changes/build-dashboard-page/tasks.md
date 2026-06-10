## 1. Install Dependencies

- [x] 1.1 Check `src/components/ui/` for existing Shadcn components (card, tabs, progress, separator, skeleton) and install any that are missing via `npx shadcn@latest add <component>`
- [x] 1.2 Install Recharts: `npm install recharts` and `npm install @types/recharts -D`

## 2. Dashboard Types

- [x] 2.1 Create `src/types/dashboard.ts` with interfaces: `DashboardSummary`, `MonthlyTrend`, `CategoryBreakdown`, `RecentTransaction`, `DashboardData`

## 3. Dashboard Repository

- [x] 3.1 Create `src/server/repositories/dashboard.repository.ts`
- [x] 3.2 Implement `getSummary(userId, startDate, endDate)` — Prisma aggregate sums for income and expenses in date range
- [x] 3.3 Implement `getMonthlyTrends(userId, months = 6)` — fetch last N months of transactions, group by month in JS, return sorted oldest-to-newest
- [x] 3.4 Implement `getCategoryBreakdown(userId, startDate, endDate)` — group expenses by category, sum amount and count, order by total descending
- [x] 3.5 Implement `getRecentTransactions(userId, limit = 8)` — fetch recent expenses and incomes, merge and sort by date descending, map to `RecentTransaction` shape

## 4. Dashboard Service

- [x] 4.1 Create `src/server/services/dashboard.service.ts`
- [x] 4.2 Implement `getDashboardData(userId)` — compute current month date range (first/last day at 00:00:00 / 23:59:59)
- [x] 4.3 Call all four repository methods in `Promise.all` for parallel fetching
- [x] 4.4 Compute derived values: `netSavings`, `savingsRate`, and category `percentage` fields
- [x] 4.5 Return the full `DashboardData` shape

## 5. Data Layer Function

- [x] 5.1 Create `src/data/dashboard.ts` — call `getSession()`, throw `"Unauthorized"` if missing, then delegate to `dashboardService.getDashboardData(session.userId)`

## 6. Dashboard Page

- [x] 6.1 Create `src/app/(dashboard)/dashboard/page.tsx` as an async Server Component
- [x] 6.2 Call `getDashboardData()` and render all sections using props
- [x] 6.3 Implement the two-row grid layout: `DashboardHeader`, `SummaryCards`, chart+category grid, then `CurrentMonthCard`+`RecentTransactionsList`
- [x] 6.4 Show `WelcomeCard` above `SummaryCards` when both `totalIncome` and `totalExpenses` are zero

## 7. Dashboard Components

- [x] 7.1 Create `src/features/dashboard/components/DashboardHeader.tsx` — page title "Dashboard" and subtitle "Overview for {currentMonth}"
- [x] 7.2 Create `src/features/dashboard/components/SummaryCard.tsx` — reusable stat card accepting `label`, `value`, `description`, `icon`, `iconColor`, `valueColor`
- [x] 7.3 Create `src/features/dashboard/components/SummaryCards.tsx` — 4-up responsive grid rendering Total Income, Total Expenses, Net Savings, Savings Rate using `SummaryCard`
- [x] 7.4 Create `src/features/dashboard/components/MonthlyTrendChart.tsx` — `"use client"` Recharts `AreaChart` inside a Shadcn Card; income in green, expenses in red, height 300px, formatted currency tooltip
- [x] 7.5 Create `src/features/dashboard/components/CategoryBreakdownCard.tsx` — Shadcn Card with Shadcn Progress bars, category name, INR amount, and percentage; max 6 items with overflow label; empty state for no expenses
- [x] 7.6 Create `src/features/dashboard/components/CurrentMonthCard.tsx` — Shadcn Card "This Month" with income row (green), Separator, expenses row (red), Separator, and balance row (green/red based on sign)
- [x] 7.7 Create `src/features/dashboard/components/RecentTransactionItem.tsx` — single transaction row: colored icon circle, title + category (muted), signed amount, date
- [x] 7.8 Create `src/features/dashboard/components/RecentTransactionsList.tsx` — Shadcn Card with "View all" link to /expenses; renders `RecentTransactionItem` per entry; empty state for no transactions
- [x] 7.9 Create `src/features/dashboard/components/WelcomeCard.tsx` — Shadcn Card with welcome message and two CTA buttons: "Add Income" → /income, "Add Expense" → /expenses

## 8. Loading Skeleton

- [x] 8.1 Create `src/app/(dashboard)/dashboard/loading.tsx` using Shadcn Skeleton component
- [x] 8.2 Skeleton layout: 4 stat card skeletons in a grid, large chart skeleton, smaller category breakdown skeleton, two medium skeletons for the bottom row

## 9. Verification

- [x] 9.1 Run `npx tsc --noEmit` and fix all TypeScript errors
- [x] 9.2 Run `npm run lint` and fix all lint errors
- [ ] 9.3 Verify new user (zero data) sees `WelcomeCard` with both CTA buttons
- [x] 9.4 Verify summary cards update after adding income or expense
- [ ] 9.5 Verify net savings and savings rate calculate correctly
- [ ] 9.6 Verify monthly chart renders correct month labels and data series
- [ ] 9.7 Verify category breakdown shows progress bars and "and N more" label when applicable
- [ ] 9.8 Verify recent transactions list shows latest 8 mixed records with correct sign/color
- [ ] 9.9 Verify loading skeleton matches dashboard structure
- [ ] 9.10 Verify all amounts display in INR format (₹)
- [ ] 9.11 Verify dashboard is responsive on mobile, tablet, and desktop viewports
