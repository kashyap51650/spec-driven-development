# Expense Tracker

A personal finance management app built with **Next.js 16**, **TypeScript**, **Prisma**, and **MongoDB**. This project is developed using the **OpenSpec** spec-driven workflow — a way of building features by writing a proposal, design, and tasks before any code is written.

---

## What is OpenSpec?

OpenSpec is a spec-driven development workflow that uses AI (Claude Code) to help you think through, plan, and implement features in a structured way. Instead of jumping straight into code, you first create a set of planning artifacts:

| Artifact      | What it contains                              |
| ------------- | --------------------------------------------- |
| `proposal.md` | What you're building and why                  |
| `design.md`   | How you'll build it (architecture, decisions) |
| `tasks.md`    | Concrete implementation steps as checkboxes   |

Once those are written, you run `/opsx:apply` and Claude works through the tasks one by one.

### The Full Loop

```
Explore an idea         →  /opsx:explore
Propose + plan it       →  /opsx:propose <name>
Implement it            →  /opsx:apply <name>
Sync specs to main      →  /opsx:sync <name>
Archive when done       →  /opsx:archive <name>
```

### How a change is structured

```
openspec/
└── changes/
    └── add-budget-alerts/       ← one directory per change
        ├── .openspec.yaml
        ├── proposal.md
        ├── design.md
        ├── tasks.md
        └── specs/               ← delta specs (optional)
            └── budgets/
                └── spec.md
```

Delta specs record what requirements changed during this feature. When you run `/opsx:sync`, they get merged into the main specs at `openspec/specs/`.

---

## Project Overview

Track income, expenses, transfers, and budgets with a clean dashboard. Built as a portfolio project showcasing modern full-stack patterns.

**Features:**

- Auth (register, login, logout, JWT via cookies)
- Dashboard with spending summaries and charts
- Expense management (create, edit, delete, filter, search)
- Income management (create, edit, delete)

---

## Tech Stack

| Layer    | Tools                                                                     |
| -------- | ------------------------------------------------------------------------- |
| Frontend | Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS v4, Shadcn UI |
| Forms    | React Hook Form + Zod                                                     |
| Backend  | Next.js Server Actions, Prisma ORM                                        |
| Database | MongoDB                                                                   |
| Auth     | JWT (stored in cookies), bcrypt                                           |
| Charts   | Recharts                                                                  |

---

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. Generate Prisma client

```bash
npx prisma generate
```

### 4. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Project Structure

```
expense-tracker/
├── src/
│   ├── app/
│   │   ├── (auth)/              # login, register pages
│   │   └── (dashboard)/         # protected dashboard pages
│   ├── actions/                 # Next.js Server Actions
│   ├── features/                # feature-scoped components
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── expenses/
│   │   └── income/
│   ├── server/
│   │   ├── repositories/        # database access only
│   │   ├── services/            # business logic
│   │   └── validations/         # Zod schemas for server input
│   ├── components/
│   │   ├── ui/                  # Shadcn components
│   │   └── shared/              # reusable app components
│   ├── types/                   # TypeScript interfaces
│   ├── constants/               # shared constants
│   ├── utils/                   # formatCurrency, formatDate
│   └── lib/                     # prisma client, auth helpers
├── prisma/
│   └── schema.prisma            # MongoDB models
├── openspec/                    # planning artifacts live here
│   ├── config.yaml
│   ├── changes/                 # active changes
│   └── specs/                   # main (authoritative) specs
└── project.md                   # project guidelines for AI
```

### Data flow

```
Server Action (src/actions/)
  → Service (src/server/services/)
    → Repository (src/server/repositories/)
      → Prisma → MongoDB
```

Actions and services handle validation and business logic. Repositories only touch the database.

---

## Database Models

Defined in [prisma/schema.prisma](prisma/schema.prisma):

- `User` — email + hashed password
- `Expense` — title, amount, category, account, date, tags, recurring flag
- `Income` — title, amount, source, account, date

---

## Working on a Feature with OpenSpec

### Start by exploring

Before writing any code, think the problem through:

```
/opsx:explore What should the budget alerts feature do?
```

Claude will ask questions, investigate the codebase, and help clarify requirements. No code is written in this step.

### Create a proposal

Once you know what you want:

```
/opsx:propose add-budget-alerts
```

Claude will create the change directory and generate `proposal.md`, `design.md`, and `tasks.md` for you. Review and edit them before moving on.

### Implement

```
/opsx:apply add-budget-alerts
```

Claude reads the planning artifacts and works through the task checklist, marking each task `[x]` as it completes. You can interrupt and redirect at any point.

### Sync and archive

After implementation is complete:

```
/opsx:sync add-budget-alerts    # merge delta specs into main specs
/opsx:archive add-budget-alerts # move change to archive/
```

---

## Code Conventions

- **TypeScript strict mode** — no `any`, use `unknown` or proper interfaces
- **Server Components by default** — add `"use client"` only when needed (hooks, event handlers)
- **One component per file**, max 200 lines
- **Naming**: PascalCase for components, `useX` for hooks, camelCase for utils
- **API responses** always follow `{ success, data, message }` shape
- **Forms** always use React Hook Form + Zod

See [project.md](../project.md) for the full guidelines.

---

## Key Files

| File                                            | Purpose                                   |
| ----------------------------------------------- | ----------------------------------------- |
| [project.md](../project.md)                     | Full project guidelines (read this first) |
| [prisma/schema.prisma](prisma/schema.prisma)    | Database schema                           |
| [src/lib/auth.ts](src/lib/auth.ts)              | JWT sign/verify helpers                   |
| [src/lib/prisma.ts](src/lib/prisma.ts)          | Prisma client singleton                   |
| [openspec/config.yaml](../openspec/config.yaml) | OpenSpec configuration                    |
