# Expense Tracker Project Guidelines

## Project Overview

Expense Tracker is a personal finance management application that helps users track income, expenses, transfers, budgets, and recurring transactions.

This project is intended as a portfolio project demonstrating:

- Next.js + TypeScript expertise
- Modern full-stack architecture
- API Routes with Next.js
- Prisma ORM integration
- MongoDB database design
- Clean code principles
- Scalable folder structure
- Professional UI/UX

---

# Tech Stack

## Full-Stack (Next.js)

- Next.js (App Router)
- TypeScript
- TanStack Query
- Tailwind CSS
- Shadcn UI
- React Hook Form
- Zod
- Axios

## Backend (Next.js API Routes)

- Next.js Route Handlers (`/app/api/`)
- TypeScript
- Prisma ORM
- MongoDB
- JWT Authentication
- bcrypt

---

# Project Structure

```txt
expense-tracker/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   │   └── page.tsx
│   │   ├── register/
│   │   │   └── page.tsx
│   │   ├── forgot-password/
│   │   │   └── page.tsx
│   │   └── reset-password/
│   │       └── page.tsx
│   ├── (dashboard)/
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx
│   │   ├── expenses/
│   │   │   └── page.tsx
│   │   ├── income/
│   │   │   └── page.tsx
│   │   ├── transfers/
│   │   │   └── page.tsx
│   │   └── budgets/
│   │       └── page.tsx
│   └── api/
│       ├── auth/
│       │   ├── register/
│       │   │   └── route.ts
│       │   ├── login/
│       │   │   └── route.ts
│       │   ├── logout/
│       │   │   └── route.ts
│       │   ├── forgot-password/
│       │   │   └── route.ts
│       │   └── reset-password/
│       │       └── route.ts
│       ├── expenses/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── income/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       ├── transfers/
│       │   ├── route.ts
│       │   └── [id]/
│       │       └── route.ts
│       └── budgets/
│           ├── route.ts
│           └── [id]/
│               └── route.ts
├── src/
│   ├── components/
│   │   ├── ui/
│   │   └── shared/
│   ├── features/
│   │   ├── auth/
│   │   ├── expenses/
│   │   ├── income/
│   │   ├── transfers/
│   │   ├── budgets/
│   │   └── dashboard/
│   ├── server/
│   │   ├── middleware/
│   │   ├── controllers/
│   │   ├── services/
│   │   ├── repositories/
│   │   └── validations/
│   ├── services/
│   ├── hooks/
│   ├── lib/
│   ├── types/
│   ├── constants/
│   └── utils/
├── prisma/
│   └── schema.prisma
├── public/
├── next.config.ts
└── middleware.ts
```

---

# Core Features

## Authentication

- Register
- Login
- Logout
- Forgot Password
- Reset Password
- JWT Authentication (via cookies / Next.js middleware)

---

## Dashboard

Display:

- Total Income
- Total Expenses
- Net Savings
- Monthly Spending
- Monthly Income
- Category Breakdown
- Recent Transactions
- Budget Progress

---

## Expense Management

Expense Fields:

- title
- amount
- category
- account
- date
- notes
- tags
- recurring

Actions:

- Create
- Update
- Delete
- Filter
- Search
- Sort

---

## Income Management

Income Fields:

- title
- amount
- source
- account
- date
- notes

Actions:

- Create
- Update
- Delete

---

## Transfer Management

Transfer Fields:

- fromAccount
- toAccount
- amount
- date
- note

Actions:

- Create
- Update
- Delete

---

## Budget Management

Fields:

- category
- limit
- month

Features:

- Budget Progress
- Budget Alerts
- Remaining Budget

---

## Recurring Transactions

Supported Frequencies:

- Daily
- Weekly
- Monthly
- Yearly

---

# TypeScript Rules

## Always Use Strict Mode

Never use:

```ts
any;
```

Use:

```ts
unknown;
```

or proper interfaces.

---

## Prefer Interfaces

```ts
interface Expense {
  id: string;
  title: string;
}
```

Avoid:

```ts
type Expense = {};
```

unless unions are required.

---

## Explicit Return Types

Required:

```ts
function calculateTotal(expenses: Expense[]): number {
  return 0;
}
```

---

# Next.js Standards

## App Router Only

Use the App Router (`/app` directory) exclusively. Do not use the Pages Router.

---

## Server vs Client Components

Default to Server Components. Add `"use client"` only when needed:

- Event handlers (onClick, onChange, etc.)
- Browser APIs
- React hooks (useState, useEffect, etc.)
- TanStack Query providers

```tsx
// Server Component (default)
export default async function ExpensesPage() {
  return <ExpenseList />;
}

// Client Component (only when necessary)
("use client");
export function ExpenseForm() {
  return <form />;
}
```

---

## Route Handlers (API)

Use Next.js Route Handlers in `/app/api/`. Follow the layered architecture:

```ts
// app/api/expenses/route.ts
import { NextRequest, NextResponse } from "next/server";
import { expenseController } from "@/server/controllers/expense.controller";

export async function GET(req: NextRequest) {
  return expenseController.getAll(req);
}

export async function POST(req: NextRequest) {
  return expenseController.create(req);
}
```

---

## Functional Components Only

Use:

```tsx
export function ExpenseCard() {
  return <div />;
}
```

Avoid class components.

---

## One Component Per File

Never define multiple exported components in a single file.

---

## Component Size

Maximum:

- 200 lines

Refactor when exceeded.

---

# Naming Conventions

## Components

```txt
ExpenseCard.tsx
BudgetProgress.tsx
IncomeTable.tsx
```

PascalCase.

---

## Hooks

```txt
useExpenses.ts
useCreateExpense.ts
useBudget.ts
```

Prefix with `use`.

---

## Utilities

```txt
formatCurrency.ts
calculateSavings.ts
```

camelCase.

---

## Route Handlers

```txt
app/api/expenses/route.ts
app/api/expenses/[id]/route.ts
```

---

# TanStack Query Standards

## Query Keys

Always use factories.

```ts
export const expenseKeys = {
  all: ["expenses"] as const,

  list: () => [...expenseKeys.all, "list"] as const,

  detail: (id: string) => [...expenseKeys.all, id] as const,
};
```

---

## API Calls

Keep API logic separate.

Bad:

```tsx
useQuery({
  queryFn: () => axios.get("/expenses"),
});
```

Good:

```ts
getExpenses();
```

inside service layer.

---

# Form Standards

Always use:

- React Hook Form
- Zod

Example:

```ts
const schema = z.object({
  title: z.string().min(1),
  amount: z.number().positive(),
});
```

---

# UI Standards

## Use Shadcn Components

Prefer:

- Card
- Table
- Dialog
- Drawer
- Form
- Dropdown Menu

before creating custom components.

---

## Responsive First

Support:

- Mobile
- Tablet
- Desktop

Minimum width:

```css
320px
```

---

# Backend Standards (Server Layer)

## Layered Architecture

Flow:

```txt
Route Handler (app/api/)
 → Controller (src/server/controllers/)
 → Service (src/server/services/)
 → Repository (src/server/repositories/)
 → Prisma
```

Route Handlers and Controllers must never contain business logic.

---

## Service Responsibilities

Services:

- Validation
- Business Rules
- Calculations

Repositories:

- Database Access Only

---

## Authentication via Middleware

Use Next.js `middleware.ts` at the root level to protect routes:

```ts
// middleware.ts
import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";

export function middleware(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/api/expenses/:path*"],
};
```

---

# API Standards

## REST Naming

Good:

```txt
GET    /api/expenses
POST   /api/expenses
PATCH  /api/expenses/:id
DELETE /api/expenses/:id
```

Avoid:

```txt
/api/getExpenses
/api/createExpense
```

---

## Response Format

Success:

```json
{
  "success": true,
  "data": {},
  "message": "Expense created successfully"
}
```

Error:

```json
{
  "success": false,
  "data": null,
  "message": "Expense not found"
}
```

---

# Prisma Standards

## Naming

Models:

```prisma
model Expense
model Budget
model Account
```

PascalCase.

Fields:

```prisma
createdAt
updatedAt
```

camelCase.

---

# MongoDB Standards

Collections:

```txt
expenses
budgets
accounts
transactions
```

Plural lowercase.

---

# Error Handling

Never use:

```ts
console.log(error);
```

Use centralized logger.

Always return user-friendly messages.

---

# Environment Variables

```env
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=
PORT=
NODE_ENV=
NEXT_PUBLIC_APP_URL=
```

---

# Git Conventions

## Branches

```txt
feature/add-expense
feature/dashboard
fix/login-validation
refactor/query-hooks
```

---

## Commit Messages

```txt
feat: add expense management

fix: resolve login validation bug

refactor: simplify dashboard queries

style: update sidebar layout
```

---

# AI Agent Rules

## Before Writing Code

Always:

1. Read existing implementation.
2. Reuse existing patterns.
3. Check for existing hooks.
4. Check for existing components.
5. Check existing API services.

Do not create duplicates.

---

## When Creating Features

Follow sequence:

1. Types
2. Validation Schema
3. Route Handler (`/app/api/`)
4. Server Layer (Controller → Service → Repository)
5. API Service (client-side)
6. Query Hooks
7. UI Components
8. Page Integration

---

## Code Quality Rules

- DRY
- SOLID
- Type Safe
- Reusable
- Accessible
- Responsive

Avoid premature optimization.

Prefer readability over cleverness.

---

# Definition of Done

A feature is complete when:

- TypeScript has zero errors
- ESLint passes
- Feature works on mobile
- Feature works on desktop
- API errors handled
- Loading states implemented
- Empty states implemented
- Success states implemented
- Code follows project conventions

End goal: build a portfolio-quality application demonstrating modern Next.js, TypeScript, Prisma, and MongoDB best practices using a clean full-stack architecture with Next.js App Router and Route Handlers.
