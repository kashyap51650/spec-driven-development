# Quickstart Validation Guide: Expense and Income Modules

**Feature**: `005-expense-income-modules` | **Date**: 2026-06-10

Use this guide to validate the feature works end-to-end after implementation. Scenarios are ordered from foundational to complex.

---

## Prerequisites

1. MongoDB running and `DATABASE_URL` set in `.env`
2. `npm run dev` running on `http://localhost:3000`
3. One registered user account (use `/register` if needed)
4. TypeScript compilation passes: `npx tsc --noEmit` (zero errors)

---

## Validation Scenario 1 — Foundation Check

**Purpose**: Confirm utils, constants, and empty state render correctly.

1. Log in and navigate to `http://localhost:3000/expenses`
2. **Expected**: Empty state renders — Inbox icon, "No expenses yet" message, "+ Add Expense" button
3. Navigate to `http://localhost:3000/income`
4. **Expected**: Empty state renders — "No income yet" message, "+ Add Income" button
5. Both pages load without TypeScript errors in the browser console

---

## Validation Scenario 2 — Create Expense (Happy Path)

1. On `/expenses`, click "+ Add Expense"
2. **Expected**: Dialog opens with title "Add Expense" and all fields visible (title, amount, category, account, date, notes, tags, recurring)
3. Fill in:
   - Title: "Coffee"
   - Amount: 120
   - Category: "Food & Dining"
   - Account: "Cash"
   - Date: today's date
4. Submit
5. **Expected**:
   - Dialog closes
   - "Coffee" appears at the top of the list without a page reload
   - Amount displayed as "₹120.00" (INR format)
   - Date displayed as "Jun 10, 2026" (or today's date in MMM dd, yyyy format)
6. View on mobile-width viewport (<768px): record displays as a Card, not a table row

---

## Validation Scenario 3 — Validation Errors

1. Open "+ Add Expense" dialog
2. Click submit without filling any fields
3. **Expected**: Inline validation errors on Title, Amount, Category, Account, and Date fields
4. Enter amount: -50 → **Expected**: "Amount must be greater than zero" error
5. Enter amount: 0 → **Expected**: same error
6. Record count on list unchanged

---

## Validation Scenario 4 — Edit Expense

1. Click the edit (pencil) icon on an existing expense
2. **Expected**: Dialog opens pre-populated with all current values
3. Change the title to "Dinner" and submit
4. **Expected**: Dialog closes; list shows "Dinner" instead of the original title immediately

---

## Validation Scenario 5 — Delete Expense

1. Click the delete (trash) icon on a record
2. **Expected**: AlertDialog appears: "This will permanently delete this expense."
3. Click Cancel → **Expected**: dialog closes, record remains
4. Click delete again → confirm → **Expected**: record removed from list without page reload

---

## Validation Scenario 6 — Tags and Recurring Flag

1. Create an expense with tags: "food, coffee, morning" and recurring checked
2. **Expected**: Record appears in list; tags visible (as individual badges or comma-separated)
3. Edit the expense → **Expected**: tags field shows "food, coffee, morning" (joined); recurring checkbox is checked

---

## Validation Scenario 7 — Filters and URL Persistence

1. Create three expenses: "Coffee" (Food & Dining, Jun 5), "Uber" (Transport, Jun 8), "Gym" (Health, Jun 10)
2. Select category "Food & Dining" in the filter bar
3. **Expected**: Only "Coffee" visible; URL contains `?category=Food+%26+Dining`
4. Refresh the page
5. **Expected**: Filter is still active; only "Coffee" visible
6. Copy the URL, open in a new tab → **Expected**: same filtered view
7. Type "ub" in the search bar
8. **Expected**: Only "Uber" visible (filter changes to transport + search); URL updates
9. Click "Clear all" → **Expected**: all three records visible; URL has no query params

---

## Validation Scenario 8 — Date Range Filter

1. With multiple expenses on different dates, set startDate to Jun 6 and endDate to Jun 9
2. **Expected**: Only "Uber" (Jun 8) is visible; Coffee (Jun 5) and Gym (Jun 10) are hidden
3. URL contains `?startDate=...&endDate=...`

---

## Validation Scenario 9 — Create Income (Happy Path)

1. Navigate to `/income`, click "+ Add Income"
2. **Expected**: Dialog with fields: title, amount, source, account, date, notes (no tags, no recurring)
3. Fill in: Title "Freelance project", Amount 50000, Source "Freelance", Account "Bank Account", Date today
4. Submit → **Expected**: Record appears at top, amount in green (₹50,000.00), date formatted correctly

---

## Validation Scenario 10 — Income Module Parity

Repeat Scenarios 3–8 for the Income module:
- Validation errors fire correctly (no tags/recurring fields)
- Edit pre-populates values
- Delete requires confirmation
- Source filter (not category) narrows the list
- URL params use `source` (not `category`)
- All three filter types combine

---

## Validation Scenario 11 — Data Isolation

1. Register a **second** user account in a different browser/incognito window
2. Add different expenses and income to the second account
3. Return to the first account
4. **Expected**: First account's lists show only its own records — no records from the second account appear

---

## Validation Scenario 12 — Responsive Layout

1. Open DevTools → set viewport to 375px wide (mobile)
2. Navigate to `/expenses` with records present
3. **Expected**: Records display as `Card` components, not table rows
4. Set viewport to 900px wide (desktop)
5. **Expected**: Records display in a `Table` layout
6. Both layouts show edit and delete actions on each record

---

## TypeScript Gate

After completing all implementation layers, run:

```bash
npx tsc --noEmit
```

**Expected**: zero errors. This is the required quality gate before the feature is considered complete.
