# Data Model: Base Project Setup

**Phase**: 1 | **Plan**: [plan.md](./plan.md) | **Date**: 2026-06-09

All five models target MongoDB via Prisma. All IDs use `@id @default(auto()) @map("_id") @db.ObjectId`.

---

## Model: User

**Purpose**: Represents an authenticated account holder. The root entity — all financial records reference `User.id`.

```prisma
model User {
  id        String    @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String    @unique
  password  String
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt

  expenses  Expense[]
  incomes   Income[]
  transfers Transfer[]
  budgets   Budget[]
}
```

**Validation rules**:
- `email` must be unique (FR-014)
- `password` stored as bcrypt hash — never plaintext (Constitution VII)
- `name` required, no empty string

**State transitions**: N/A (no soft-delete or status field in this spec)

---

## Model: Expense

**Purpose**: Records a financial outflow event.

```prisma
model Expense {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  amount    Float
  category  String
  account   String
  date      DateTime
  notes     String?
  tags      String[]
  recurring Boolean  @default(false)
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Validation rules** (FR-015):
- `recurring` defaults to `false`
- `tags` is `String[]` (zero or more tag strings)
- `notes` is optional (`String?`)
- `amount` must be > 0 (enforced at application layer, not schema)

---

## Model: Income

**Purpose**: Records a financial inflow event.

```prisma
model Income {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  title     String
  amount    Float
  source    String
  account   String
  date      DateTime
  notes     String?
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Validation rules**:
- `notes` is optional (`String?`)
- `amount` must be > 0 (application layer)

---

## Model: Transfer

**Purpose**: Represents a movement of funds between two accounts belonging to the same user.

```prisma
model Transfer {
  id          String   @id @default(auto()) @map("_id") @db.ObjectId
  fromAccount String
  toAccount   String
  amount      Float
  date        DateTime
  note        String?
  userId      String   @db.ObjectId
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Validation rules**:
- `note` is optional (`String?`) — singular "note", not "notes" (FR-016)
- `fromAccount` and `toAccount` must differ (application layer validation)

---

## Model: Budget

**Purpose**: A monthly spending ceiling for a specific category.

```prisma
model Budget {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  category  String
  limit     Float
  month     String
  userId    String   @db.ObjectId
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  user User @relation(fields: [userId], references: [id])
}
```

**Validation rules** (FR-017):
- `limit` is `Float` (spending cap; must be > 0 at application layer)
- `month` is a string — expected format `YYYY-MM` (e.g., `"2026-06"`) enforced at application layer
- `category` must match the app's known category list (application layer)

---

## Entity Relationship Summary

```text
User
 ├── Expense[] (one-to-many, userId FK)
 ├── Income[]  (one-to-many, userId FK)
 ├── Transfer[] (one-to-many, userId FK)
 └── Budget[]  (one-to-many, userId FK)
```

All child models are userId-scoped. Every repository query MUST filter by `userId` (Constitution II).

---

## Prisma Schema Header

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mongodb"
  url      = env("DATABASE_URL")
}
```
