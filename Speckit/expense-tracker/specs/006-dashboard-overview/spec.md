# Feature Specification: Dashboard Overview

**Feature Branch**: `006-dashboard-overview`

**Created**: 2026-06-10

**Status**: Clarified

**Input**: User description: "Build the Dashboard page for the expense tracker. The Expense and Income modules are fully implemented. The app shell and sidebar are in place. The dashboard gives users a snapshot of their current financial situation at a glance. All data shown is scoped to the currently authenticated user. The dashboard shows: Summary cards — four key numbers for the current month: total income, total expenses, net savings, and savings rate. Net savings is income minus expenses. Savings rate is net savings divided by total income expressed as a percentage. Monthly trend chart — a visual comparison of income vs expenses across the last 6 months so the user can spot patterns over time. Category breakdown — a ranked list of expense categories for the current month showing how much was spent in each category and what percentage of total spending it represents. Current month snapshot — a focused view of just this month's income, expenses, and the resulting balance. Recent transactions — the 8 most recent records across both expenses and income combined, showing what the user has been doing lately. New users who have no data yet see a welcome state with clear calls to action to add their first income or expense. All amounts display in INR. All dates display as MMM dd, yyyy. The dashboard is read-only — no creating or editing here."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — View Financial Snapshot (Priority: P1)

A logged-in user lands on the Dashboard page and immediately sees four summary cards for the current month: Total Income, Total Expenses, Net Savings, and Savings Rate. All figures are scoped exclusively to their own account. Amounts are formatted in INR and the page title shows the current month label (e.g. "June 2026").

**Why this priority**: The summary cards are the primary value of the dashboard — a single glance answer to "how am I doing this month?" without navigating elsewhere.

**Independent Test**: Can be fully tested by adding a known income and expense record, navigating to the Dashboard, and verifying the four summary card values match the expected calculations.

**Acceptance Scenarios**:

1. **Given** the user has income and expense records for the current month, **When** they visit the Dashboard, **Then** the Total Income card shows the sum of all current-month income in INR format.
2. **Given** the user has income and expense records, **When** they view the Dashboard, **Then** Net Savings equals Total Income minus Total Expenses, and Savings Rate equals (Net Savings / Total Income) × 100, displayed as a percentage rounded to one decimal place.
3. **Given** Total Income is zero, **When** the user views the Dashboard, **Then** Savings Rate displays as 0% (no division by zero error).
4. **Given** Net Savings is negative (expenses exceed income), **When** the user views the Dashboard, **Then** the Net Savings value is displayed in red; when non-negative it is displayed in green.

---

### User Story 2 — Spot Monthly Trends (Priority: P2)

A user views the Monthly Overview chart and sees a visual area chart comparing their income vs expenses across the last 6 months. They can identify months where spending spiked or savings improved at a glance.

**Why this priority**: Trend visibility is the second most valuable dashboard feature — it answers "am I improving over time?" which drives financial behaviour change.

**Independent Test**: Can be tested by adding records spread across multiple months and confirming the chart renders the correct monthly totals for each of the last 6 months, ordered oldest to newest.

**Acceptance Scenarios**:

1. **Given** the user has records spanning multiple months, **When** they view the Dashboard, **Then** the Monthly Overview chart shows up to 6 months of data with income and expenses as separate area series.
2. **Given** a month where the user has no records, **When** that month appears in the chart, **Then** both income and expenses for that month display as zero — no gap or error.
3. **Given** all 6 months have zero data, **When** the user views the chart, **Then** a muted "No data yet" message is displayed instead of an empty chart.

---

### User Story 3 — Understand Spending by Category (Priority: P2)

A user views the Category Breakdown card and sees a ranked list of expense categories for the current month, each showing the total amount spent and the percentage of total spending. A Shadcn Progress bar fills proportionally to help them quickly spot which categories dominate.

**Why this priority**: Category visibility directly enables spending awareness — the user can see where money is going without manually summing records.

**Independent Test**: Can be tested by adding expenses across different categories in the current month and confirming the breakdown lists each category with correct totals and percentages, ranked by total descending.

**Acceptance Scenarios**:

1. **Given** the user has current-month expenses in multiple categories, **When** they view the Dashboard, **Then** the Category Breakdown shows each category with its total in INR and its percentage of total spending.
2. **Given** more than 6 expense categories exist this month, **When** the user views the breakdown, **Then** only the top 6 are shown and a footer note reads "and N more categories."
3. **Given** the user has no expenses this month, **When** they view the Category Breakdown, **Then** an empty state message "No expenses this month" is displayed.

---

### User Story 4 — Review Recent Activity (Priority: P2)

A user glances at the Recent Transactions list on the Dashboard to see the 8 most recent records from both expenses and income combined, sorted by date descending. Each row shows the title, category/source, signed amount (expenses negative, income positive), and date. A "View all" link navigates to the Expenses page.

**Why this priority**: Recent activity answers "what did I do lately?" — it surfaces the most time-relevant data and links back to the detailed modules.

**Independent Test**: Can be tested by adding a mix of expense and income records on different dates, then verifying the Dashboard shows the 8 most recent across both types in correct date-descending order.

**Acceptance Scenarios**:

1. **Given** the user has more than 8 combined records, **When** they view the Recent Transactions list, **Then** exactly the 8 most recent records are shown regardless of type.
2. **Given** recent transactions include both expenses and income, **When** displayed in the list, **Then** expenses show a red "–" prefixed amount and income shows a green "+" prefixed amount.
3. **Given** the user has no records at all, **When** they view the Recent Transactions list, **Then** the empty state message "No recent transactions" is shown.
4. **Given** the user clicks "View all," **When** they are taken to the next page, **Then** they land on `/expenses`.

---

### User Story 5 — New User Welcome State (Priority: P3)

A brand-new user with no income or expense records visits the Dashboard and sees a welcome card with a friendly message and two buttons: "Add Income" and "Add Expense." All other dashboard sections are still rendered with zero values, but the welcome card prompts immediate action.

**Why this priority**: An empty dashboard without guidance creates confusion; the welcome state converts a blank screen into an onboarding prompt.

**Independent Test**: Can be tested by logging in as a new user with no records and verifying the WelcomeCard appears above the other sections, with "Add Income" linking to `/income` and "Add Expense" linking to `/expenses`.

**Acceptance Scenarios**:

1. **Given** a user has no income and no expense records, **When** they visit the Dashboard, **Then** the WelcomeCard is displayed above the summary cards.
2. **Given** the WelcomeCard is shown, **When** the user clicks "Add Income," **Then** they are taken to `/income`.
3. **Given** the WelcomeCard is shown, **When** the user clicks "Add Expense," **Then** they are taken to `/expenses`.
4. **Given** a user who previously had no data adds their first record, **When** they return to the Dashboard, **Then** the WelcomeCard is no longer shown.

---

### User Story 6 — Dashboard Is Read-Only (Priority: P1)

A user views the Dashboard and has no ability to create, edit, or delete any financial record from it. The dashboard is purely a read-only overview surface.

**Why this priority**: Read-only scope prevents accidental mutations and keeps the dashboard role clear — it summarises data managed elsewhere.

**Independent Test**: Can be verified by inspecting every interactive element on the Dashboard and confirming none of them trigger create, edit, or delete operations.

**Acceptance Scenarios**:

1. **Given** the user is on the Dashboard, **When** they inspect all interactive elements, **Then** no create, edit, or delete actions are available.
2. **Given** the user is on the Dashboard, **When** they view the page, **Then** no forms or form submission buttons are present.

---

### Edge Cases

- What happens when Total Income is zero but Total Expenses are not? Savings Rate displays as 0%. Net Savings shows the negative value in red.
- What happens when a database fetch fails? The page renders an `error.tsx` boundary with a "Try again" action.
- What happens when the dashboard loads? A colocated `loading.tsx` file renders a skeleton that mirrors the real dashboard layout (4 stat card skeletons, two-column chart/category row, two-column current-month/transactions row).
- What if a user has income but no expenses this month? Category Breakdown shows the empty state; the trend chart still renders the income data.
- What happens when there are only 1–7 combined recent records? All records are shown; the list does not pad with placeholders.

---

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Dashboard MUST display four summary cards for the current calendar month: Total Income, Total Expenses, Net Savings (income minus expenses), and Savings Rate ((net savings / total income) × 100, or 0 when income is zero). All amounts MUST be formatted in INR.
- **FR-002**: The Dashboard MUST display a Monthly Overview area chart covering the last 6 complete months plus the current month, showing income and expenses as separate coloured series, sorted oldest to newest.
- **FR-003**: When all 6 months in the trend data have zero income and zero expenses, the chart area MUST display a muted "No data yet" message instead of an empty chart.
- **FR-004**: The Dashboard MUST display a Category Breakdown for the current month listing expense categories ranked by total amount descending, each showing the category name, total INR amount, percentage of total spending, and a proportional progress bar.
- **FR-005**: The Category Breakdown MUST show at most 6 categories. When more than 6 categories exist, a footer note "and N more categories" MUST be appended below the list.
- **FR-006**: When the user has no expenses in the current month, the Category Breakdown MUST display an empty state message "No expenses this month."
- **FR-007**: The Dashboard MUST display a Current Month card showing this month's total income, total expenses, and balance (income minus expenses). The balance MUST be coloured green when ≥ 0 and red when negative.
- **FR-008**: The Dashboard MUST display a Recent Transactions list showing the 8 most recent records across both expenses and income combined, sorted by date descending. Each record MUST show: title, category or income source, signed amount (expenses as "–INR", income as "+INR"), and date formatted as MMM dd, yyyy.
- **FR-009**: When the user has no recent transactions, the Recent Transactions list MUST display an empty state message "No recent transactions."
- **FR-010**: The Recent Transactions card MUST include a "View all" link in the header navigating to `/expenses`.
- **FR-011**: When `hasData` is false (both total income and total expenses across all time are zero), the Dashboard MUST render a WelcomeCard above all other sections. The WelcomeCard MUST include an "Add Income" button linking to `/income` and an "Add Expense" button linking to `/expenses`.
- **FR-012**: All dashboard sections MUST remain visible even when `hasData` is false — they render with zero values alongside the WelcomeCard rather than being hidden.
- **FR-013**: The Dashboard MUST be read-only; no create, edit, or delete actions are permitted on this page.
- **FR-014**: All data shown on the Dashboard MUST be scoped to the currently authenticated user. Unauthenticated access MUST be rejected.
- **FR-015**: The Dashboard page MUST have a colocated `loading.tsx` skeleton that mirrors the full dashboard layout (row of 4 stat card skeletons, two-column chart + category row, two-column current-month + transactions row).
- **FR-016**: The Dashboard page MUST have a colocated `error.tsx` boundary so database or session errors surface a recoverable error state rather than a crash.

### Key Entities

- **DashboardSummary**: Derived aggregate for the current calendar month. Fields: `totalIncome` (sum of all income amounts), `totalExpenses` (sum of all expense amounts), `netSavings` (totalIncome − totalExpenses), `savingsRate` ((netSavings / totalIncome) × 100 or 0).
- **MonthlyTrend**: One entry per month over the last 6 months. Fields: `month` (short label, e.g. "Jan"), `income` (month total), `expenses` (month total). Array sorted oldest to newest.
- **CategoryBreakdown**: One entry per expense category for the current month. Fields: `category` (name), `total` (INR amount), `percentage` ((category total / total expenses) × 100 or 0), `count` (number of records in that category). Ranked by `total` descending.
- **RecentTransaction**: One entry per recent record. Fields: `id`, `title`, `amount`, `type` ("expense" | "income"), `category` (expense category or income source), `date`.
- **CurrentMonth**: Aggregate for the current calendar month. Fields: `income`, `expenses`, `balance` (income − expenses), `label` (e.g. "June 2026").
- **DashboardData**: The complete data object returned by the data layer. Fields: `summary`, `monthlyTrends`, `categoryBreakdown`, `recentTransactions`, `currentMonth`, `hasData` (true when totalIncome > 0 or totalExpenses > 0 across all time).

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user with existing records can view all dashboard sections — summary cards, trend chart, category breakdown, current month snapshot, and recent transactions — within 3 seconds of navigating to the Dashboard.
- **SC-002**: All monetary amounts on the Dashboard are formatted in INR using the shared formatter; no raw unformatted numbers appear anywhere on the page.
- **SC-003**: All dates shown in recent transactions are formatted as MMM dd, yyyy; no raw ISO date strings appear on the page.
- **SC-004**: 100% of data shown belongs to the currently authenticated user; no cross-user data leakage is possible.
- **SC-005**: A new user with zero records sees the WelcomeCard above a fully rendered (zero-value) dashboard within 3 seconds of page load.
- **SC-006**: The Dashboard's loading skeleton is visible within 200ms of navigation and is replaced by real content once the data fetch completes — users never see a blank white page.
- **SC-007**: All four data operations (monthly summary, 6-month trends, category breakdown, recent transactions) are fetched in a single parallel round-trip; no sequential waterfall requests occur.

---

## Assumptions

- The Expense and Income modules are fully implemented and their database records are available for aggregation.
- The shared authenticated layout and session middleware already protect `/dashboard/*`; the Dashboard page does not re-implement auth guarding.
- The `formatCurrency` utility at `src/utils/formatCurrency.ts` and `formatDate` utility at `src/utils/formatDate.ts` are already implemented and shared.
- The `EmptyState` component at `src/components/shared/EmptyState.tsx` is already implemented and accepts icon, title, description, and optional action slot props.
- Recharts is used for all chart rendering as mandated by the project constitution; no alternative charting library may be introduced.
- Category breakdown is scoped to the current calendar month only; no custom date range selection is available on the dashboard.
- The "last 6 months" in the monthly trend chart includes the current partial month plus the 5 preceding complete months.
- No pagination is applied to any dashboard section; the recent transactions list is always capped at 8 records by the data layer.
- Dashboard data is not cached beyond Next.js default server-component caching; a full page refresh always fetches fresh data.

---

## Clarifications

### Session 2026-06-10

- Q: Where does data fetching happen and is there any client-side fetching? → A: All data fetching happens in a single async Server Component. The page calls `getDashboardData()` from `src/data/dashboard.ts`, which calls `getSession()` internally. The service fetches all required data in parallel via `Promise.all`. No client-side fetching, no `useEffect`, and no Route Handlers are used.

- Q: What is the complete data shape returned to the dashboard page? → A: A `DashboardData` interface with six fields: `summary` (DashboardSummary), `monthlyTrends` (MonthlyTrend[]), `categoryBreakdown` (CategoryBreakdown[]), `recentTransactions` (RecentTransaction[]), `currentMonth` (CurrentMonth), and `hasData` (boolean — false when all totals are zero). Full interface definitions are in `src/types/dashboard.ts`.

- Q: How is the monthly trend data computed? → A: The repository computes start/end date boundaries for each of the last N months (default 6), queries income and expense totals for each month in parallel, and returns the array sorted oldest to newest. Month labels use `Intl.DateTimeFormat("en-IN", { month: "short" })`.

- Q: What is the page layout structure? → A: `<div className="space-y-6">` wrapping: optional WelcomeCard (when `!hasData`), DashboardHeader, SummaryCards, a 3-column grid (MonthlyTrendChart spanning 2 cols + CategoryBreakdownCard spanning 1 col), and a 2-column grid (CurrentMonthCard + RecentTransactionsList). All components live under `src/components/dashboard/`.

- Q: Which Shadcn components need to be installed and what chart library is used? → A: Install `progress` and `tabs` via `npx shadcn@latest add progress tabs` before writing any code. Install Recharts via `npm install recharts` if not already present. `MonthlyTrendChart` is a Client Component (`"use client"`) because Recharts requires browser APIs.
