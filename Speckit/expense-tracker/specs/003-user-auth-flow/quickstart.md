# Quickstart & Validation Guide: User Authentication Flow

**Branch**: `003-user-auth-flow` | **Date**: 2026-06-09

## Prerequisites

1. MongoDB instance running and `DATABASE_URL` set in `.env.local`
2. `JWT_SECRET` set in `.env.local` (minimum 32 random characters)
3. Dependencies installed (see Setup below)

## Setup

```bash
# Install new dependencies
npm install zod react-hook-form @hookform/resolvers

# Install Shadcn components (card, form, input, label — button already exists)
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label

# Verify TypeScript compiles cleanly
npx tsc --noEmit

# Start dev server
npm run dev
```

## Validation Scenarios

### S1 — New user registers successfully

1. Open `http://localhost:3000/register`
2. Fill: Name = "Test User", Email = "test@example.com", Password = "password123"
3. Click "Register"
4. **Expected**: Spinner appears briefly → browser navigates to `/dashboard` → page shows "Dashboard / Coming soon."
5. **Verify session**: Refresh the page → browser stays on `/dashboard` (not redirected to `/login`)
6. Open DevTools → Application → Cookies → confirm `token` cookie exists with `httpOnly` flag

---

### S2 — Duplicate email rejected

1. With "test@example.com" already registered (from S1):
2. Open `http://localhost:3000/register`
3. Fill same email with any name and password
4. Click "Register"
5. **Expected**: Form stays on `/register` → error message "Email already in use" appears below the form

---

### S3 — Register inline validation errors

1. Open `http://localhost:3000/register`
2. Click "Register" without filling any fields
3. **Expected**: Inline errors appear beneath Name, Email, and Password fields without leaving the page
4. Fill an invalid email (e.g., "notanemail"), click "Register"
5. **Expected**: Email field shows "Please enter a valid email address"
6. Fill a 7-character password, click "Register"
7. **Expected**: Password field shows "Password must be at least 8 characters"

---

### S4 — Existing user logs in successfully

1. Open `http://localhost:3000/login`
2. Fill: Email = "test@example.com", Password = "password123"
3. Click "Login"
4. **Expected**: Spinner appears → browser navigates to `/dashboard`

---

### S5 — Login with wrong credentials (generic error)

1. Open `http://localhost:3000/login`
2. Fill: Email = "test@example.com", Password = "wrongpassword"
3. Click "Login"
4. **Expected**: Form stays on `/login` → single error "Invalid email or password" — does NOT say "wrong password" or "email not found"
5. Repeat with a non-existent email + any password
6. **Expected**: Same message "Invalid email or password" — message is identical regardless of which field was wrong

---

### S6 — Unauthenticated access to dashboard redirects to login

1. Open DevTools → Application → Cookies → delete the `token` cookie (or use a private window)
2. Navigate directly to `http://localhost:3000/dashboard`
3. **Expected**: Browser immediately redirects to `/login`

---

### S7 — Authenticated user redirected away from login/register

1. Log in successfully (S4)
2. Navigate to `http://localhost:3000/login`
3. **Expected**: Browser immediately redirects to `/dashboard`
4. Navigate to `http://localhost:3000/register`
5. **Expected**: Browser immediately redirects to `/dashboard`

---

### S8 — Logout clears session

1. Log in successfully (S4)
2. Trigger the logout action (e.g., by navigating to a page with a logout button, or manually calling the action via a temporary button on the dashboard placeholder)
3. **Expected**: Browser redirects to `/login`
4. Open DevTools → Application → Cookies → confirm `token` cookie is gone
5. Click browser back button or navigate to `/dashboard`
6. **Expected**: Redirected to `/login`

---

### S9 — Loading state during submission

1. Open `http://localhost:3000/login` in Chrome DevTools with Network throttled to "Slow 3G"
2. Fill valid credentials and click "Login"
3. **Expected**: Submit button becomes disabled and shows "Loading..." text while the request is in-flight

---

### S10 — Session persists across page reload

1. Log in successfully
2. Press F5 / Cmd+R to reload the page
3. **Expected**: Browser stays on `/dashboard`, not redirected to `/login`

---

## TypeScript Gate

Before considering the implementation complete, this command must pass with zero errors:

```bash
npx tsc --noEmit
```

## File Manifest

All files created or modified by this feature:

| File | Action |
|------|--------|
| `src/lib/auth.ts` | Create |
| `src/types/auth.ts` | Create |
| `src/server/validations/auth.validation.ts` | Create |
| `src/server/repositories/auth.repository.ts` | Create |
| `src/server/services/auth.service.ts` | Create |
| `src/actions/auth.actions.ts` | Create |
| `src/features/auth/components/SubmitButton.tsx` | Create |
| `app/(auth)/layout.tsx` | Create |
| `app/(auth)/register/page.tsx` | Create |
| `app/(auth)/login/page.tsx` | Create |
| `app/(dashboard)/dashboard/page.tsx` | Create |
| `middleware.ts` | Create |
| `src/components/ui/card.tsx` | Install via Shadcn CLI |
| `src/components/ui/form.tsx` | Install via Shadcn CLI |
| `src/components/ui/input.tsx` | Install via Shadcn CLI |
| `src/components/ui/label.tsx` | Install via Shadcn CLI |
| `.env.local` | Add `JWT_SECRET` |
| `.env.example` | Add `JWT_SECRET=` placeholder |
| `package.json` | Add `zod`, `react-hook-form`, `@hookform/resolvers` |
