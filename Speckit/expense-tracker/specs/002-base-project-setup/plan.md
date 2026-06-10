# Implementation Plan: Base Project Setup

**Branch**: `002-base-project-setup` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/002-base-project-setup/spec.md`

## Summary

Bootstrap a production-ready Next.js 15 App Router project with TypeScript strict mode, Prisma/MongoDB, Shadcn UI, and JWT authentication utilities — establishing the zero-error baseline on which every downstream feature will be built.

## Technical Context

**Language/Version**: TypeScript 5.x, Node.js 18+, Next.js 15 (App Router only)

**Primary Dependencies**: Prisma 6.x + @prisma/client (MongoDB), jose (JWT, Edge-compatible), bcryptjs (password hashing), react-hook-form + zod, Shadcn UI (CLI-managed), lucide-react, recharts

**Storage**: MongoDB via Prisma ORM; client singleton in `src/lib/prisma.ts`

**Testing**: `tsc --noEmit` (zero TypeScript errors) + `npm run lint` (zero ESLint errors); no additional test framework required for this setup spec

**Target Platform**: Node.js 18+ server runtime; `middleware.ts` targets the Next.js Edge runtime

**Project Type**: Full-stack web application (Next.js App Router, server-first)

**Performance Goals**: Fresh clone → running dev server in under 5 minutes (SC-001); no explicit throughput targets for setup phase

**Constraints**: Zero TypeScript errors, zero ESLint errors, no TanStack Query / Axios / client-side data-fetching libraries

**Scale/Scope**: Single-developer setup baseline; all architecture directories created to enforce team-wide conventions from day one

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Applicable? | Status | Notes |
|-----------|------------|--------|-------|
| I. Server-First Data Access | No | ✅ PASS | No data access in this spec; `src/data/` directory created as placeholder |
| II. Strict Architecture Layering | Partial | ✅ PASS | Directory scaffold enforces the call chain from day one; no cross-layer imports yet |
| III. TypeScript Discipline | Yes | ✅ PASS | `strict: true` required (FR-002); all utility signatures explicitly typed |
| IV. Consistent Response Contract | No | ✅ PASS | No Server Actions or data functions in this spec |
| V. UI Component Integrity | Yes | ✅ PASS | Shadcn initialized via CLI (FR-009); no manual component files (FR-010) |
| VI. Formatting & Localisation | No | ✅ PASS | No UI rendering in this spec |
| VII. Authentication & Session Management | Yes | ✅ PASS | jose JWT (FR-030), httpOnly cookie pattern, bcryptjs (FR-031), verifyToken never throws (FR-020) |
| VIII. UI Component & Interaction Patterns | No | ✅ PASS | No UI components in this spec |

**Result**: All applicable gates pass. No complexity waivers required.

## Project Structure

### Documentation (this feature)

```text
specs/002-base-project-setup/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── auth-utilities.md
└── tasks.md             # Phase 2 output (/speckit-tasks — NOT created by /speckit-plan)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (auth)/          # Route group for unauthenticated pages (login, register)
│   ├── (dashboard)/     # Route group for authenticated pages
│   └── page.tsx         # Root redirect → /dashboard only
├── types/               # Shared TypeScript interfaces and types
├── constants/           # App-wide constants
├── server/
│   ├── validations/     # Zod schemas
│   ├── repositories/    # Prisma query functions (userId-scoped)
│   └── services/        # Business logic layer
├── data/                # Server-only data read functions (get* prefix)
├── actions/             # Server Actions (.actions.ts suffix)
├── features/            # Feature-specific co-located components
├── components/
│   ├── ui/              # Shadcn CLI-managed components
│   └── shared/          # Reusable non-Shadcn components
├── lib/
│   ├── prisma.ts        # PrismaClient singleton
│   └── auth.ts          # signToken, verifyToken, getSession + JwtPayload
└── utils/               # Shared formatting utilities (currency, date)

prisma/
└── schema.prisma        # All 5 data models (User, Expense, Income, Transfer, Budget)

middleware.ts             # Edge-compatible route protection
.env                      # Local environment variables (gitignored)
.env.example              # Committed example with same keys
```

**Structure Decision**: Single Next.js project; App Router with route groups `(auth)/` and `(dashboard)/` for layout segregation. The `src/` layering mirrors the constitution's call chain (data → services → repositories → Prisma) as empty-but-named directories with `.gitkeep`.

## Complexity Tracking

> No constitution violations. Section left empty per instructions.
