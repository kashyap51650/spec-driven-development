# Quickstart Validation Guide: Dashboard Overview

**Branch**: `006-dashboard-overview` | **Date**: 2026-06-10

---

## Prerequisites

- App running locally (`npm run dev`, port 3000)
- At least one registered user account
- MongoDB accessible (`.env` configured)

---

## Scenario 1 — New User Welcome State

**Setup**: Log in as a user with zero expense and income records.

**Steps**:
1. Navigate to `http://localhost:3000/dashboard`
2. Observe the loading skeleton appears briefly, then the page renders

**Expected**:
- `WelcomeCard` is visible at the top: title "Welcome to Expense Tracker", two buttons ("Add Income", "Add Expense")
- "Add Income" button links to `/income`
- "Add Expense" button links to `/expenses`
- All summary cards show `₹0.00`
- Savings Rate shows `0.0%`
- Monthly Overview chart shows "No data yet" message
- Category Breakdown shows "No expenses this month" empty state
- Recent Transactions shows "No recent transactions" empty state
- Page title shows "Dashboard" with current month label (e.g. "Overview for June 2026")

**Validates**: FR-011, FR-012, FR-003 (trend no-data message), FR-006, FR-009, SC-005

---

## Scenario 2 — Summary Card Calculations

**Setup**: For the current month, add:
- Income record: ₹50,000
- Expense record: ₹30,000

**Expected**:
- Total Income: `₹50,000.00`
- Total Expenses: `₹30,000.00`
- Net Savings: `₹20,000.00` (displayed in green)
- Savings Rate: `40.0%`
- WelcomeCard is no longer shown

**Validates**: FR-001, FR-007 (balance coloring), SC-002, SC-004

---

## Scenario 3 — Negative Net Savings

**Setup**: For the current month, ensure expenses exceed income (e.g. ₹10,000 income, ₹25,000 expenses).

**Expected**:
- Net Savings shows a negative amount in **red** (e.g. `-₹15,000.00`)
- Savings Rate shows `0.0%` (not negative)
- This Month card — Balance row shows negative amount in red

**Validates**: FR-001 (savings rate floor), FR-007, SC-002

---

## Scenario 4 — Category Breakdown

**Setup**: Add at least 3 expenses in the current month across different categories (e.g. Food & Dining ₹5,000, Transport ₹2,000, Shopping ₹3,000).

**Expected**:
- Category Breakdown lists categories ranked by total descending
- Each row shows category name, INR total, percentage, and a filled progress bar
- Percentages sum to approximately 100% across all categories

**With >6 categories**:
- Add expenses in 7+ different categories
- Only top 6 appear; footer reads "and N more categories"

**Validates**: FR-004, FR-005, SC-002

---

## Scenario 5 — Recent Transactions (Mixed)

**Setup**: Add a mix of income and expense records (at least 5 total, mix of types, across different dates).

**Expected**:
- Recent Transactions list shows up to 8 records
- Records are sorted by date, most recent first
- Expense rows show red `–₹X` amount and red icon circle
- Income rows show green `+₹X` amount and green icon circle
- Each row shows title, category/source, amount, and date formatted as MMM dd, yyyy (e.g. "Jun 09, 2026")
- "View all" link in card header navigates to `/expenses`

**Validates**: FR-008, FR-010, SC-003

---

## Scenario 6 — Monthly Trend Chart

**Setup**: The user has records across multiple months (create records with past dates if needed).

**Expected**:
- Monthly Overview chart renders with two area series: "Income" (green) and "Expenses" (red)
- X-axis shows short month labels (e.g. "Jan", "Feb", …)
- Y-axis shows amounts abbreviated (e.g. "₹50k")
- Hovering a data point shows INR-formatted tooltip values

**Validates**: FR-002, FR-003

---

## Scenario 7 — Loading State

**Steps**:
1. With a slow network connection (or throttled in DevTools), navigate to `/dashboard`

**Expected**:
- Loading skeleton appears immediately with:
  - Two skeleton lines for the header
  - Row of 4 skeleton stat cards
  - Two-column row: large skeleton + smaller skeleton (chart + category)
  - Two-column row: two medium skeletons (current month + transactions)
- Skeleton is replaced by real content once data loads
- No blank white flash occurs

**Validates**: FR-015, SC-006

---

## Scenario 8 — Error State

**Steps**:
1. Temporarily corrupt the `DATABASE_URL` in `.env` and restart the dev server
2. Navigate to `/dashboard`

**Expected**:
- The `error.tsx` boundary renders (not a crash or blank page)
- A "Try again" button is visible

**Validates**: FR-016

---

## TypeScript Gate

After completing each implementation phase, run:

```bash
npx tsc --noEmit
```

Expected output: zero errors, zero warnings.

---

## Formatting Spot-Check

On any page that shows amounts or dates:
- All monetary values must start with `₹` and use Indian number formatting (e.g. `₹1,00,000.00`)
- All dates must appear as `MMM dd, yyyy` (e.g. `Jun 09, 2026`) — no ISO strings, no slashes

**Validates**: SC-002, SC-003
