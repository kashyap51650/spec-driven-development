# Tasks: User Authentication Flow

**Input**: Design documents from `specs/003-user-auth-flow/`

**Prerequisites**: [plan.md](plan.md) · [spec.md](spec.md) · [research.md](research.md) · [data-model.md](data-model.md) · [contracts/server-actions.md](contracts/server-actions.md) · [quickstart.md](quickstart.md)

**Tests**: Not requested — no test tasks included.

**Organization**: Tasks are grouped by user story to enable independent implementation and
testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared-state dependencies)
- **[Story]**: Which user story this task belongs to ([US1]–[US5])
- Exact file paths are included in every description

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install missing dependencies and configure environment before any code is written.

**⚠️ Complete all Phase 1 tasks before writing any source files.**

- [x] T001 Install `zod`, `react-hook-form`, and `@hookform/resolvers` by running `npm install zod react-hook-form @hookform/resolvers` — add the three packages to the `dependencies` section of `package.json`
- [x] T002 [P] Install Shadcn `card` component by running `npx shadcn@latest add card` from the repository root — verifies `src/components/ui/card.tsx` exists after completion
- [x] T003 [P] Install Shadcn `form` component by running `npx shadcn@latest add form` — verifies `src/components/ui/form.tsx` exists
- [x] T004 [P] Install Shadcn `input` component by running `npx shadcn@latest add input` — verifies `src/components/ui/input.tsx` exists
- [x] T005 [P] Install Shadcn `label` component by running `npx shadcn@latest add label` — verifies `src/components/ui/label.tsx` exists
- [x] T006 [P] Add `JWT_SECRET=` placeholder to `.env.example` at the repository root; add `JWT_SECRET=<generate-32-random-chars>` to `.env.local` (create file if absent); ensure `.env.local` is listed in `.gitignore`

**Checkpoint**: `npm install` succeeds, all four Shadcn components exist in `src/components/ui/`, `.env.local` contains `JWT_SECRET`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core type definitions, auth utilities, validation schemas, repository, and service
layers. Every user story depends on all Phase 2 tasks being complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [x] T007 Create `src/types/auth.ts` with four exported interfaces: `User` (id, name, email, createdAt, updatedAt — no password field), `RegisterInput` (name, email, password), `LoginInput` (email, password), `JwtPayload` (userId, email) — use `interface` keyword throughout per constitution Principle III
- [x] T008 [P] Create `src/lib/auth.ts` with three exported async functions: `signToken(payload: JwtPayload): Promise<string>` using `new SignJWT()` from `jose` with HS256 algorithm and 7-day expiry; `verifyToken(token: string): Promise<JwtPayload | null>` using `jwtVerify` — returns `null` on any failure, NEVER throws; `getSession(): Promise<JwtPayload | null>` using `await cookies()` from `next/headers` to read the `"token"` cookie then calling `verifyToken` — returns `null` if no cookie or invalid token, NEVER throws
- [x] T009 [P] Create `src/server/validations/auth.validation.ts` with `registerSchema` (name: min 1 char, email: valid format, password: min 8 chars) and `loginSchema` (email: valid format, password: min 1 char) using Zod; export `RegisterInput` and `LoginInput` as `z.infer<typeof …>` types; all error messages must match [data-model.md](data-model.md#validation-rules) exactly
- [x] T010 Create `src/server/repositories/auth.repository.ts` with four functions (depends on T007, T008): `findUserByEmail(email: string): Promise<User | null>` using Prisma `select` that excludes `password`; `findUserByEmailWithPassword(email: string): Promise<(User & { password: string }) | null>` that includes `password` in `select` — used only by the service for bcrypt comparison; `findUserById(id: string): Promise<User | null>` excluding `password`; `createUser(data: { name: string; email: string; hashedPassword: string }): Promise<User>` that maps `hashedPassword` to Prisma `password` field and excludes `password` from the returned object — import `db` only from `src/lib/prisma.ts`; map every Prisma result to the `User` interface before returning
- [x] T011 Create `src/server/services/auth.service.ts` with two exported async functions (depends on T009, T010): `register(input: RegisterInput): Promise<{ user: User; token: string }>` — validates with `registerSchema.parse`, calls `findUserByEmail` (throws `"Email already in use"` if found), hashes password with `bcryptjs.hash(password, 12)`, calls `createUser`, calls `signToken`, returns `{ user, token }`; `login(input: LoginInput): Promise<{ user: User; token: string }>` — validates with `loginSchema.parse`, calls `findUserByEmailWithPassword` (throws `"Invalid email or password"` if not found), calls `bcryptjs.compare` (throws `"Invalid email or password"` if false), calls `signToken`, returns `{ user, token }` — never import Prisma directly; throw plain `Error` objects only

**Checkpoint**: Run `npx tsc --noEmit` — zero TypeScript errors. All five files compile cleanly.

---

## Phase 3: User Story 1 — New User Registers (Priority: P1) 🎯 MVP

**Goal**: A new visitor can fill the registration form (name, email, password), submit it,
and land on `/dashboard` with a valid session cookie set.

**Independent Test**: Open `/register`, submit valid details → lands on `/dashboard`.
Verify the `token` httpOnly cookie is set. Refresh the page → stays on `/dashboard`.
See quickstart.md scenarios S1, S2, S3.

### Implementation for User Story 1

- [x] T012 [P] [US1] Create `src/features/auth/components/SubmitButton.tsx` as a `"use client"` component with props `{ pending: boolean; label: string }` — renders a Shadcn `Button` with `type="submit"` and `disabled={pending}`; content renders `{pending ? "Loading..." : label}`; import `Button` from `src/components/ui/button`
- [x] T013 [US1] Create `src/actions/auth.actions.ts` with `"use server"` directive and implement `registerAction(formData: FormData): Promise<{ success: boolean; message: string } | never>` (depends on T011): extract `name`, `email`, `password` from `formData.get()`; wrap `authService.register` call in `try/catch`; on success call `(await cookies()).set("token", token, { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production", maxAge: 60 * 60 * 24 * 7, path: "/" })` then store redirect path; on error return `{ success: false, message: (error as Error).message }`; call `redirect("/dashboard")` OUTSIDE the `try/catch` block
- [x] T014 [US1] Create `app/(auth)/register/page.tsx` as a `"use client"` page (depends on T012, T013): use `useForm` with `zodResolver(registerSchema)` from `src/server/validations/auth.validation`; declare `useTransition` for `isPending` and `startTransition`; render a Shadcn `Card` containing a `<form>` with three `FormField` components using Shadcn `Input` — name (text), email (text), password (type="password"); each field shows its `formState.errors` message inline beneath it via Shadcn `FormMessage`; on submit call `startTransition` wrapping an async function that builds a `FormData` from form values, calls `registerAction`, and sets a server error state if `result && !result.success`; render server error text below the form using Tailwind `text-sm text-destructive`; render `<SubmitButton pending={isPending} label="Register" />`; render a link to `/login` below the card

**Checkpoint**: Start dev server (`npm run dev`). Visit `/register`, submit valid data → redirected to
`/dashboard`. Submit duplicate email → error shown on page. Submit empty form → inline field errors appear.

---

## Phase 4: User Story 2 — Existing User Logs In (Priority: P1)

**Goal**: A returning user can fill the login form (email, password), submit it, and land on
`/dashboard` with a valid session. Wrong credentials show a single generic error.

**Independent Test**: Using an account created in US1, fill `/login` with correct credentials
→ lands on `/dashboard`. Fill wrong password → same generic error regardless of whether email
or password was wrong. See quickstart.md scenarios S4, S5.

### Implementation for User Story 2

- [x] T015 [US2] Add `loginAction(formData: FormData): Promise<{ success: boolean; message: string } | never>` to `src/actions/auth.actions.ts` (depends on T013, T011): same pattern as `registerAction` — extract `email` and `password`; wrap `authService.login` in `try/catch`; set cookie on success; return `{ success: false, message }` on error; call `redirect("/dashboard")` outside `try/catch`
- [x] T016 [US2] Create `app/(auth)/login/page.tsx` as a `"use client"` page (depends on T012, T015): same pattern as `register/page.tsx` using `loginSchema` and `loginAction`; fields: email (text), password (type="password"); `<SubmitButton pending={isPending} label="Log In" />`; render a link to `/register` below the card; server error text below the form

**Checkpoint**: Visit `/login`, submit valid credentials → redirected to `/dashboard`. Submit
wrong password → generic error `"Invalid email or password"` shown — message does not change
if email is wrong vs password is wrong. Loading state visible on slow connection.

---

## Phase 5: User Story 3 — Session Persists Across Reloads (Priority: P2)

**Goal**: A user who registered or logged in stays authenticated after a page refresh.
The `token` cookie with `httpOnly` and correct `maxAge` is already set by US1/US2 actions.
This phase verifies the session-reading path works end-to-end.

**Independent Test**: Log in via US1 or US2, refresh the browser → stays on `/dashboard`.
Open DevTools → Application → Cookies → confirm `token` cookie has `HttpOnly` flag and a
7-day expiry. See quickstart.md scenario S10.

> **Note**: The implementation for this story lives across foundational tasks (T008 —
> `getSession` in `src/lib/auth.ts`) and the cookie-setting code in T013/T015. No new
> implementation files are needed in this phase. The phase consists of a single integration
> verification task.

### Implementation for User Story 3

- [x] T017 [US3] Verify session persistence end-to-end: log in, confirm `token` cookie is set with `httpOnly: true`, `sameSite: lax`, and `maxAge: 604800`; refresh the page and confirm the browser remains on `/dashboard` without a redirect to `/login`; if `getSession()` returns `null` after refresh, debug `src/lib/auth.ts` — check that `verifyToken` uses `await jwtVerify` correctly and that `JWT_SECRET` matches the value used when the token was signed

**Checkpoint**: Page refresh on `/dashboard` keeps the user authenticated. Cookie attributes
verified in DevTools.

---

## Phase 6: User Story 4 — Route Protection & Auth-State Redirects (Priority: P2)

**Goal**: Unauthenticated users cannot reach `/dashboard` (redirected to `/login`).
Authenticated users visiting `/login` or `/register` are redirected to `/dashboard`.
Protection works at both the middleware layer and the page/layout level.

**Independent Test**: Delete `token` cookie → navigate to `/dashboard` → redirected to `/login`.
Log in → navigate to `/login` → redirected to `/dashboard`. See quickstart.md scenarios S6, S7.

### Implementation for User Story 4

- [x] T018 [P] [US4] Create `app/(auth)/layout.tsx` as a Server Component (depends on T008): call `getSession()` from `src/lib/auth`; if session exists call `redirect("/dashboard")` from `next/navigation`; render `children` inside a `<div>` with Tailwind classes `flex min-h-screen items-center justify-center` — no sidebar, no navigation bar
- [x] T019 [P] [US4] Create `app/(dashboard)/dashboard/page.tsx` as a Server Component (depends on T008): call `getSession()` from `src/lib/auth`; if no session call `redirect("/login")`; render a temporary placeholder: `<h1 className="text-2xl font-bold">Dashboard</h1>` and `<p className="text-muted-foreground">Coming soon.</p>` — this page will be replaced in the dashboard feature
- [x] T020 [US4] Create `middleware.ts` at the repository root (same level as `package.json`) — NOT inside `src/` (depends on T008): import `NextRequest` and `NextResponse` from `next/server`; import `verifyToken` from `@/lib/auth`; read token with `request.cookies.get("token")?.value` (do NOT use `next/headers` — unavailable in Edge runtime); call `verifyToken(token)`; if path starts with `/dashboard` and no valid session → `NextResponse.redirect(new URL("/login", request.url))`; if path is `/login` or `/register` and session is valid → `NextResponse.redirect(new URL("/dashboard", request.url))`; otherwise `NextResponse.next()`; export `config` with matcher `["/dashboard/:path*", "/login", "/register"]`

**Checkpoint**: Middleware intercepts all routes in the matcher. Direct navigation to
`/dashboard` without a cookie → redirected to `/login`. Authenticated navigation to
`/login` → redirected to `/dashboard`.

---

## Phase 7: User Story 5 — User Logs Out (Priority: P2)

**Goal**: An authenticated user can trigger logout, which deletes their session cookie and
sends them to `/login`. Back-navigation to `/dashboard` after logout is blocked.

**Independent Test**: Log in, trigger logout → lands on `/login`, `token` cookie is gone.
Press browser back button → redirected back to `/login`. See quickstart.md scenario S8.

### Implementation for User Story 5

- [x] T021 [US5] Add `logoutAction(): Promise<never>` to `src/actions/auth.actions.ts` (depends on T013): `(await cookies()).delete("token")`; call `redirect("/login")` — no `try/catch` needed; cookie deletion is infallible
- [x] T022 [US5] Add a logout button to `app/(dashboard)/dashboard/page.tsx` (depends on T019, T021): convert the page to accept the logout button — add a `<form action={logoutAction}>`containing a Shadcn `Button` with `type="submit"` and text "Log Out"; place it visibly on the placeholder dashboard page

**Checkpoint**: Log in → click "Log Out" → redirected to `/login`. Navigate back to
`/dashboard` → redirected to `/login`. Cookie is absent in DevTools.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final TypeScript validation, end-to-end scenario verification, and code hygiene.

- [x] T023 [P] Run `npx tsc --noEmit` from the repository root and fix every TypeScript error until the command exits with zero errors — no `any` types, all functions have explicit return types, all interfaces used (not `type` aliases for object shapes)
- [x] T024 [P] Run all 10 quickstart.md validation scenarios (S1–S10) manually in the browser against `npm run dev`; mark each scenario as verified or document any failures
- [x] T025 [P] Verify `.env.example` contains `JWT_SECRET=` (empty placeholder) and is committed to the repository; verify `.env.local` is in `.gitignore` and is NOT committed
- [x] T026 Verify the `token` cookie is absent from all API responses and server-side logs — `console.log` or error messages must never include the raw token string or any password value

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies — can start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 completion — BLOCKS all user stories
- **Phase 3 (US1 — Register)**: Depends on Phase 2 completion
- **Phase 4 (US2 — Login)**: Depends on Phase 2 completion; can run in parallel with Phase 3
- **Phase 5 (US3 — Session)**: Depends on Phase 3 and Phase 4 (both actions must be complete)
- **Phase 6 (US4 — Route Protection)**: Depends on Phase 2 (uses `getSession` and `verifyToken`)
- **Phase 7 (US5 — Logout)**: Depends on Phase 3 (file created in T013) and Phase 6 (T019)
- **Phase 8 (Polish)**: Depends on all preceding phases

### User Story Dependencies

- **US1 (P1)**: Unblocked after Phase 2 — no dependency on other stories
- **US2 (P1)**: Unblocked after Phase 2 — T015/T016 extend the file created in T013; can start in parallel with US1 after Phase 2 if SubmitButton (T012) is complete
- **US3 (P2)**: Validated after US1 and US2 are complete — no new implementation files
- **US4 (P2)**: Unblocked after Phase 2 — layout (T018) and dashboard (T019) only need `getSession`; middleware (T020) only needs `verifyToken`
- **US5 (P2)**: Depends on T013 (file to extend) and T019 (dashboard to update)

### Within Each Phase

- T007 (types) must complete before T008, T009, T010
- T008 (lib/auth) and T009 (validations) can run in parallel after T007
- T010 (repository) requires T007 and T008; can start once both complete
- T011 (service) requires T009 and T010
- T012 (SubmitButton) and T013 (registerAction) can start in parallel once Phase 2 is complete
- T014 (register page) requires T012 and T013
- T015 (loginAction) extends T013's file — write sequentially or as a follow-up to T013
- T016 (login page) requires T012 and T015

### Parallel Opportunities

**Within Phase 1** — T002, T003, T004, T005, T006 can all run in parallel after T001.

**Within Phase 2** — T008 and T009 can run in parallel after T007; T010 can start once T008 and T007 complete; T011 starts after T009 and T010.

**Phases 3 + 4** can run in parallel once Phase 2 completes (different page files; SubmitButton shared but created in T012 before T016 needs it).

**Phases 6 + 5** can run in parallel — US4 needs only `getSession`/`verifyToken` (T008), which is done in Phase 2.

---

## Parallel Example: Phase 2 (Foundational)

```
After T007 types file is created:
  [start in parallel]
  Task T008: "Create src/lib/auth.ts with signToken, verifyToken, getSession"
  Task T009: "Create src/server/validations/auth.validation.ts with registerSchema and loginSchema"

  [after T007 + T008 complete]
  Task T010: "Create src/server/repositories/auth.repository.ts"

  [after T009 + T010 complete]
  Task T011: "Create src/server/services/auth.service.ts"
```

## Parallel Example: Phase 3 + Phase 6 (after Phase 2)

```
[start in parallel once Phase 2 is done]
  Task T012: "Create src/features/auth/components/SubmitButton.tsx"
  Task T018: "Create app/(auth)/layout.tsx"
  Task T019: "Create app/(dashboard)/dashboard/page.tsx"
  Task T020: "Create middleware.ts at repository root"

[after T012 completes]
  Task T013: "Create src/actions/auth.actions.ts with registerAction"

[after T013 completes]
  Task T014: "Create app/(auth)/register/page.tsx"
```

---

## Implementation Strategy

### MVP First (US1 — Register Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational) — critical blocker
3. Complete Phase 3 (US1 — Register): T012 → T013 → T014
4. **STOP and VALIDATE**: Run quickstart S1, S2, S3
5. A user can register and reach the (unprotected) dashboard

### Full Auth Feature Delivery (Recommended Order)

1. Phase 1 + Phase 2 → foundation ready
2. Phase 3 (US1) + Phase 4 (US2) in parallel → register + login both working
3. Phase 5 (US3) → verify session persistence
4. Phase 6 (US4) → add route protection and auth layout
5. Phase 7 (US5) → add logout
6. Phase 8 (Polish) → TypeScript gate + end-to-end scenario walkthrough

---

## Notes

- `[P]` tasks write to different files and have no shared-state dependencies — safe to run concurrently
- `[Story]` label maps every task to a user story in [spec.md](spec.md) for traceability
- `cookies()` from `next/headers` **must be awaited** in all server-side code (Next.js 15+/16)
- `redirect()` from `next/navigation` **must be called outside `try/catch`** in Server Actions
- `middleware.ts` must be at the **repository root** (not inside `src/`); use `request.cookies` not `next/headers`
- Never return or log the `password` field; never return or log the raw JWT token
- Run `npx tsc --noEmit` after every phase to catch type errors early
- `findUserByEmailWithPassword` is a private repository helper for bcrypt comparison only — the password must not appear in service return values
