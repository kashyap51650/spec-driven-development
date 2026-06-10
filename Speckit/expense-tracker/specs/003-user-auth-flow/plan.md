# Implementation Plan: User Authentication Flow

**Branch**: `003-user-auth-flow` | **Date**: 2026-06-09 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/003-user-auth-flow/spec.md`

## Summary

Register and login flows for the expense tracker. New users create an account with name,
email, and password; returning users sign in with email and password. Successful auth sets
a 7-day httpOnly JWT cookie and redirects to `/dashboard`. Logout deletes the cookie and
redirects to `/login`. Route protection is enforced by `middleware.ts` at the repository
root. All forms are full pages with inline Zod-driven validation, server error display, and
loading states.

## Technical Context

**Language/Version**: TypeScript 5 (strict mode), Next.js 16.2.7 (App Router)

**Primary Dependencies**:
- `bcryptjs` v3 — password hashing (installed)
- `jose` v6 — JWT sign/verify (installed)
- `zod` — validation schemas (must install)
- `react-hook-form` + `@hookform/resolvers` — client-side form state (must install)
- `shadcn` CLI — component installation (installed)
- Prisma 6 + MongoDB — data persistence (installed)

**Storage**: MongoDB via Prisma ORM; generated client at `src/generated/prisma/client`

**Testing**: `npx tsc --noEmit` (zero TypeScript errors required before PR)

**Target Platform**: Web browser + Node.js server (Next.js full-stack)

**Project Type**: Web application (Next.js App Router, server components + server actions)

**Performance Goals**: Standard web-app expectations — register/login under 60s; form
validation errors appear instantly on submit without page reload

**Constraints**:
- Passwords never stored in plain text (bcrypt hash cost 12)
- Login errors must not reveal email-vs-password mismatch
- `cookies()` from `next/headers` must be awaited (Next.js 15+ API)
- `redirect()` must be called outside `try/catch` in Server Actions

**Scale/Scope**: Single-user-role app; no multi-tenancy, no role-based access control

## Constitution Check

*GATE: Must pass before implementation begins.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I — Server-First Data Access | ✅ Pass | All mutations via Server Actions in `src/actions/`. No Route Handlers. No `useEffect` data fetching. |
| II — Architecture Layering | ✅ Pass | Read chain: Server Component → `src/data/` (N/A for auth) → Service → Repository → Prisma. Write chain: Server Action → Service → Repository → Prisma. |
| III — TypeScript Discipline | ✅ Pass | Strict mode on. `interface` for all object shapes. Explicit return types on all functions. No `any`. Zod schemas export inferred types. |
| IV — Response Contract | ✅ Pass | Server Actions return `{ success: boolean; message: string }`. On success, `redirect()` fires (no envelope returned). Errors never expose internal details. |
| V — UI Component Integrity | ✅ Pass | Shadcn components installed via CLI. Forms use React Hook Form + zodResolver. Tailwind only. Icons from lucide-react. |
| VI — Formatting & Localisation | ✅ Pass | No currency or date formatting in auth flow. N/A. |
| VII — Authentication & Session Management | ✅ Pass | JWT in httpOnly cookie `"token"`. Correct cookie attributes. Generic login error. `getSession()` returns null, never throws. `middleware.ts` protects `/dashboard/*`. |
| VIII — UI Component & Interaction Patterns | ⚠️ Exception | Auth forms are **full pages**, not Dialog modals. Justified: auth is the app entry point — no parent page exists to host a Dialog. Documented in Complexity Tracking below. |

## Project Structure

### Documentation (this feature)

```text
specs/003-user-auth-flow/
├── plan.md              ← This file
├── research.md          ← Phase 0: resolved decisions
├── data-model.md        ← Phase 1: entities, validation rules, state transitions
├── quickstart.md        ← Phase 1: end-to-end validation scenarios
├── contracts/
│   └── server-actions.md ← Phase 1: Server Action + lib/auth.ts + middleware contracts
├── checklists/
│   └── requirements.md  ← Spec quality checklist (from /speckit-specify)
└── tasks.md             ← Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── actions/
│   └── auth.actions.ts              ← Layer 5: registerAction, loginAction, logoutAction
├── features/
│   └── auth/
│       └── components/
│           └── SubmitButton.tsx     ← Layer 7: shared loading-aware submit button
├── lib/
│   ├── auth.ts                      ← Layer 0: signToken, verifyToken, getSession
│   ├── prisma.ts                    ← Pre-existing: db singleton
│   └── utils.ts                     ← Pre-existing: cn()
├── server/
│   ├── repositories/
│   │   └── auth.repository.ts       ← Layer 3: findUserByEmail, findUserById, createUser
│   ├── services/
│   │   └── auth.service.ts          ← Layer 4: register(), login()
│   └── validations/
│       └── auth.validation.ts       ← Layer 2: registerSchema, loginSchema
└── types/
    └── auth.ts                      ← Layer 1: User, RegisterInput, LoginInput, JwtPayload

app/
├── (auth)/
│   ├── layout.tsx                   ← Layer 8: centered layout, redirects authed users
│   ├── login/
│   │   └── page.tsx                 ← Layer 10: login form page
│   └── register/
│       └── page.tsx                 ← Layer 9: register form page
└── (dashboard)/
    └── dashboard/
        └── page.tsx                 ← Layer 11: placeholder, guards unauthenticated access

middleware.ts                        ← Route protection (repo root, not inside src/)
```

**Structure Decision**: Next.js App Router with route groups `(auth)` and `(dashboard)`
for layout isolation. Server-side layering follows the constitution (types → validations →
repository → service → server actions). Client components limited to form pages and the
SubmitButton.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|--------------------------------------|
| Principle VIII: auth forms are full pages (not Dialog modals) | Auth is the application entry point. No parent page or authenticated context exists to host a Dialog. The session does not yet exist at the point the user sees these forms. | A Dialog requires a trigger button on a parent page. The register and login pages are the first pages a user sees — there is no parent page to place the trigger on. |

## Implementation Layers

*Each layer must be complete and passing TypeScript before the next begins.*

### Layer 0 — `src/lib/auth.ts` (JWT Utilities)

**Prerequisite**: `jose` (installed). `JWT_SECRET` env var set.

Create `src/lib/auth.ts` with three exports:

```ts
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { JwtPayload } from "@/types/auth";

const secret = new TextEncoder().encode(process.env.JWT_SECRET);

export async function signToken(payload: JwtPayload): Promise<string> { ... }
export async function verifyToken(token: string): Promise<JwtPayload | null> { ... }
export async function getSession(): Promise<JwtPayload | null> { ... }
```

- `verifyToken` and `getSession` return `null` on any failure; NEVER throw.
- `getSession` uses `await cookies()` (Next.js 15+ async API).

---

### Layer 1 — `src/types/auth.ts`

Four interfaces: `User` (no password field), `RegisterInput`, `LoginInput`, `JwtPayload`.

---

### Layer 2 — `src/server/validations/auth.validation.ts`

Zod schemas + exported inferred types:

```ts
export const registerSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;
```

---

### Layer 3 — `src/server/repositories/auth.repository.ts`

Three functions; imports `db` from `src/lib/prisma.ts` only.
All Prisma queries use an explicit `select` that excludes `password`.
Maps Prisma result to the `User` interface (no password field) before returning.

```ts
findUserByEmail(email: string): Promise<User | null>
findUserById(id: string): Promise<User | null>
createUser(data: { name: string; email: string; hashedPassword: string }): Promise<User>
```

`createUser` maps `hashedPassword` → Prisma `password` field and excludes password from
the return value.

---

### Layer 4 — `src/server/services/auth.service.ts`

Two exported functions; imports repository and `src/lib/auth.ts`. Never imports Prisma.

**`register`**:
1. Parse with `registerSchema.parse(input)` — throws ZodError on failure
2. `findUserByEmail` → if found `throw new Error("Email already in use")`
3. `bcryptjs.hash(password, 12)`
4. `createUser`
5. `signToken({ userId: user.id, email: user.email })`
6. Return `{ user, token }`

**`login`**:
1. Parse with `loginSchema.parse(input)` — throws ZodError on failure
2. `findUserByEmail` → if NOT found `throw new Error("Invalid email or password")`
3. `bcryptjs.compare(password, storedHash)` — if false `throw new Error("Invalid email or password")`

   > `findUserByEmail` normally excludes password. For login, the repository needs an
   > internal variant that selects the password for comparison only. The password must
   > not escape the service layer.

4. `signToken({ userId: user.id, email: user.email })`
5. Return `{ user, token }`

---

### Layer 5 — `src/actions/auth.actions.ts`

`"use server"` directive at top.

Three actions: `registerAction`, `loginAction`, `logoutAction`.

**Pattern for register/login**:
```ts
export async function loginAction(
  formData: FormData
): Promise<{ success: boolean; message: string } | never> {
  // extract fields
  let redirectPath: string | undefined;
  try {
    const result = await authService.login({ email, password });
    const cookieStore = await cookies();
    cookieStore.set("token", result.token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });
    redirectPath = "/dashboard";
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
  redirect(redirectPath); // OUTSIDE try/catch
}
```

**`logoutAction`**:
```ts
export async function logoutAction(): Promise<never> {
  (await cookies()).delete("token");
  redirect("/login");
}
```

---

### Layer 6 — Shadcn Component Installation

Run before writing any UI. `button` is already installed.

```bash
npx shadcn@latest add card
npx shadcn@latest add form
npx shadcn@latest add input
npx shadcn@latest add label
```

---

### Layer 7 — `src/features/auth/components/SubmitButton.tsx`

`"use client"` component. Props: `{ pending: boolean; label: string }`.
Renders a Shadcn `Button` with `type="submit"`, `disabled={pending}`.
Content: `{pending ? "Loading..." : label}`.

---

### Layer 8 — `app/(auth)/layout.tsx`

Server Component. Calls `getSession()`. If session exists: `redirect("/dashboard")`.
Renders `children` centered on screen (Tailwind flex + min-h-screen). No sidebar or nav.

---

### Layer 9 — `app/(auth)/register/page.tsx`

`"use client"`. React Hook Form + `zodResolver(registerSchema)`.
Fields: name, email, password (type="password").
Submit via `useTransition` + `startTransition`:
```ts
startTransition(async () => {
  const fd = new FormData();
  fd.append("name", data.name);
  fd.append("email", data.email);
  fd.append("password", data.password);
  const result = await registerAction(fd);
  if (result && !result.success) setServerError(result.message);
});
```
Per-field errors from `formState.errors`. Server error below the form in muted text.
`SubmitButton` with `pending={isPending}` and `label="Register"`.
Shadcn `Card` wraps the form. Link to `/login` below the card.

---

### Layer 10 — `app/(auth)/login/page.tsx`

Same pattern as Layer 9 using `loginSchema` and `loginAction`.
Fields: email, password. `SubmitButton label="Log In"`. Link to `/register`.

---

### Layer 11 — `app/(dashboard)/dashboard/page.tsx`

Server Component. Calls `getSession()`. If no session: `redirect("/login")`.
Renders temporary placeholder: `<h1>Dashboard</h1>` + `<p>Coming soon.</p>`.

---

### Layer 12 — `middleware.ts` (repository root)

```ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const token = request.cookies.get("token")?.value;
  const session = token ? await verifyToken(token) : null;
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/dashboard") && !session) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if ((pathname === "/login" || pathname === "/register") && session) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

Note: uses `request.cookies.get()` — NOT `next/headers` (unavailable in Edge runtime).
