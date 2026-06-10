# Quickstart Validation Guide: App Shell Navigation

**Feature**: `004-app-shell-nav` | **Date**: 2026-06-09

This guide provides runnable steps to validate the feature works end-to-end after implementation.

---

## Prerequisites

- MongoDB connection string in `.env` (`DATABASE_URL`)
- `JWT_SECRET` set in `.env`
- At least one registered user in the database (see Setup below)
- Dependencies installed: `npm install`
- Shadcn components installed (Layer 1 of [plan.md](./plan.md))
- Dev server running: `npm run dev`

---

## Setup: Create a Test User

If no user exists, register one:

1. Open `http://localhost:3000/register`
2. Fill in name (e.g., "Jane Smith"), email, and password
3. On successful registration you are redirected to `/dashboard`

---

## Validation Scenarios

### S1 — Unauthenticated Access Redirects to Login

**Steps**:
1. Clear all cookies (browser DevTools → Application → Cookies → Clear All)
2. Navigate directly to `http://localhost:3000/dashboard`

**Expected**: Immediately redirected to `http://localhost:3000/login`. No protected content visible.

**Also test**: `/expenses`, `/income`, `/transfers`, `/budgets` — all should redirect to `/login`.

---

### S2 — Desktop Shell Renders Correctly

**Steps**:
1. Log in via `http://localhost:3000/login`
2. Set browser viewport to ≥768px wide

**Expected**:
- Left sidebar is visible: app logo ("Expense Tracker" + Wallet icon), then 5 navigation links, then user avatar at bottom
- No top header bar visible
- Main content area shows the Dashboard placeholder: heading "Dashboard" + "Coming soon."
- User's registered name is visible in the sidebar (not their email address)

---

### S3 — Navigation Active State

**Steps**:
1. Log in and observe the sidebar
2. Note which link is highlighted on `/dashboard`

**Expected**:
- "Dashboard" link has `bg-accent` background — it is the active item
- Click "Expenses" → URL changes to `/expenses`, "Expenses" link becomes active, "Dashboard" becomes inactive
- Click "Income" → "Income" is active
- Navigate to `/expenses/anything` (manual URL bar) → "Expenses" still active (prefix match)
- Navigate back to `/dashboard` → only "Dashboard" is active (not other items)

---

### S4 — Mobile Navigation

**Steps**:
1. Log in and set viewport to <768px (or use browser mobile emulation)

**Expected**:
- Sidebar is NOT visible
- Top header bar visible with: hamburger (☰) on left, logo in center, avatar on right
- Tap hamburger → Sheet slides in from left with logo + 5 nav links
- Tap "Expenses" in the Sheet → navigates to `/expenses` AND Sheet closes automatically
- Tap hamburger again → Sheet opens again

---

### S5 — User Identity and Logout

**Steps**:
1. Log in as "Jane Smith"
2. Look at the avatar in the sidebar (desktop) — should show initials "JS"
3. Click the avatar

**Expected**:
- Dropdown opens showing: "Jane Smith" (bold), email address (muted), separator, "Logout" item
- Click "Logout"
- Loading state appears briefly ("Logging out…")
- Redirected to `/login`
- Attempting to navigate to `/dashboard` redirects back to `/login` (session cleared)

---

### S6 — Single-word name initials

**Steps**:
1. Register a user with a single-word name (e.g., "Madonna")
2. Log in

**Expected**: Avatar shows "M" (one letter, not two)

---

### S7 — Loading Skeletons

**Steps**:
1. Log in
2. Use browser DevTools → Network → set throttling to "Slow 3G"
3. Navigate to `/dashboard`

**Expected**: Before the page loads, a skeleton grid of 4 cards + a large skeleton block below is visible (not a blank screen).

4. Navigate to `/expenses` with throttling

**Expected**: A toolbar skeleton row + 5 table row skeletons visible while loading.

---

### S8 — TypeScript Compilation

```bash
cd expense-tracker
npx tsc --noEmit
```

**Expected**: Zero errors.

---

## What NOT to Test Here

- Database query performance (not in scope for this feature)
- Form validation (no forms in this feature)
- Any real data in the section pages (all are placeholders)

---

## References

- Component prop contracts: [contracts/component-props.md](./contracts/component-props.md)
- Data model: [data-model.md](./data-model.md)
- Full implementation order: [plan.md](./plan.md)
