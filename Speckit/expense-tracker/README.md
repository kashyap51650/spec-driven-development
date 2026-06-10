# Expense Tracker — SpecKit Demo Project

This project is a **living demonstration of SpecKit**, a spec-driven development workflow for Claude Code. It shows how to take a feature from a single English sentence all the way to production-ready code through a structured pipeline of AI-assisted artifacts.

If you want to learn how SpecKit works in a real codebase, you are in the right place.

---

## What is SpecKit?

SpecKit is a Claude Code skill set that enforces a "spec before code" discipline. Instead of describing what you want and immediately asking Claude to build it, SpecKit drives you through a sequence of artifacts — each one building on the last — so that by the time code is written, every decision is already documented and verified.

The workflow has six commands:

| Command | What it produces |
|---|---|
| `/speckit-specify` | A structured `spec.md` with user stories, acceptance scenarios, and constraints |
| `/speckit-plan` | A `plan.md` with architecture decisions, layering rules, and a phase-by-phase design |
| `/speckit-tasks` | A `tasks.md` with dependency-ordered, parallelism-annotated implementation tasks |
| `/speckit-implement` | Executes `tasks.md` — writes real code, one task at a time |
| `/speckit-clarify` | Asks up to 5 targeted questions to fill gaps in a spec before planning |
| `/speckit-checklist` | Generates a feature-specific QA checklist |

Each command reads the previous output. You cannot plan without a spec; you cannot generate tasks without a plan; you cannot implement without tasks.

---

## How this project demonstrates SpecKit

Every feature in this app was built with SpecKit. The `specs/` directory mirrors the feature history:

```
specs/
  002-base-project-setup/
  003-user-auth-flow/
  004-app-shell-nav/
  005-expense-income-modules/
  006-dashboard-overview/        ← most recent feature
    spec.md                      ← produced by /speckit-specify
    plan.md                      ← produced by /speckit-plan
    tasks.md                     ← produced by /speckit-tasks
    quickstart.md                ← manual validation scenarios
    research.md                  ← research notes feeding the plan
    data-model.md                ← data shape decisions
    checklists/                  ← produced by /speckit-checklist
    contracts/                   ← API/data contracts extracted from the plan
```

To understand the full SpecKit pipeline, read the artifacts for feature `006` in order:

1. [specs/006-dashboard-overview/spec.md](specs/006-dashboard-overview/spec.md) — the feature spec
2. [specs/006-dashboard-overview/plan.md](specs/006-dashboard-overview/plan.md) — the implementation plan
3. [specs/006-dashboard-overview/tasks.md](specs/006-dashboard-overview/tasks.md) — the task list Claude executed

---

## Learning SpecKit: a guided tour

### Step 1 — Read a real spec

Open [specs/006-dashboard-overview/spec.md](specs/006-dashboard-overview/spec.md).

Notice the structure:
- **User Stories** written in the "Given / When / Then" format. Each story has a priority (P1/P2) and an independent test description.
- **Acceptance Scenarios** that are concrete enough to verify manually without ambiguity.
- No implementation details — the spec describes *what the user experiences*, not *how the code works*.

This is what `/speckit-specify` produces from a plain English description.

### Step 2 — Read the plan that came from it

Open [specs/006-dashboard-overview/plan.md](specs/006-dashboard-overview/plan.md).

The plan adds the technical layer:
- A **Constitution Check** table — every architecture principle verified before any code is touched.
- A **Technical Context** block — stack, dependencies, storage, performance goals, constraints.
- A **Project Structure** section — exact file paths for every new file, decided upfront.
- Phase-by-phase implementation steps with precise instructions for Claude to follow.

The plan is the contract between the spec and the code. If something is not in the plan, it does not get built.

### Step 3 — Read the tasks that came from the plan

Open [specs/006-dashboard-overview/tasks.md](specs/006-dashboard-overview/tasks.md).

Tasks are atomic. Each one:
- References the exact file path to create or modify
- Notes whether it can run in parallel (`[P]`) or has a blocking dependency
- Maps back to a user story (`[US1]`, `[US2]`, etc.)
- Has a TypeScript gate checkpoint after each phase

`/speckit-implement` reads this file top-to-bottom and executes each task in order.

### Step 4 — Run the quickstart validation

Open [specs/006-dashboard-overview/quickstart.md](specs/006-dashboard-overview/quickstart.md).

This is the manual test script. It was generated alongside the spec and describes exactly what to click, what data to add, and what the expected result is. It corresponds directly to the acceptance scenarios in `spec.md`.

### Step 5 — Try it yourself

Pick any feature you want to add to this app and run through the pipeline:

```bash
# 1. Write your feature description in plain English, then run:
/speckit-specify

# 2. Review the spec, then run:
/speckit-clarify    # optional — fills gaps before planning

# 3. Generate the implementation plan:
/speckit-plan

# 4. Generate the task list:
/speckit-tasks

# 5. Let Claude implement it:
/speckit-implement
```

Each command writes its output into `specs/<feature-name>/` so the full paper trail is preserved.

---

## Project setup

This is a Next.js 16 app with MongoDB (via Prisma) and Shadcn UI components.

**Prerequisites**: Node.js 20+, a MongoDB instance, and a `.env` file with `DATABASE_URL` and `NEXTAUTH_SECRET`.

```bash
npm install
npx prisma generate
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Register an account, then add some income and expense records to see the dashboard populate.

---

## Project constitution

The project has a constitution — a set of architecture principles that every plan must verify before implementation begins. It governs things like:

- Where data fetching is allowed (server components only, never `useEffect`)
- How the code is layered (Server Component → `data/` → `services/` → `repositories/` → Prisma)
- How TypeScript is used (strict mode, no `any`, explicit return types)
- How UI components are added (Shadcn CLI only, never copy-pasted)

The constitution is what makes the Constitution Check table in each `plan.md` meaningful. SpecKit enforces it automatically during planning.

---

## Key things to notice while exploring

- Every `spec.md` has a **Status** field (`Draft` → `Clarified` → `Planned` → `Implemented`). This tracks where the feature is in the pipeline.
- Every `plan.md` references the spec it was generated from. Plans and specs stay in sync.
- Task IDs in `tasks.md` (T001, T002, …) are referenced in git commit messages so you can trace any line of code back to the task — and from there to the user story — that produced it.
- The `quickstart.md` validation scenarios map one-to-one to `spec.md` acceptance scenarios via requirement IDs (FR-001, SC-002, etc.). Nothing in the test script is invented after the fact.

---

## Further reading

- [SpecKit on GitHub](https://github.com/matangs/speckit) — the skill source and full documentation
- [Claude Code documentation](https://docs.anthropic.com/en/docs/claude-code) — how skills and slash commands work
