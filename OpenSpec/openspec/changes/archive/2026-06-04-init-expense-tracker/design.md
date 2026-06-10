# Design: Project scaffold and key configuration

Overview

- App: Next.js (App Router) + TypeScript
- Styling: Tailwind CSS + Shadcn UI
- Forms/validation: React Hook Form + Zod
- DB: Prisma ORM with MongoDB
- Auth: JWT (`jsonwebtoken`) + `bcrypt` for password hashing

Folder structure (to be created by scaffolding + manual folders):

src/

- components/
  - ui/ (Shadcn components)
  - shared/
- features/
  - auth/
  - expenses/
  - income/
  - transfers/
  - budgets/
  - dashboard/
- server/
  - middleware/
  - controllers/
  - services/
  - repositories/
  - validations/
- data/
- actions/
- lib/
- types/
- constants/
- utils/

Prisma schema (prisma/schema.prisma)
-- Use provider = "mongodb" and ObjectId mapping.

Example schema (add this after running `npx prisma init`):

generator client {
provider = "prisma-client-js"
}

datasource db {
provider = "mongodb"
url = env("DATABASE_URL")
}

model User {
id String @id @default(auto()) @map("\_id") @db.ObjectId
name String
email String @unique
password String
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Expense {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
amount Float
category String
account String
date DateTime
notes String?
tags String[]
recurring Boolean @default(false)
userId String @db.ObjectId
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Income {
id String @id @default(auto()) @map("\_id") @db.ObjectId
title String
amount Float
source String
account String
date DateTime
notes String?
userId String @db.ObjectId
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Transfer {
id String @id @default(auto()) @map("\_id") @db.ObjectId
fromAccount String
toAccount String
amount Float
date DateTime
note String?
userId String @db.ObjectId
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

model Budget {
id String @id @default(auto()) @map("\_id") @db.ObjectId
category String
limit Float
month String
userId String @db.ObjectId
createdAt DateTime @default(now())
updatedAt DateTime @updatedAt
}

Prisma Client singleton (src/lib/prisma.ts)

```
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient | undefined };

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
```

Auth utility (src/lib/auth.ts) — responsibilities

- `verifyToken(token: string)` — verify and return decoded payload or null
- `getSession()` — read JWT from cookies and return user payload or null

Use `jsonwebtoken` here (or `jose` if preferred). Keep function types strict and return `null` on failure.

Middleware (middleware.ts) — route protection

- Protect `/dashboard` and `/api` except `/api/auth/*`.
- Read JWT from cookies, verify with `JWT_SECRET`, redirect to `/login` if unauthenticated.

next.config.ts

- Keep minimal default export. No experimental flags.

.env keys (create `.env` and `.env.example`):

- DATABASE_URL=
- JWT_SECRET=
- JWT_EXPIRES_IN=7d
- NODE_ENV=development
- NEXT_PUBLIC_APP_URL=http://localhost:3000
