# Research: App Shell Navigation

**Feature**: `004-app-shell-nav` | **Date**: 2026-06-09

All decisions below are resolved from the spec, clarifications, existing codebase, and constitution. No external research tasks were required — the tech stack and patterns are fully specified.

---

## Decision 1: Session Validation Location

**Decision**: Move session validation from each page to `src/app/(dashboard)/layout.tsx`.

**Rationale**: The layout wraps all routes in the `(dashboard)` route group. A single `getSession()` call in the layout eliminates repetition across pages. Defence in depth is maintained — the middleware at `src/middleware.ts` already protects `/dashboard/*` routes; the layout check is an additional layer. Individual placeholder pages do not need to call `getSession()`.

**Alternatives considered**: Per-page `getSession()` (existing pattern in `dashboard/page.tsx`) — rejected because it creates duplication and risk of omission when new pages are added.

---

## Decision 2: User Display Name Resolution

**Decision**: Call `getUserById()` (a new data function in `src/data/user.ts`) in the layout to fetch the full user record from the database using `session.userId`.

**Rationale**: The JWT payload (`JwtPayload`) contains only `{ userId, email }` per constitution Principle VII. The `name` field is stored in MongoDB and must be fetched. The data function pattern (Principle I) requires this to happen in a Server Component via `src/data/`. The layout is the correct location because it runs once per navigation and provides `{ name, email }` to all child components.

**Alternatives considered**: Passing only email and deriving an "email name" on the client — rejected because it would display email addresses as user names, which is a poor UX and not what the database stores.

---

## Decision 3: New `user.repository.ts` vs Reusing `auth.repository.ts`

**Decision**: Create a new `src/server/repositories/user.repository.ts` with a `findById(id)` method.

**Rationale**: `auth.repository.ts` contains `findUserById` which could technically be reused. However, the auth repository's responsibilities are authentication-specific (find by email, find with password). A dedicated `user.repository.ts` keeps the auth repository focused and allows future user profile queries (avatar, preferences, etc.) to be added without polluting the auth layer. This follows single-responsibility principle.

**Alternatives considered**: Calling `auth.repository.findUserById` directly from the data function — rejected on separation-of-concerns grounds; auth repository should not be the general user data source.

---

## Decision 4: Active Link Detection Rules

**Decision**: Dashboard uses exact match (`pathname === "/dashboard"`); all other nav items use prefix match (`pathname.startsWith(href)`).

**Rationale**: `/dashboard` is the root of the authenticated area. Without exact matching, it would always show as active because every authenticated URL starts with `/`. All other sections (`/expenses`, `/income`, etc.) use prefix matching to correctly highlight parent routes when sub-routes exist in future (e.g., `/expenses/123` should highlight the Expenses nav item).

**Alternatives considered**: Uniform exact matching for all — rejected because it would fail to highlight parent sections on sub-routes. Uniform prefix matching — rejected because `/dashboard` would always be active.

---

## Decision 5: Sheet Close on Navigation (Mobile)

**Decision**: `NavLinks` accepts an optional `onNavigate?: () => void` prop that is called after any link click. `MobileHeader` passes `onNavigate={() => setOpen(false)}`.

**Rationale**: Next.js `Link` navigation is instant (client-side routing). Without a callback, the Sheet would stay open after the user taps a link. The `onNavigate` prop keeps `NavLinks` reusable in both desktop and mobile contexts — on desktop it's not used; on mobile it closes the Sheet.

**Alternatives considered**: Using `useRouter` and `usePathname` to detect navigation changes in `MobileHeader` and close the Sheet reactively — rejected as more complex and adds an extra render cycle.

---

## Decision 6: Error Handling in Layout

**Decision**: Wrap `getUserById()` in a `try/catch` in the layout and call `redirect("/login")` on any thrown error.

**Rationale**: `getUserById()` throws either `"Unauthorized"` (no session) or `"User not found"` (invalid user ID in token). Both cases indicate the user cannot access the authenticated shell. Redirecting to `/login` is the correct response for both. The layout cannot render an error UI because it would break the shell structure.

**Alternatives considered**: Returning `null` from `getUserById` instead of throwing — rejected because it would require null checks throughout the call chain and obscure the error reason.

---

## Decision 7: `error.tsx` Scope Addition

**Decision**: Add five `error.tsx` files (one per section page) as a constitution-mandated requirement not covered in the original spec.

**Rationale**: Constitution Principle VIII states: "Each page MUST have a colocated `error.tsx`; global error catchers that swallow page-level errors are PROHIBITED." This is non-negotiable. The spec did not mention error boundaries because it focused on the happy path, but the constitution overrides the spec on quality gates.

**Alternatives considered**: A single shared error boundary — rejected explicitly by the constitution ("global error catchers… PROHIBITED").
