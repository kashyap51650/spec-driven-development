# Proposal: Initialize Expense Tracker Project

What: Bootstrap a new Next.js (App Router) TypeScript project named "expense-tracker" with base config, tooling, and repository scaffolding for a full-stack app using MongoDB/Prisma.

Why: Provide a solid, type-safe foundation (Next.js + TypeScript + Tailwind + Shadcn UI + Prisma + JWT auth) so feature work can begin from a standard, tested setup without repetitive configuration.

Scope (this change):

- Create project scaffold instructions and configuration files only.
- Do NOT implement feature pages, API routes, or UI components yet.
- Ensure TypeScript, ESLint, Tailwind, Prisma, and Shadcn UI are configured.

Deliverables:

- `design.md` — Implementation details and file snippets.
- `tasks.md` — Step-by-step commands to run to initialize the repo.

Acceptance criteria:

- Repository created using `npx create-next-app@latest` with the exact CLI flags in `tasks.md`.
- Dependencies installed as listed in `tasks.md`.
- `prisma/schema.prisma` updated for MongoDB with required models.
- `src/lib/prisma.ts` and `src/lib/auth.ts` added as described in `design.md`.
- `.env` and `.env.example` created and `.gitignore` updated.
