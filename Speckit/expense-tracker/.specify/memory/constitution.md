<!-- SYNC IMPACT REPORT
Version change: 1.0.0 → 1.1.0
Modified principles:
  - II. Strict Architecture Layering → removed Controller layer (was never part of intended architecture);
    clarified separate read/write call chains; added userId-scoping requirement on repositories
  - III. TypeScript Discipline → added full naming convention table (Server Actions, action files, data functions)
  - IV. Consistent Response Contract → split into two distinct contracts: data functions (return directly)
    vs. Server Actions ({ success, message }); clarified revalidatePath and redirect rules
  - V. UI Component Integrity → added lucide-react icon rule
  - VI. Formatting & Localisation → fixed date format from "MMM dd yyyy" to "MMM dd, yyyy"
Added sections:
  - Principle VII: Authentication & Session Management
  - Principle VIII: UI Component & Interaction Patterns
Removed sections: None
Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check is dynamic; no structural update needed
  ✅ .specify/templates/spec-template.md — no constitution-specific references; no update needed
  ✅ .specify/templates/tasks-template.md — no constitution-specific references; no update needed
Deferred TODOs: None
-->

# Expense Tracker Constitution

## Core Principles

### I. Server-First Data Access

All data reads MUST happen inside async React Server Components via functions in `src/data/`.
All mutations MUST be implemented as Server Actions in `src/actions/` with the `.actions.ts` file suffix.
Route Handlers, API routes (`app/api/*`), and `useEffect` for data fetching are PROHIBITED.
Data functions MUST be prefixed with `get` (e.g., `getExpenses`, `getUserById`).
Client Components MUST NOT fetch data directly.

**Rationale**: Eliminating a separate API layer removes a class of serialization bugs, reduces
round-trips, and keeps data concerns co-located with the components that render them. The
Next.js App Router makes this possible without sacrificing security.

### II. Strict Architecture Layering

The call chain for reads MUST follow:
`Server Component → src/data/ → src/server/services/ → src/server/repositories/ → Prisma`

The call chain for writes MUST follow:
`Server Action → src/server/services/ → src/server/repositories/ → Prisma`

- `src/data/` functions are server-only and MUST call `getSession()` internally to scope queries.
- `src/actions/` Server Actions MUST call `getSession()` internally; they MUST NOT accept a
  userId as an argument from the caller.
- Services MUST NOT import Prisma or the `db` singleton directly; all DB access goes through
  repositories.
- Repositories MUST import Prisma exclusively from `src/lib/prisma.ts`; every repository query
  MUST be scoped by `userId` to prevent cross-user data leaks.
- Direct `new PrismaClient()` calls outside `src/lib/prisma.ts` are PROHIBITED.

**Rationale**: Layer isolation makes each unit independently testable and prevents the
"fat action" and "leaky repository" anti-patterns. Scoping every repository call by `userId`
at the architectural level eliminates an entire class of authorisation bugs.

### III. TypeScript Discipline

- TypeScript strict mode is NON-NEGOTIABLE; `tsconfig.json` MUST have `"strict": true`.
- `interface` MUST be used instead of `type` aliases for object shapes (use `type` only for unions).
- Every function and method MUST carry an explicit return type annotation.
- The `any` type is PROHIBITED; use `unknown` at system boundaries and narrow with type guards.
- Zod schemas MUST have their inferred types exported alongside the schema:
  `export type FormInput = z.infer<typeof formInputSchema>`.

**Naming conventions** (NON-NEGOTIABLE):

| Artifact | Convention | Example |
|---|---|---|
| React components | PascalCase file + export | `ExpenseCard.tsx` |
| React hooks | camelCase, `use` prefix | `useExpenses.ts` |
| Utility functions | camelCase | `formatCurrency.ts` |
| Data read functions | camelCase, `get` prefix | `getExpenses.ts` |
| Server Action functions | camelCase, `Action` suffix | `createExpenseAction` |
| Server Action files | `.actions.ts` suffix | `expense.actions.ts` |

One component per file; max 200 lines per component file.

**Rationale**: Strict types surface integration errors at compile time. Consistent naming makes
the layered architecture self-documenting — any engineer can infer a function's role from its
name alone.

### IV. Consistent Response Contract

Two distinct response shapes apply depending on context:

**Data functions** (`src/data/`) return data directly or throw; they do NOT return result envelopes.
Server Components render the data or let errors propagate to the nearest `error.tsx` boundary.

**Server Actions** (`src/actions/`) MUST return:

```ts
{ success: boolean; message: string }
```

- On success: `success: true`, a user-readable confirmation in `message`, and MUST call
  `revalidatePath()` for every affected route before returning.
- On failure: `success: false`, a human-readable failure reason in `message`.
- On redirect: call `revalidatePath()` first, then use `redirect()` from `next/navigation`.
- Server Actions MUST NOT expose internal error details (stack traces, DB errors) in `message`.

**API/integration responses** (if Route Handlers are ever used for external consumers only) MUST
conform to:

```ts
{ success: true;  data: unknown; message: string }  // happy path
{ success: false; data: null;    message: string }  // error path
```

**Rationale**: Separating Server Action results (mutation feedback) from data function results
(rendering data) matches how Next.js App Router is designed to be used and avoids wrapping
read-path data in unnecessary envelopes.

### V. UI Component Integrity (Shadcn)

- Shadcn UI components MUST be installed via `npx shadcn@latest add <component>` before first
  import. Always verify `src/components/ui/` before installing to avoid duplicates.
- Manually creating or copying Shadcn component files into `src/components/ui/` is PROHIBITED.
- Form validation MUST use Zod schemas; forms MUST use React Hook Form with `zodResolver`.
- Tailwind CSS MUST be the sole styling mechanism; inline `style` props and external CSS files
  (other than `globals.css`) are PROHIBITED.
- Icons MUST come from `lucide-react`; importing other icon libraries is PROHIBITED without a
  constitution amendment.

**Rationale**: Running the Shadcn CLI guarantees component compatibility with the installed
versions of Radix and Tailwind, avoiding invisible version drift.

### VI. Formatting & Localisation Conventions

- Monetary amounts MUST be formatted as Indian Rupees using
  `new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })`.
- Dates MUST be displayed in `MMM dd, yyyy` format (e.g., "Jun 09, 2026") using
  `Intl.DateTimeFormat`.
- Hardcoding currency symbols, locale strings, or date formats outside of a shared formatter
  utility in `src/utils/` is PROHIBITED.

**Rationale**: Centralising number and date formatting prevents inconsistent rendering across
pages and makes locale changes a single-file update.

### VII. Authentication & Session Management

- Authentication MUST use JWT tokens stored in a single httpOnly cookie named `token`.
- Cookie MUST be configured: `httpOnly: true`, `sameSite: "lax"`, `secure: true` in production,
  `maxAge: 60 * 60 * 24 * 7` (7 days).
- JWT payload shape MUST be `{ userId: string; email: string }` — no additional fields.
- `getSession()` in `src/lib/auth.ts` reads from `next/headers` cookies and returns the decoded
  payload or `null`; it MUST NEVER throw.
- `verifyToken()` in `src/lib/auth.ts` returns `null` on any failure; it MUST NEVER throw.
- Passwords MUST be hashed with `bcrypt` before storage; plain-text passwords MUST NEVER appear
  in responses, logs, or database records.
- Authentication error messages MUST NOT reveal whether the email or the password was incorrect
  (use a single generic message for both cases).
- `middleware.ts` at the repository root MUST protect `/dashboard/*`; unauthenticated requests
  MUST be redirected to `/login`.
- Authenticated users visiting `/login` or `/register` MUST be redirected to `/dashboard`.
- Route groups: `app/(auth)/` for unauthenticated pages; `app/(dashboard)/` for authenticated
  pages with the shared authenticated layout.

**Rationale**: httpOnly cookies prevent XSS-based token theft. A single generic login error
message prevents user enumeration attacks. Middleware-level route protection ensures no
authenticated-only page can be accessed without a valid session, regardless of how it is linked.

### VIII. UI Component & Interaction Patterns

- **Forms**: ALL create/edit forms MUST be rendered inside Shadcn `Dialog` modals. Dedicated
  form pages are PROHIBITED for within-app data entry.
- **Lists**: Content lists MUST use a `Table` component on `md` and above breakpoints, and
  `Card` components on mobile (below `md`).
- **Filters & URL state**: Filter state MUST live in URL search params managed via `useRouter`;
  using `useState` for filter state is PROHIBITED.
- **Loading states**: Each page MUST have a colocated `loading.tsx` using Shadcn `Skeleton`
  components. Global or shared loading spinners are PROHIBITED.
- **Empty states**: The shared `EmptyState` component (icon + title + description + action slot)
  MUST be used for all zero-results views.
- **Error boundaries**: Each page MUST have a colocated `error.tsx`; global error catchers that
  swallow page-level errors are PROHIBITED.
- **Charts**: Data visualisation MUST use `Recharts`; introducing alternative charting libraries
  requires a constitution amendment.

**Rationale**: Consistent UI patterns reduce cognitive load for users and future contributors.
URL-based filter state enables shareable, bookmarkable filtered views without additional state
management complexity.

## Technology Stack

| Concern | Technology |
|---|---|
| Framework | Next.js 16, App Router only |
| Language | TypeScript (strict mode) |
| Styling | Tailwind CSS |
| Component library | Shadcn UI (CLI-managed) |
| Icons | lucide-react |
| Form / Validation | React Hook Form + Zod |
| ORM | Prisma |
| Database | MongoDB |
| Authentication | JWT via httpOnly cookie, bcrypt password hashing |
| Charts | Recharts |

No additional runtime dependencies may be introduced without a constitution amendment that
documents the rationale and updates this table.

## Development Workflow & Quality Gates

- Every feature MUST be developed on a dedicated branch following the naming convention
  defined in the `speckit-git-feature` extension.
- A spec (`spec.md`) MUST exist and be reviewed before implementation begins.
- Principle II (Architecture Layering) MUST be verified during code review before merge.
- Principle IV (Response Contract) MUST be validated by inspecting all Server Action return paths.
- Principle VII (Authentication) MUST be verified: no passwords in responses, generic error messages,
  middleware protection active.
- TypeScript compilation with `tsc --noEmit` MUST pass with zero errors before a PR is approved.
- Shadcn components MUST be verified to have been added via CLI (check `components.json` and
  `src/components/ui/` for unexpected manual files).

## Governance

This constitution supersedes all other project conventions, README guidance, and verbal agreements.
Amendments require:

1. A documented rationale explaining why the current principle is insufficient.
2. A version bump following semantic versioning (MAJOR for removals/redefinitions, MINOR for
   additions, PATCH for clarifications).
3. Propagation of the change to all affected templates under `.specify/templates/`.
4. An updated Sync Impact Report prepended to this file.

All PRs MUST be reviewed against the principles above. Violations MUST be noted in the review;
a waiver requires explicit justification recorded in the PR description and tracked in a
Complexity Tracking table in the relevant `plan.md`.

The agent context file (`.specify/memory/agent-context.md` if present) MUST be refreshed
after every amendment via the `speckit-agent-context-update` extension.

**Version**: 1.1.0 | **Ratified**: 2026-06-09 | **Last Amended**: 2026-06-09
