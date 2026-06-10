# Add Authentication (Login & Register)

What: Implement login and register functionality for the Expense Tracker app. This change adds type definitions, validation schemas, repository and service layers, server actions for register/login/logout, auth UI pages, a small shared SubmitButton component, and middleware adjustments to enforce protected routes.

Why: The app currently has no authentication. Adding login and register enables per-user data isolation (expenses, incomes, budgets, transfers) and prepares the app for user-specific dashboards and settings.

Scope & Constraints

- Implement login and register only (no social providers, no password reset).
- Follow the project's Server Components + Server Actions architecture: reads via `src/data/` → `src/server/services/` → `src/server/repositories/` → Prisma; writes via Server Actions → services → repositories → Prisma.
- Do NOT create API routes or use `fetch`/`useEffect` to read data.
- Repositories are the only layer that imports Prisma (from `src/lib/prisma.ts`).
- Use Zod for validation and bcrypt for password hashing.
- Use JWT (signed with `JWT_SECRET`) stored in an httpOnly cookie named `token`.
- Use existing Shadcn components; install missing ones with the CLI as needed.

Change name: `add-authentication-login-register`

Location (change root): openspec/changes/add-authentication-login-register/

Artifacts created by this change:

- `proposal.md` (this file)
- `design.md` (implementation details)
- `tasks.md` (step-by-step implementation tasks)

Verification

- `npx tsc --noEmit` → zero TypeScript errors
- `npm run lint` → zero lint errors
- Register a new user → redirects to `/dashboard`
- Login with that user → redirects to `/dashboard`
- Visit `/login` while authenticated → redirects to `/dashboard`
- Visit `/dashboard` while unauthenticated → redirects to `/login`

Run when ready to implement: `/opsx:apply`
