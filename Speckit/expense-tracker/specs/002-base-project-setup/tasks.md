---
description: "Task list for Base Project Setup"
---

# Tasks: Base Project Setup

**Input**: Design documents from `/specs/002-base-project-setup/`

**Prerequisites**: plan.md ✅ | spec.md ✅ | research.md ✅ | data-model.md ✅ | contracts/auth-utilities.md ✅ | quickstart.md ✅

**Tests**: Not requested in spec — no test tasks generated.

**Organization**: Tasks are grouped by user story (US1–US4) to enable independent implementation and validation of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)
- All file paths are relative to the repository root

---

## Phase 1: Setup (Project Initialization)

**Purpose**: Bootstrap the Next.js project, install dependencies, and apply baseline configuration. All subsequent phases depend on this phase completing successfully.

- [ ] T001 Initialize Next.js 15 App Router project with TypeScript using `npx create-next-app@latest` — select TypeScript, ESLint, Tailwind, App Router, no src/ (will be created manually), no import alias during wizard
- [ ] T002 [P] Configure `tsconfig.json` with `"strict": true` and path alias `"@/*": ["./src/*"]` under `compilerOptions.paths`
- [ ] T003 [P] Verify `next.config.ts` is minimal with no experimental flags — remove any flags added by the wizard beyond `reactStrictMode`
- [ ] T004 [P] Install runtime dependencies: `npm install jose bcryptjs` and dev types `npm install -D @types/bcryptjs`
- [ ] T005 [P] Initialize Prisma with MongoDB provider: `npx prisma init --datasource-provider mongodb` — produces `prisma/schema.prisma` and updates `.env`

**Checkpoint**: Next.js project boots — `npm run dev` starts without crashing

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Environment files, gitignore rules, and Shadcn initialization must be complete before any user story work begins. These are cross-cutting and cannot be deferred.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T006 Create `.env` at repository root with exactly these six keys: `DATABASE_URL=`, `JWT_SECRET=`, `JWT_EXPIRES_IN=7d`, `PORT=3000`, `NODE_ENV=development`, `NEXT_PUBLIC_APP_URL=http://localhost:3000`
- [ ] T007 Create `.env.example` at repository root with the same six keys and the same default values — this file MUST be committed to version control
- [ ] T008 Ensure `.env` is listed in `.gitignore` (it may already be present from `create-next-app`; verify and add if missing)
- [ ] T009 Initialize Shadcn UI: run `npx shadcn@latest init` and select style = **default**, base colour = **neutral**, CSS variables = **yes** — this creates `components.json` and updates `tailwind.config.ts` and `globals.css`

**Checkpoint**: Foundation ready — all user stories can now proceed in the order below

---

## Phase 3: User Story 1 — Running Project with Zero Errors (Priority: P1) 🎯 MVP

**Goal**: The project compiles and runs cleanly. `tsc --noEmit` and `npm run lint` both exit with code 0. Visiting `/` redirects to `/dashboard`.

**Independent Test**: Run `npm install && npm run dev`, open `http://localhost:3000` and confirm redirect to `/dashboard`. Stop the server and run `npx tsc --noEmit` and `npm run lint` — both must exit with code 0.

### Implementation for User Story 1

- [ ] T010 [US1] Create `src/app/layout.tsx` root layout with minimal HTML shell (`<html lang="en"><body>{children}</body></html>`) — required by App Router before any page can render
- [ ] T011 [US1] Create `src/app/page.tsx` containing only `import { redirect } from 'next/navigation'; export default function Home() { redirect('/dashboard'); }` — no JSX content, no layout, no UI (FR-005)
- [ ] T012 [US1] Create `src/app/(auth)/` route group directory with `.gitkeep` placeholder — App Router requires the directory to exist for the group to be recognized
- [ ] T013 [US1] Create `src/app/(dashboard)/` route group directory with `.gitkeep` placeholder — required for the authenticated layout group
- [ ] T014 [US1] Validate zero TypeScript errors: run `npx tsc --noEmit` — fix any errors reported before proceeding
- [ ] T015 [US1] Validate zero ESLint errors: run `npm run lint` — fix any warnings or errors reported before proceeding

**Checkpoint**: User Story 1 fully functional — `tsc --noEmit` and `npm run lint` exit with code 0; root URL redirects to `/dashboard`

---

## Phase 4: User Story 2 — Navigable Project Structure (Priority: P2)

**Goal**: All 12 required architecture-layer directories under `src/` exist with `.gitkeep` files, enforcing the constitution's layering conventions from day one.

**Independent Test**: Inspect the repository without running the app — run `ls src/types src/constants src/server/validations src/server/repositories src/server/services src/data src/actions src/features src/components/ui src/components/shared src/lib src/utils` and confirm no "No such file or directory" errors. Run `find src -name '.gitkeep'` and confirm one result per empty directory.

### Implementation for User Story 2

- [ ] T016 [P] [US2] Create `src/types/.gitkeep` — directory for shared TypeScript interfaces and types
- [ ] T017 [P] [US2] Create `src/constants/.gitkeep` — directory for app-wide constants
- [ ] T018 [P] [US2] Create `src/server/validations/.gitkeep` — directory for Zod schemas
- [ ] T019 [P] [US2] Create `src/server/repositories/.gitkeep` — directory for Prisma query functions (userId-scoped)
- [ ] T020 [P] [US2] Create `src/server/services/.gitkeep` — directory for business logic layer
- [ ] T021 [P] [US2] Create `src/data/.gitkeep` — directory for server-only data read functions (`get*` prefix)
- [ ] T022 [P] [US2] Create `src/actions/.gitkeep` — directory for Server Actions (`.actions.ts` suffix)
- [ ] T023 [P] [US2] Create `src/features/.gitkeep` — directory for feature-specific co-located components
- [ ] T024 [P] [US2] Create `src/components/shared/.gitkeep` — directory for reusable non-Shadcn components (`src/components/ui/` is populated by Shadcn CLI — no `.gitkeep` needed there)
- [ ] T025 [P] [US2] Create `src/utils/.gitkeep` — directory for shared formatting utilities (currency, date)
- [ ] T026 [US2] Create `src/lib/.gitkeep` — directory for core library files; will be replaced by actual files in US4 but must exist now for git tracking

**Checkpoint**: User Story 2 fully functional — all 12 `src/` directories exist and `find src -name '.gitkeep'` confirms each empty directory is preserved

---

## Phase 5: User Story 3 — Database Schema Ready (Priority: P3)

**Goal**: `prisma/schema.prisma` defines all five models with correct field types, relations, and MongoDB ObjectId conventions. `npx prisma generate` completes with zero errors.

**Independent Test**: With `DATABASE_URL` set in `.env`, run `npx prisma generate` — confirm it completes with "Generated Prisma Client" and zero errors. Run `grep -E "^model " prisma/schema.prisma` and confirm all five models appear.

### Implementation for User Story 3

- [ ] T027 [US3] Write `prisma/schema.prisma` — add the `generator client` and `datasource db` (MongoDB) blocks, then define all five models exactly as specified in `specs/002-base-project-setup/data-model.md`: `User` (with `@unique` email, relations to all four child models), `Expense` (with `recurring @default(false)`, `tags String[]`, `notes String?`), `Income` (with `notes String?`), `Transfer` (with `note String?` — singular), `Budget` (with `category`, `limit Float`, `month String`). All IDs MUST use `@id @default(auto()) @map("_id") @db.ObjectId`
- [ ] T028 [US3] Create `src/lib/prisma.ts` — export a PrismaClient singleton using the `globalThis` pattern to prevent multiple instances during Next.js hot-reload in development: `const globalForPrisma = globalThis as unknown as { prisma: PrismaClient }; export const db = globalForPrisma.prisma ?? new PrismaClient(); if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db;`
- [ ] T029 [US3] Validate Prisma client generation: run `npx prisma generate` and confirm zero errors — this also confirms `DATABASE_URL` env key is wired correctly

**Checkpoint**: User Story 3 fully functional — `npx prisma generate` exits with zero errors; all five models appear in the Prisma schema

---

## Phase 6: User Story 4 — Auth Utilities and Route Protection Ready (Priority: P4)

**Goal**: `src/lib/auth.ts` exports `JwtPayload`, `signToken`, `verifyToken`, and `getSession` with exact signatures from `contracts/auth-utilities.md`. `middleware.ts` protects `/dashboard/*`, bounces authenticated users from `/login` and `/register`, and passes `/api/auth/*` through.

**Independent Test**: TypeScript resolves all three function imports with correct signatures: `signToken(payload: JwtPayload): Promise<string>`, `verifyToken(token: string): Promise<JwtPayload | null>`, `getSession(): Promise<JwtPayload | null>`. Run `npx tsc --noEmit` — zero errors.

### Implementation for User Story 4

- [ ] T030 [US4] Create `src/lib/auth.ts` — implement and export: (1) `JwtPayload` interface with exactly `{ userId: string; email: string }`, (2) `signToken(payload: JwtPayload): Promise<string>` using `jose` `SignJWT` with HS256 algorithm, `JWT_SECRET` env var (throw if missing), and `JWT_EXPIRES_IN` expiry, (3) `verifyToken(token: string): Promise<JwtPayload | null>` using `jose` `jwtVerify` — wrap entire body in try/catch and return `null` on ANY error — NEVER throws, (4) `getSession(): Promise<JwtPayload | null>` reading the `token` cookie from `next/headers` — wrap in try/catch, return `null` on any failure — server-only, NEVER throws
- [ ] T031 [US4] Create `middleware.ts` at repository root — implement Edge-compatible route protection using `verifyToken` (jose is Edge-compatible): protect `/dashboard/:path*` (redirect unauthenticated requests to `/login`); redirect authenticated users visiting `/login` or `/register` to `/dashboard`; pass all `/api/auth/:path*` requests through without auth check; pass everything else through. Export `config` with appropriate `matcher` to apply middleware. Token is read from the `token` cookie.

**Checkpoint**: User Story 4 fully functional — TypeScript resolves all auth function signatures with zero errors; middleware routing table matches `contracts/auth-utilities.md`

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Final validation, environment safety, and developer experience hardening.

- [ ] T032 [P] Add `src/utils/currency.ts` with a placeholder `formatCurrency` function using `Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' })` — satisfies Constitution VI and prevents ad-hoc formatting in future features
- [ ] T033 [P] Add `src/utils/date.ts` with a placeholder `formatDate` function using `Intl.DateTimeFormat` for `MMM dd, yyyy` output — satisfies Constitution VI
- [ ] T034 Remove `.gitkeep` from `src/lib/` now that `prisma.ts` and `auth.ts` populate the directory — confirm `src/lib/` still appears in `git status` after removal
- [ ] T035 Run full validation per `quickstart.md` Scenarios 1–7: `tsc --noEmit` (zero errors), `npm run lint` (zero errors), directory structure check, root redirect, Prisma generate, auth signature check, middleware routing, and env file git status

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Phase 2 — can start after Foundational
- **US2 (Phase 4)**: Depends on Phase 2 — can start after Foundational (independent of US1)
- **US3 (Phase 5)**: Depends on Phase 2 (Prisma init from T005) — can start after Foundational (independent of US1, US2)
- **US4 (Phase 6)**: Depends on Phase 2 (jose installed in T004) and US3 (src/lib/ dir from T026) — can start after US3
- **Polish (Phase 7)**: Depends on all user story phases completing

### User Story Dependencies

- **US1 (P1)**: Starts after Phase 2 — independent of US2, US3, US4
- **US2 (P2)**: Starts after Phase 2 — independent of US1, US3, US4
- **US3 (P3)**: Starts after Phase 2 — independent of US1, US2; US4 depends on US3 completing
- **US4 (P4)**: Starts after US3 (needs src/lib/ dir + Prisma types)

### Within Each User Story

- US2 tasks T016–T025: fully parallel (different files, different directories)
- US4 tasks T030 and T031: sequential — middleware imports `verifyToken` from auth.ts

### Parallel Opportunities

- Phase 1: T002, T003, T004, T005 can run in parallel after T001
- Phase 2: T006, T007, T008 can run in parallel (T009 must follow T008)
- Phase 3 and Phase 4: US1 and US2 can execute concurrently after Phase 2
- Phase 4: all T016–T025 run in parallel
- Phase 7: T032, T033 run in parallel

---

## Parallel Example: User Story 2

```bash
# All directory scaffolding tasks for US2 can run concurrently:
Task T016: Create src/types/.gitkeep
Task T017: Create src/constants/.gitkeep
Task T018: Create src/server/validations/.gitkeep
Task T019: Create src/server/repositories/.gitkeep
Task T020: Create src/server/services/.gitkeep
Task T021: Create src/data/.gitkeep
Task T022: Create src/actions/.gitkeep
Task T023: Create src/features/.gitkeep
Task T024: Create src/components/shared/.gitkeep
Task T025: Create src/utils/.gitkeep
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T005)
2. Complete Phase 2: Foundational (T006–T009)
3. Complete Phase 3: US1 (T010–T015)
4. **STOP and VALIDATE**: `tsc --noEmit` and `npm run lint` both exit 0; root URL redirects to `/dashboard`
5. The project is runnable — all downstream features can now be scaffolded

### Incremental Delivery

1. Setup + Foundational → Project starts
2. US1 → Zero-error baseline confirmed (MVP)
3. US2 → Architecture directories in place → All future features have correct homes
4. US3 → Prisma schema defined → Data models ready for all features
5. US4 → Auth utilities ready → Auth feature can be built immediately after
6. Polish → Quickstart validation complete

### Parallel Team Strategy

With multiple contributors after Phase 2 completes:
- Developer A: US1 (T010–T015)
- Developer B: US2 (T016–T026, all parallelizable)
- Developer C: US3 (T027–T029)
- Developer C continues to US4 (T030–T031) after US3

---

## Notes

- `[P]` tasks operate on different files with no shared state — safe to parallelize
- `[USn]` labels trace each task back to its acceptance scenario in `spec.md`
- Tests are NOT included — the spec does not request TDD; acceptance is via `tsc --noEmit`, `npm run lint`, `npx prisma generate`, and manual quickstart validation
- Shadcn UI (`src/components/ui/`) is populated by the CLI (T009) — do NOT add `.gitkeep` or manual files to this directory
- `src/lib/prisma.ts` MUST use the `globalThis` singleton pattern (FR-018) — `new PrismaClient()` outside this file is prohibited by the constitution
- `verifyToken` and `getSession` MUST NEVER throw — wrap all logic in try/catch and return `null` on any error (FR-020, FR-021, Constitution VII)
- Commit after each phase checkpoint to create a clean git history
