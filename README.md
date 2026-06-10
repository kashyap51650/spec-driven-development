# Spec Driven Development — Framework Comparison

This repository contains two parallel demos of **Spec Driven Development (SDD)** applied to the same **Expense Tracker** application. Each demo uses a different SDD framework — **OpenSpec** and **Speckit** — built on top of Claude Code.

---

## What is Spec Driven Development?

Spec Driven Development is a workflow where features are **specified before they are coded**. Instead of jumping directly from a feature idea to implementation, the developer first produces structured planning artifacts — proposals, designs, and tasks — and the AI agent implements against those artifacts. This makes AI-assisted coding more predictable, reviewable, and aligned with intent.

The core loop:

```
Idea → Proposal → Design → Tasks → Implementation → Archive
```

Each step is explicit, file-backed, and can be reviewed or edited by humans before the next step begins.

---

## The Demo App: Expense Tracker

Both frameworks are applied to the same **Expense Tracker** — a full-stack personal finance application built with:

| Layer         | Technology               |
| ------------- | ------------------------ |
| Framework     | Next.js 15 (App Router)  |
| Language      | TypeScript (strict mode) |
| Database      | MongoDB via Prisma ORM   |
| Auth          | JWT in httpOnly cookies  |
| UI            | Shadcn UI + Tailwind CSS |
| Forms         | React Hook Form + Zod    |
| Data fetching | TanStack Query           |

### App Features

- **Authentication** — Register, Login, Logout with JWT middleware-protected routes
- **App Shell** — Desktop sidebar + mobile header with slide-in sheet, navigation, user menu
- **Expense Management** — Create, update, delete, filter, search, sort expenses with categories and tags
- **Income Management** — Track income sources with account linkage
- **Dashboard** — Net savings, monthly summary, category breakdown, recent transactions

## Framework 1: OpenSpec

**Location:** [`OpenSpec/`](OpenSpec/)

OpenSpec is a CLI-backed SDD framework. It manages artifacts through a dedicated `openspec/` planning directory and exposes workflow commands via the `openspec` CLI. Artifacts are created, validated, and archived through CLI commands; Claude Code consumes those artifacts to implement changes.

### How It Works

```
openspec new change "<name>"          # scaffold a change directory
openspec instructions <artifact> ...  # get AI instructions for an artifact
openspec status --change "<name>"     # check artifact completion
openspec list                         # list all active changes
```

Artifacts for each change live at:

```
openspec/changes/<change-name>/
├── proposal.md     # what & why
├── design.md       # how (architecture, data flow, components)
└── tasks.md        # step-by-step implementation checklist
```

Completed changes are archived to:

```
openspec/changes/archive/<date>-<change-name>/
```

### Slash Commands (Claude Code)

| Command         | Description                                                  |
| --------------- | ------------------------------------------------------------ |
| `/opsx:propose` | Describe what to build — generates all artifacts in one step |
| `/opsx:apply`   | Implement tasks from the current change                      |
| `/opsx:explore` | Think through a problem before creating a change             |
| `/opsx:sync`    | Sync delta specs from a change into main specs               |
| `/opsx:archive` | Archive a completed change                                   |

## Framework 2: Speckit

**Location:** [`Speckit/`](Speckit/)

Speckit is a file-based SDD framework built entirely around Claude Code slash commands and a `.specify/` project directory. There is no external CLI — all workflow steps are driven through Claude Code skills. Speckit produces richer, more formal specification artifacts and enforces a strict separation between product-level specs (the _what_) and technical planning (the _how_).

### How It Works

Speckit separates concerns across three explicit phases:

1. **Specify** — write a product specification (no implementation details, written for stakeholders)
2. **Plan** — generate a technical design and implementation plan from the spec
3. **Tasks** — break the plan into dependency-ordered, actionable tasks

Each feature lives in:

```
specs/<NNN>-<feature-name>/
├── spec.md          # product specification (business language, no tech details)
├── plan.md          # implementation design (architecture, data models, APIs)
├── tasks.md         # ordered task list with checkboxes
└── checklists/
    └── requirements.md   # auto-generated spec quality checklist
```

Speckit also manages a **project constitution** at `.specify/memory/constitution.md` — a set of principles and governance rules that every artifact must respect.

### Slash Commands (Claude Code)

| Command                 | Description                                                      |
| ----------------------- | ---------------------------------------------------------------- |
| `/speckit-specify`      | Write a product spec from a natural language description         |
| `/speckit-clarify`      | Ask up to 5 targeted questions to sharpen an underspecified spec |
| `/speckit-plan`         | Generate a technical design and plan from the spec               |
| `/speckit-tasks`        | Generate dependency-ordered tasks from the plan                  |
| `/speckit-implement`    | Execute all tasks in tasks.md                                    |
| `/speckit-analyze`      | Cross-artifact consistency and quality check                     |
| `/speckit-checklist`    | Generate a custom checklist for the current feature              |
| `/speckit-constitution` | Create or update the project constitution                        |

### Git Integration

Speckit includes optional Git extension hooks that automate branch management:

| Command                   | Description                                   |
| ------------------------- | --------------------------------------------- |
| `/speckit-git-feature`    | Create a sequentially numbered feature branch |
| `/speckit-git-commit`     | Auto-commit after a Speckit command completes |
| `/speckit-git-validate`   | Validate branch naming conventions            |
| `/speckit-git-initialize` | Initialize repo with an initial commit        |
| `/speckit-git-remote`     | Detect and configure a GitHub remote          |

Feature branches follow sequential numbering:

```
001-user-auth
002-base-project-setup
003-user-auth-flow
004-app-shell-nav
005-expense-income-modules
006-dashboard-overview
```

### Spec Quality Enforcement

Before proceeding to planning, Speckit validates the spec against a quality checklist:

- No implementation details (languages, frameworks, APIs) in the spec
- Focused on user value and business needs
- All requirements are testable and unambiguous
- Success criteria are measurable and technology-agnostic
- Maximum 3 `[NEEDS CLARIFICATION]` markers allowed
- Edge cases and scope boundaries are documented

---

## Framework Comparison

| Dimension                     | OpenSpec                                   | Speckit                                                  |
| ----------------------------- | ------------------------------------------ | -------------------------------------------------------- |
| **Backing mechanism**         | External CLI (`openspec`)                  | Claude Code skills only                                  |
| **Artifact richness**         | Proposal + Design + Tasks                  | Spec + Plan + Tasks + Checklists                         |
| **Spec philosophy**           | Combined what/how in design.md             | Strict separation: product spec vs. technical plan       |
| **Quality gates**             | CLI schema validation                      | Built-in spec quality checklist with auto-validation     |
| **Git integration**           | Manual                                     | Optional hooks for branch creation, commit, validation   |
| **Constitution / principles** | `config.yaml` context block                | `.specify/memory/constitution.md` (full governance doc)  |
| **Clarification workflow**    | Ask before creating artifacts              | Dedicated `/speckit-clarify` command with structured Q&A |
| **Archive workflow**          | `openspec archive` CLI command             | Feature directories remain; branch merged                |
| **Best for**                  | Teams that want CLI-managed artifact state | Teams that want AI-native, file-only workflows           |

---

## Getting Started

### OpenSpec Demo

```bash
cd OpenSpec/expense-tracker
npm install
cp .env.example .env   # add DATABASE_URL and JWT_SECRET

# Then in Claude Code, propose a new change:
# /opsx:propose add user profile page

# Implement the change:
# /opsx:apply
```

### Speckit Demo

```bash
cd Speckit/expense-tracker
npm install
cp .env.example .env   # add DATABASE_URL and JWT_SECRET

# Then in Claude Code, specify a new feature:
# /speckit-specify add a recurring transactions page

# Plan the feature:
# /speckit-plan

# Generate tasks:
# /speckit-tasks

# Implement:
# /speckit-implement
```

### Environment Variables

Both apps require the same environment variables:

```env
DATABASE_URL=mongodb+srv://...
JWT_SECRET=your-secret-key
JWT_EXPIRES_IN=7d
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---
