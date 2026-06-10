# Tasks: Dashboard Overview

**Input**: Design documents from `specs/006-dashboard-overview/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | quickstart.md ✅

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete sibling tasks)
- **[Story]**: User story this task belongs to (US1–US5 map to spec.md User Stories 1–5)
- Exact file paths included in all descriptions

---

## Phase 1: Setup (Install Dependencies)

**Purpose**: Install new Shadcn components and Recharts before any code is written. Required because `progress` must be CLI-installed (Constitution Principle V) and `recharts` must be available before `MonthlyTrendChart` is compiled.

- [x] T001 Install Shadcn `progress` component via `npx shadcn@latest add progress` and verify `src/components/ui/progress.tsx` exists
- [x] T002 Install Shadcn `tabs` component via `npx shadcn@latest add tabs` and verify `src/components/ui/tabs.tsx` exists
- [x] T003 Install Recharts via `npm install recharts` and verify it appears in `package.json` dependencies
- [x] T004 Run `npx tsc --noEmit` — must pass with zero errors before proceeding

**Checkpoint**: Dependencies installed, TypeScript clean — foundational work can begin.

---

## Phase 2: Foundational (Types and Repository)

**Purpose**: Define the complete `DashboardData` type system and all four repository functions. Every subsequent phase depends on these types and data access primitives.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T005 Create `src/types/dashboard.ts` — export all six interfaces: `DashboardSummary`, `MonthlyTrend`, `CategoryBreakdown`, `RecentTransaction`, `CurrentMonth`, `DashboardData` (see plan.md Phase 2 Step 1 for exact interface definitions)
- [x] T006 Create `src/server/repositories/dashboard.repository.ts` — implement `getMonthlySummary(userId, startDate, endDate)` using `Promise.all` over two Prisma aggregates (see plan.md Phase 2 Step 2)
- [x] T007 Add `getMonthlyTrends(userId, months = 6)` to `src/server/repositories/dashboard.repository.ts` — builds month date ranges and runs all summaries in parallel (see plan.md Phase 2 Step 2)
- [x] T008 [P] Add `getCategoryBreakdown(userId, startDate, endDate)` to `src/server/repositories/dashboard.repository.ts` — Prisma `groupBy` on `Expense.category` with `_sum` and `_count`, ordered by total descending (see plan.md Phase 2 Step 2)
- [x] T009 [P] Add `getRecentTransactions(userId, limit = 8)` to `src/server/repositories/dashboard.repository.ts` — fetches recent expenses and incomes in parallel, merges, sorts by date desc, slices to limit (see plan.md Phase 2 Step 2)
- [x] T010 Run `npx tsc --noEmit` — must pass with zero errors before Phase 3

**Checkpoint**: Types defined, all four repository functions implemented, TypeScript clean — user story phases can begin.

---

## Phase 3: User Stories 1 & 6 — Financial Snapshot + Read-Only Page (Priority: P1) 🎯 MVP

**Goal**: Deliver the core dashboard value — four summary cards showing current-month totals — together with the complete page scaffolding and read-only enforcement.

**Independent Test (US1)**: Add one income (₹50,000) and one expense (₹30,000) for the current month. Navigate to `/dashboard`. Verify Total Income = ₹50,000, Total Expenses = ₹30,000, Net Savings = ₹20,000 (green), Savings Rate = 40.0%. No create/edit/delete actions anywhere on the page (US6).

### Implementation

- [x] T011 Create `src/server/services/dashboard.service.ts` — implement `getDashboardData(userId)` with `Promise.all` fetching all four repository calls, then derive `netSavings`, `savingsRate`, `categoryBreakdown` percentages, `balance`, `label`, and `hasData` (see plan.md Phase 3 Step 3 for full derivation logic)
- [x] T012 Create `src/data/dashboard.ts` — implement `getDashboardData()` that calls `getSession()`, throws `"Unauthorized"` if null, and delegates to `dashboardService.getDashboardData(session.userId)` (see plan.md Phase 3 Step 4)
- [x] T013 [P] [US1] Create `src/features/dashboard/components/DashboardHeader.tsx` — Server Component, props `{ label: string }`, renders `<h1>Dashboard</h1>` and `<p className="text-sm text-muted-foreground">Overview for {label}</p>` (see plan.md Phase 4 Step 6)
- [x] T014 [P] [US1] Create `src/features/dashboard/components/SummaryCard.tsx` — Server Component, props `{ label, value, description?, icon: LucideIcon, iconClassName?, valueClassName? }`, renders a Shadcn Card with icon+label header and large value+description content (see plan.md Phase 4 Step 7)
- [x] T015 [US1] Create `src/features/dashboard/components/SummaryCards.tsx` — Server Component, props `{ summary: DashboardSummary }`, renders 4-column grid with Total Income (green), Total Expenses (red), Net Savings (green/red by sign), Savings Rate (purple) using `SummaryCard` (see plan.md Phase 4 Step 8)
- [x] T016 [US1] [US6] Replace `src/app/(dashboard)/dashboard/page.tsx` — async Server Component calling `getDashboardData()`, destructures `DashboardData`, renders full layout (`WelcomeCard` guard + `DashboardHeader` + `SummaryCards` + chart/category grid + currentMonth/transactions grid); NO create/edit/delete actions (see plan.md Phase 6 Step 14)
- [x] T017 [US1] Replace `src/app/(dashboard)/dashboard/loading.tsx` — update existing skeleton to match real layout: header skeletons + 4 stat card skeletons + 3-col chart/category row + 2-col current-month/transactions row (see plan.md Phase 6 Step 15)
- [x] T018 Run `npx tsc --noEmit` — must pass with zero errors

**Checkpoint**: Dashboard page loads, summary cards show real data, page is read-only, skeleton matches layout. US1 and US6 independently testable.

---

## Phase 4: User Story 2 — Monthly Trend Chart (Priority: P2)

**Goal**: Show a 6-month income vs expenses area chart so users can spot financial patterns over time.

**Independent Test**: With records spread across multiple months, verify the chart renders with two coloured area series (green income, red expenses), correct month labels on X-axis, and INR-abbreviated Y-axis. With all-zero data, verify "No data yet" text appears instead of an empty chart.

### Implementation

- [x] T019 [P] [US2] Create `src/features/dashboard/components/MonthlyTrendChart.tsx` — Client Component (`"use client"`), props `{ trends: MonthlyTrend[] }`, Recharts `ResponsiveContainer`/`AreaChart` with `CartesianGrid`, `XAxis`, `YAxis` (₹Xk formatter), `Tooltip` (formatCurrency), `Legend`, two `Area` series for income (green) and expenses (red) with gradient fills; shows "No data yet" message when all values are zero (see plan.md Phase 5 Step 13)
- [x] T020 Run `npx tsc --noEmit` — must pass with zero errors

**Checkpoint**: Monthly trend chart renders with real data. All previous stories still work.

---

## Phase 5: User Story 3 — Category Breakdown (Priority: P2)

**Goal**: Show a ranked list of the current month's expense categories with amounts, percentages, and progress bars, capped at 6 entries.

**Independent Test**: Add expenses across 7+ categories this month. Verify: top 6 categories appear ranked by total, each row shows amount and percentage, a Shadcn Progress bar fills proportionally, and "and N more categories" footer appears. With zero expenses, verify "No expenses this month" empty state.

### Implementation

- [x] T021 [P] [US3] Create `src/features/dashboard/components/CategoryBreakdownCard.tsx` — Server Component, props `{ breakdown: CategoryBreakdown[] }`, Shadcn Card titled "Spending by Category", shows `EmptyState` when empty, otherwise maps up to 6 categories with `Progress` bar + amount + percentage, appends "and N more categories" when overflow (see plan.md Phase 4 Step 9)
- [x] T022 Run `npx tsc --noEmit` — must pass with zero errors

**Checkpoint**: Category breakdown card renders correctly with data and empty states. All previous stories still work.

---

## Phase 6: User Story 4 — Recent Activity (Priority: P2)

**Goal**: Show the 8 most recent combined income/expense records and the current-month balance summary, giving users a quick activity overview and a path to detailed views.

**Independent Test**: Add a mix of income and expense records on different dates. Verify: Recent Transactions shows ≤8 records sorted newest first, expenses display red `–₹X` and incomes display green `+₹X`, dates formatted as MMM dd, yyyy, "View all" link goes to `/expenses`. Current Month card shows correct income/expenses/balance with green/red coloring.

### Implementation

- [x] T023 [P] [US4] Create `src/features/dashboard/components/CurrentMonthCard.tsx` — Server Component, props `{ currentMonth: CurrentMonth }`, Shadcn Card titled "This Month", three rows (Income/Expenses/Balance) separated by `Separator`, balance colored green when ≥ 0 and red when negative (see plan.md Phase 4 Step 10)
- [x] T024 [P] [US4] Create `src/features/dashboard/components/RecentTransactionItem.tsx` — Server Component, props `{ transaction: RecentTransaction }`, three-column row: colored icon circle (red/green bg + icon), title+category center, signed-amount+date right; expenses red `–`, incomes green `+` (see plan.md Phase 4 Step 11)
- [x] T025 [US4] Create `src/features/dashboard/components/RecentTransactionsList.tsx` — Server Component, props `{ transactions: RecentTransaction[] }`, Shadcn Card titled "Recent Transactions" with "View all" link to `/expenses` in header, `EmptyState` when empty, otherwise `divide-y` list of `RecentTransactionItem` components (see plan.md Phase 4 Step 12)
- [x] T026 Run `npx tsc --noEmit` — must pass with zero errors

**Checkpoint**: Recent transactions list and current month card render correctly. All previous stories still work.

---

## Phase 7: User Story 5 — Welcome State (Priority: P3)

**Goal**: Show new users a friendly onboarding card with calls-to-action when they have no data, converting a blank dashboard into an actionable starting point.

**Independent Test**: Log in as a user with zero records. Verify `WelcomeCard` appears above all other sections with "Add Income" button (→ `/income`) and "Add Expense" button (→ `/expenses`). Add one record; revisit dashboard and verify WelcomeCard is no longer shown.

### Implementation

- [x] T027 [P] [US5] Create `src/features/dashboard/components/WelcomeCard.tsx` — Server Component, full-width Shadcn Card with centered layout: `Wallet` icon (large, muted), title "Welcome to Expense Tracker", description text, two buttons: "Add Income" (→ `/income`) and "Add Expense" outline (→ `/expenses`) (see plan.md Phase 4 Step 5)
- [x] T028 Run `npx tsc --noEmit` — must pass with zero errors

**Checkpoint**: Welcome card appears for new users and disappears once data exists. All previous stories still work.

---

## Phase 8: Polish & Validation

**Purpose**: Final TypeScript gate, quickstart validation, and a formatting spot-check.

- [x] T029 Run `npx tsc --noEmit` — full project TypeScript gate, zero errors required
- [x] T030 [P] Execute quickstart.md Scenario 1 (new user welcome state) — verify all expected elements render
- [x] T031 [P] Execute quickstart.md Scenario 2 (summary card calculations) — verify INR amounts and Savings Rate calculation
- [x] T032 [P] Execute quickstart.md Scenario 3 (negative net savings) — verify red coloring and 0.0% rate
- [x] T033 [P] Execute quickstart.md Scenario 6 (monthly trend chart) — verify chart renders with two series
- [x] T034 [P] Execute quickstart.md Scenario 7 (loading state) — verify skeleton matches full layout
- [x] T035 Formatting spot-check: confirm all monetary values start with `₹` in Indian number format and all dates appear as `MMM dd, yyyy` (no ISO strings, no slashes)

---

## Dependencies & Execution Order

### Phase Dependencies

```
Phase 1 (Setup)
  └─ Phase 2 (Foundational — types + repository)
       └─ Phase 3 (US1+US6 — service + data fn + summary cards + page)
            ├─ Phase 4 (US2 — chart)        ← can start after Phase 3
            ├─ Phase 5 (US3 — categories)   ← can start after Phase 3
            ├─ Phase 6 (US4 — transactions) ← can start after Phase 3
            └─ Phase 7 (US5 — welcome card) ← can start after Phase 3
                  └─ Phase 8 (Polish — runs after all stories)
```

### User Story Dependencies

| Story | Depends On | Can Parallelize With |
|---|---|---|
| US1+US6 (P1) | Phase 2 complete | Blocks US2, US3, US4, US5 |
| US2 (P2) | US1+US6 complete | US3, US4, US5 |
| US3 (P2) | US1+US6 complete | US2, US4, US5 |
| US4 (P2) | US1+US6 complete | US2, US3, US5 |
| US5 (P3) | US1+US6 complete | US2, US3, US4 |

### Within Phase 3 (critical path)

```
T011 (service) → T012 (data fn) → T016 (page.tsx)
T013 (header) ──────────────────────┘  [parallel with T014]
T014 (SummaryCard) → T015 (SummaryCards) ─┘
T017 (loading.tsx) [independent]
```

### Within Phases 4–7 (fully parallel after Phase 3)

- T019 (chart), T021 (categories), T023 (current month), T024 (transaction item), T027 (welcome) — all operate on different files and can be written concurrently.

---

## Parallel Execution Example: Phases 4–7

After Phase 3 is complete, these tasks can run simultaneously:

```bash
# Agent/developer A:
Task T019: MonthlyTrendChart.tsx

# Agent/developer B:
Task T021: CategoryBreakdownCard.tsx

# Agent/developer C:
Task T023: CurrentMonthCard.tsx
Task T024: RecentTransactionItem.tsx
Task T025: RecentTransactionsList.tsx  # after T024

# Agent/developer D:
Task T027: WelcomeCard.tsx
```

---

## Implementation Strategy

### MVP (User Stories 1 & 6 only — Phase 1–3)

1. Install dependencies (Phase 1)
2. Define types + repository (Phase 2)
3. Implement service, data function, summary cards, page, loading (Phase 3)
4. **STOP and VALIDATE**: Navigate to `/dashboard`, verify summary cards show correct INR totals, page has no mutations, skeleton matches layout
5. This alone replaces the "Coming soon" placeholder with a functional, production-quality page

### Incremental Delivery

1. Phases 1–3 → MVP: summary cards + read-only enforcement ✅
2. Phase 4 → Add trend chart ✅
3. Phase 5 → Add category breakdown ✅
4. Phase 6 → Add recent transactions + current month card ✅
5. Phase 7 → Add welcome state for new users ✅
6. Phase 8 → Final validation ✅

Each phase adds visible user value without breaking what came before.

---

## Notes

- `[P]` tasks operate on different files — safe to execute concurrently
- `[Story]` labels map each task to its user story for traceability
- No test tasks generated (not requested in spec)
- The existing `error.tsx` at `src/app/(dashboard)/dashboard/error.tsx` is already correct — no changes needed (FR-016)
- `tabs` (T002) is installed as a dependency precaution per the spec; it is not used by any dashboard component in this implementation
- All component filenames are PascalCase per Constitution Principle III
- All components use named exports (not default exports) matching the existing codebase pattern
