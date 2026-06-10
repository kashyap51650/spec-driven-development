# Feature Specification: Base Project Setup

**Feature Branch**: `002-base-project-setup`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Set up the base Next.js expense tracker project repository."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Running Project with Zero Errors (Priority: P1)

A developer clones the repository, installs dependencies, and starts the development server. The project compiles and runs without any TypeScript errors or ESLint violations. Visiting the root URL redirects immediately to the dashboard route.

**Why this priority**: Nothing else can be built until the project starts cleanly. A zero-error baseline is the gate for all downstream feature development.

**Independent Test**: Run `npm install && npm run dev`, open the browser at the root URL, and confirm a redirect to `/dashboard` with no console errors. Run `tsc --noEmit` and `npm run lint` — both must exit with code 0.

**Acceptance Scenarios**:

1. **Given** a fresh clone of the repository, **When** a developer runs `npm install`, **Then** all dependencies install without errors or peer-dependency conflicts.
2. **Given** a valid `.env` file with all required keys populated, **When** the developer runs `npm run dev`, **Then** the server starts and the root URL (`/`) redirects to `/dashboard`.
3. **Given** the source code with no feature implementation yet, **When** `tsc --noEmit` is run, **Then** zero TypeScript errors are reported.
4. **Given** the source code, **When** `npm run lint` is run, **Then** zero ESLint errors or warnings are reported.

---

### User Story 2 - Navigable Project Structure (Priority: P2)

A developer opens the project and finds all architecture-layer directories already created and clearly named. Each empty directory contains a `.gitkeep` file so the structure is preserved in version control. The developer knows exactly where to add new code for any layer.

**Why this priority**: The folder structure enforces the architecture contract from day one. Without it, early contributors place files incorrectly and create structural debt that is expensive to fix.

**Independent Test**: Inspect the repository without running the app — all required directories exist, each contains exactly one `.gitkeep`, and no feature code is present.

**Acceptance Scenarios**:

1. **Given** the repository root, **When** a developer lists `src/`, **Then** all required layer directories are present: `types`, `constants`, `server/validations`, `server/repositories`, `server/services`, `data`, `actions`, `features`, `components/ui`, `components/shared`, `lib`, `utils`.
2. **Given** any of the above directories, **When** the directory contains no feature files, **Then** it contains exactly one `.gitkeep` file to preserve it in git.
3. **Given** the `app/` directory, **When** a developer inspects it, **Then** it contains only `(auth)/` and `(dashboard)/` route groups plus a root `page.tsx` that redirects to `/dashboard` — no other pages.

---

### User Story 3 - Database Schema Ready (Priority: P3)

A developer can inspect the Prisma schema and see all five data models (`User`, `Expense`, `Income`, `Transfer`, `Budget`) fully defined with correct field types, relations, and MongoDB ObjectId conventions. With a valid `DATABASE_URL`, the schema generates types correctly.

**Why this priority**: The data models are shared across all features. Having them defined before any feature is built prevents incompatible migrations later.

**Independent Test**: With `DATABASE_URL` set, run `npx prisma generate` — it completes with zero errors and produces typed Prisma client code.

**Acceptance Scenarios**:

1. **Given** the `prisma/schema.prisma` file, **When** a developer reads it, **Then** all five models are present with the correct fields, types, and MongoDB ObjectId conventions (`@id @default(auto()) @map("_id") @db.ObjectId`).
2. **Given** a valid `DATABASE_URL` environment variable, **When** `npx prisma generate` is run, **Then** the Prisma client generates successfully with no errors.
3. **Given** the `User` model, **When** inspected, **Then** `email` is marked unique and `password` is a plain string field (hashing is the application's responsibility, not the schema's).

---

### User Story 4 - Auth Utilities and Route Protection Ready (Priority: P4)

A developer can import `signToken`, `verifyToken`, and `getSession` from `src/lib/auth.ts`. The root middleware already protects `/dashboard/*` routes and handles auth-based redirects. These utilities work before any login/register UI exists.

**Why this priority**: Authentication utilities must exist before the auth feature is built. Having them in place means the auth feature can focus on UI and business logic without also scaffolding infrastructure.

**Independent Test**: Import the three functions in a test file — TypeScript resolves them with correct signatures and no errors.

**Acceptance Scenarios**:

1. **Given** `src/lib/auth.ts`, **When** a developer imports it, **Then** three exported functions are available: `signToken(payload: JwtPayload): Promise<string>`, `verifyToken(token: string): Promise<JwtPayload | null>`, `getSession(): Promise<JwtPayload | null>`.
2. **Given** an unauthenticated request to any `/dashboard/*` route, **When** the middleware runs, **Then** the request is redirected to `/login`.
3. **Given** an authenticated request (valid token cookie) to `/login` or `/register`, **When** the middleware runs, **Then** the request is redirected to `/dashboard`.
4. **Given** any request to `/api/auth/*`, **When** the middleware runs, **Then** the request passes through without an auth check.
5. **Given** `verifyToken` is called in the middleware (Edge runtime), **When** the token is invalid or expired, **Then** it returns `null` and never throws.

---

### Edge Cases

- What happens when `JWT_SECRET` is missing from the environment? The application must fail at startup with a descriptive error, not silently produce insecure tokens.
- What happens when `DATABASE_URL` is missing? Prisma client instantiation should fail at import time with a clear error message.
- What happens when the root `page.tsx` is visited while unauthenticated? Middleware redirects to `/login` (the redirect from `page.tsx` to `/dashboard` is then intercepted by middleware).
- What happens when `verifyToken` receives a malformed or tampered token? It returns `null` — it must never throw.

## Requirements _(mandatory)_

### Functional Requirements

**Project Initialization**

- **FR-001**: The project MUST use Next.js 16 with App Router only; Pages Router MUST NOT be present.
- **FR-002**: TypeScript MUST be configured with `strict: true` and path alias `@/*` mapping to `src/*`.
- **FR-003**: ESLint MUST be configured and pass with zero errors on the initial codebase.
- **FR-004**: `next.config.ts` MUST be minimal with no experimental flags enabled.
- **FR-005**: The root `app/page.tsx` MUST contain only a redirect to `/dashboard` — no content, no layout, no UI.

**Project Structure**

- **FR-006**: All architecture-layer directories listed in the project constitution MUST be created under `src/`.
- **FR-007**: Each empty directory MUST contain a `.gitkeep` file so the structure persists in version control.
- **FR-008**: No feature pages, UI components, or placeholder content beyond the root redirect MUST be created.

**Shadcn UI**

- **FR-009**: Shadcn UI MUST be initialized with: default style, neutral base colour, CSS variables enabled.
- **FR-010**: The `src/components/ui/` directory MUST be the install target; it MUST NOT contain manually created component files.

**Prisma & Data Models**

- **FR-011**: Prisma MUST be initialized with the MongoDB provider.
- **FR-012**: The schema MUST define five models: `User`, `Expense`, `Income`, `Transfer`, `Budget`.
- **FR-013**: All model IDs MUST use `@id @default(auto()) @map("_id") @db.ObjectId`.
- **FR-014**: `User.email` MUST be marked `@unique`.
- **FR-015**: `Expense.recurring` MUST default to `false`; `Expense.tags` MUST be `String[]`; `Expense.notes` MUST be optional.
- **FR-016**: `Income.notes`, `Transfer.note`, and their `userId` relations MUST be correctly defined.
- **FR-017**: `Budget` MUST include `category`, `limit` (Float), `month`, and `userId` fields.

**Core Library Files**

- **FR-018**: `src/lib/prisma.ts` MUST export a PrismaClient singleton using `globalThis` to prevent multiple instances in development hot-reload.
- **FR-019**: `src/lib/auth.ts` MUST export `signToken(payload: JwtPayload): Promise<string>` using the `jose` library.
- **FR-020**: `src/lib/auth.ts` MUST export `verifyToken(token: string): Promise<JwtPayload | null>` using `jose`; it MUST return `null` on any failure and MUST NEVER throw.
- **FR-021**: `src/lib/auth.ts` MUST export `getSession(): Promise<JwtPayload | null>` reading from `next/headers` cookies; it is server-only and MUST NEVER throw.
- **FR-022**: `JwtPayload` interface MUST be defined as `{ userId: string; email: string }` and exported from `src/lib/auth.ts`.

**Middleware**

- **FR-023**: `middleware.ts` at the repository root MUST protect all `/dashboard/*` routes by redirecting unauthenticated requests to `/login`.
- **FR-024**: `middleware.ts` MUST redirect authenticated users visiting `/login` or `/register` to `/dashboard`.
- **FR-025**: `middleware.ts` MUST allow all `/api/auth/*` requests through without any authentication check.
- **FR-026**: `middleware.ts` MUST use `verifyToken` (via `jose`) so it is compatible with the Next.js Edge runtime.

**Environment Configuration**

- **FR-027**: `.env` MUST contain exactly these keys: `DATABASE_URL=`, `JWT_SECRET=`, `JWT_EXPIRES_IN=7d`, `PORT=3000`, `NODE_ENV=development`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
- **FR-028**: `.env.example` MUST contain the same keys (with the same default values) and MUST be committed to version control.
- **FR-029**: `.env` MUST be listed in `.gitignore` and MUST NOT be committed to version control.

**Dependencies**

- **FR-030**: The `jose` library MUST be installed for JWT operations (Edge-runtime compatible).
- **FR-031**: `bcryptjs` (or `bcrypt`) MUST be installed for password hashing (used by future auth feature).
- **FR-032**: TanStack Query, Axios, and any client-side data-fetching library MUST NOT be installed.

### Key Entities

- **User**: Represents an account holder. Fields: `id`, `name`, `email` (unique), `password` (hashed), `createdAt`, `updatedAt`.
- **Expense**: A financial outflow record. Fields: `id`, `title`, `amount`, `category`, `account`, `date`, `notes` (optional), `tags`, `recurring`, `userId`, `createdAt`, `updatedAt`.
- **Income**: A financial inflow record. Fields: `id`, `title`, `amount`, `source`, `account`, `date`, `notes` (optional), `userId`, `createdAt`, `updatedAt`.
- **Transfer**: A movement between accounts. Fields: `id`, `fromAccount`, `toAccount`, `amount`, `date`, `note` (optional), `userId`, `createdAt`, `updatedAt`.
- **Budget**: A spending limit per category per month. Fields: `id`, `category`, `limit`, `month`, `userId`, `createdAt`, `updatedAt`.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: A developer can go from a fresh clone to a running development server in under 5 minutes following only the README.
- **SC-002**: `tsc --noEmit` completes with zero errors on the initial codebase.
- **SC-003**: `npm run lint` completes with zero errors or warnings on the initial codebase.
- **SC-004**: All 12 required `src/` directories exist and are preserved in version control.
- **SC-005**: All 5 data models generate a valid Prisma client with zero errors.
- **SC-006**: All 3 auth utility functions resolve to correct TypeScript signatures with no type errors.
- **SC-007**: The middleware correctly redirects 100% of unauthenticated requests away from protected routes in manual verification.

## Assumptions

- The target developer environment is Node.js 18+ and npm.
- MongoDB Atlas (or a local MongoDB instance) will be provided separately; `DATABASE_URL` is intentionally left empty in `.env`.
- `JWT_SECRET` will be populated by the developer before running auth features; the base setup does not validate its strength.
- The `bcryptjs` package is the preferred bcrypt variant (pure JavaScript, no native bindings required).
- Shadcn UI initialization is performed interactively once; subsequent component installs use `npx shadcn@latest add <component>`.
- The `(auth)/` and `(dashboard)/` route group directories are created as empty placeholders — their contents are implemented by feature-specific specs.
- No database seed data or migration scripts are required for this setup spec.

## Clarifications

### Session 2026-06-09

- Q: Which JWT library should be used for token signing and verification? → A: `jose` (not `jsonwebtoken`) — required for Next.js Edge runtime compatibility in `middleware.ts`.
- Q: What are the exact exported function signatures from `src/lib/auth.ts`? → A: `signToken(payload: JwtPayload): Promise<string>`, `verifyToken(token: string): Promise<JwtPayload | null>`, `getSession(): Promise<JwtPayload | null>` — `getSession` reads from `next/headers` cookies and is server-only.
- Q: What exact environment variable keys are required? → A: `DATABASE_URL=`, `JWT_SECRET=`, `JWT_EXPIRES_IN=7d`, `PORT=3000`, `NODE_ENV=development`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`.
- Q: What should `app/page.tsx` contain? → A: Only a redirect to `/dashboard` — no landing page, no content, no layout.
- Q: What is the middleware routing behaviour? → A: Protect `/dashboard/*` (redirect to `/login` if invalid token); allow `/api/auth/*` through without auth; redirect `/login` and `/register` to `/dashboard` if token is valid.
- Q: What should `tsconfig.json` contain? → A: `strict: true` and path alias `@/*` → `src/*`.
- Q: Are client-side data-fetching libraries permitted? → A: No — TanStack Query, Axios, and any client-side data-fetching library MUST NOT be installed.
