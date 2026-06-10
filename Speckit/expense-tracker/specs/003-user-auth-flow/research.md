# Research: User Authentication Flow

**Branch**: `003-user-auth-flow` | **Date**: 2026-06-09

## Decision Log

### 1. JWT Library — `jose` (not `jsonwebtoken`)

**Decision**: Use `jose` v6 (already installed as a dependency).

**Rationale**: `jose` is a WebCrypto-based JWT implementation that works in Edge runtimes
and Node.js. The project already has it installed. `jsonwebtoken` does not support the
Edge runtime and would add an unnecessary dependency.

**Implementation notes**:
- `SignJWT` for token creation, `jwtVerify` for verification
- Algorithm: `HS256` (HMAC-SHA256) using `JWT_SECRET` env var
- Secret must be encoded as `new TextEncoder().encode(process.env.JWT_SECRET)`
- `signToken({ userId, email })` → returns a signed JWT string
- `verifyToken(token)` → returns `JwtPayload | null`, NEVER throws
- `getSession()` → reads `token` cookie from `next/headers`, calls `verifyToken`, returns `JwtPayload | null`

**Alternatives considered**:
- `jsonwebtoken` — rejected: no Edge runtime support, not installed
- `next-auth` / `auth.js` — rejected: heavyweight, constitution mandates custom JWT + httpOnly cookie

---

### 2. Password Hashing — `bcryptjs` (not `bcrypt`)

**Decision**: Use `bcryptjs` v3 (already installed). Hash cost factor: 12.

**Rationale**: `bcryptjs` is a pure-JS implementation with no native bindings, making it
deploy-friendly. Already installed. The `@types/bcryptjs` devDep is also present.

**Cost factor 12**: balances security (sufficient work factor against brute force) with
server-side latency (~300-500ms per hash on modern hardware — acceptable for auth flows).

**Alternatives considered**:
- `bcrypt` (native) — rejected: native bindings add build complexity, not installed
- `argon2` — rejected: not installed, would add dependency

---

### 3. Missing `src/lib/auth.ts`

**Decision**: `src/lib/auth.ts` must be created as part of this feature (it is NOT pre-existing).

**Finding**: The spec stated it was already set up, but the repository only has `src/lib/prisma.ts`
and `src/lib/utils.ts`. `auth.ts` is absent.

**Required exports**:
```ts
signToken(payload: JwtPayload): Promise<string>
verifyToken(token: string): Promise<JwtPayload | null>
getSession(): Promise<JwtPayload | null>
```

`getSession` must use `await cookies()` (see item 5 below).

---

### 4. Missing Dependencies — `zod`, `react-hook-form`, `@hookform/resolvers`

**Decision**: Three packages must be installed before implementing UI layers.

**Rationale**: The validation schemas (Layer 2) require Zod. The register and login pages
(Layers 9–10) require React Hook Form with the Zod resolver.

**Packages to add**:
```
npm install zod react-hook-form @hookform/resolvers
```

None are currently in `package.json`.

---

### 5. `cookies()` Is Async in Next.js 15+ / 16

**Decision**: All calls to `cookies()` from `next/headers` MUST be awaited.

**Rationale**: Starting with Next.js 15, `cookies()` returns a `Promise`. Next.js 16 continues
this pattern. Calling it without `await` returns a thenable, not the resolved value — silent
bug that causes cookies to never be set or read.

**Correct pattern in Server Actions**:
```ts
const cookieStore = await cookies();
cookieStore.set("token", token, { ... });
// or
cookieStore.delete("token");
```

**Correct pattern in `getSession()`**:
```ts
const cookieStore = await cookies();
const token = cookieStore.get("token")?.value;
```

---

### 6. `redirect()` Must Be Called Outside `try/catch`

**Decision**: In Server Actions, `redirect()` from `next/navigation` throws a special
`NEXT_REDIRECT` error internally. If called inside a `try/catch` block, the redirect
is intercepted by the catch handler and never fires.

**Correct pattern**:
```ts
export async function loginAction(formData: FormData) {
  let token: string | undefined;
  try {
    const result = await authService.login({ email, password });
    token = result.token;
    const cookieStore = await cookies();
    cookieStore.set("token", token, { ... });
  } catch (error) {
    return { success: false, message: (error as Error).message };
  }
  redirect("/dashboard"); // outside try/catch
}
```

---

### 7. `middleware.ts` Required at Repository Root

**Decision**: A `middleware.ts` file must be created at the project root (same level as
`package.json`) to enforce route-level protection.

**Rationale**: The constitution (Principle VII) mandates middleware-level protection for
`/dashboard/*`. Without it, route protection relies solely on per-page `getSession()` checks,
which can be bypassed by direct fetch or misconfiguration.

**Scope**: The middleware matcher must cover `/dashboard` and `/dashboard/:path*`. It should
also redirect authenticated users away from `/login` and `/register`.

**Implementation**: Read `token` cookie → call `verifyToken` → redirect based on result.
Cannot use `getSession()` directly in middleware because `next/headers` is not available
in the Edge runtime. Must read `request.cookies.get("token")` instead.

---

### 8. Shadcn Components — Only `button` Pre-installed

**Decision**: Install `card`, `form`, `input`, and `label` via Shadcn CLI before writing UI.

**Finding**: `src/components/ui/button.tsx` exists. The other four components (`card`, `form`,
`input`, `label`) are absent. Installing via `npx shadcn@latest add` is required per
Principle V.

---

### 9. Route Group Structure — Already Scaffolded

**Decision**: Use the existing `app/(auth)/` and `app/(dashboard)/` route groups.

**Finding**: Both directories exist as gitkeep placeholders, confirming the intended structure.
The `app/(auth)/` group hosts login and register pages. The `app/(dashboard)/` group hosts
all authenticated pages.

---

### 10. Prisma `User` Model — Pre-existing, Password Never Selected

**Decision**: The `User` model in `prisma/schema.prisma` is complete and does not need
modification for this feature.

**Key fields**: `id` (MongoDB ObjectId), `name`, `email` (unique), `password`, `createdAt`,
`updatedAt`.

**Repository rule**: All three repository functions must use Prisma `select` to explicitly
exclude the `password` field. Never return it. The `db` import MUST come from `src/lib/prisma.ts`.

---

### 11. Auth Form Exception to Dialog Rule (Constitution Principle VIII)

**Decision**: Auth forms (register, login) are rendered as full pages, not Shadcn Dialog modals.

**Rationale**: Constitution Principle VIII mandates all create/edit forms be in Dialogs.
However, auth is the application entry point — a Dialog requires a parent page and an
authenticated-or-guest context that does not yet exist. The spec explicitly calls this out
as the sole exception. This deviation is documented in plan.md Complexity Tracking.

---

### 12. `JWT_SECRET` Environment Variable

**Decision**: A `JWT_SECRET` must be present in `.env.local` (development) and deployment
environment variables.

**Minimum requirement**: 32 randomly-generated characters. Absence causes `verifyToken` to
fail on every call, breaking all auth.

**Not committed to repository**: Add to `.env.example` as a placeholder, keep actual value
out of version control.
