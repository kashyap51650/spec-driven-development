# Data Model: User Authentication Flow

**Branch**: `003-user-auth-flow` | **Date**: 2026-06-09

## Entities

### User

Represents a registered account holder. Persisted in MongoDB via Prisma.

| Field       | Type       | Constraints                          | Notes                              |
|-------------|------------|--------------------------------------|------------------------------------|
| `id`        | `String`   | Required, auto-generated, primary key | MongoDB ObjectId (`@db.ObjectId`)  |
| `name`      | `String`   | Required, 1–100 characters           | Single free-text field             |
| `email`     | `String`   | Required, unique, valid email format | Case-insensitive uniqueness enforced at service layer |
| `password`  | `String`   | Required, stored as bcrypt hash only | NEVER exposed outside the repository layer |
| `createdAt` | `DateTime` | Auto-set on creation                 |                                    |
| `updatedAt` | `DateTime` | Auto-updated on every write          |                                    |

**Prisma schema** (pre-existing — no migration required):
```prisma
model User {
  id        String   @id @default(auto()) @map("_id") @db.ObjectId
  name      String
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

**TypeScript interface** (password excluded — the application-layer view):
```ts
// src/types/auth.ts
interface User {
  id: string
  name: string
  email: string
  createdAt: Date
  updatedAt: Date
}
```

**Repository select clause** (ensures password is never fetched):
```ts
const SELECT_USER = {
  id: true,
  name: true,
  email: true,
  createdAt: true,
  updatedAt: true,
  password: false,   // never selected
} as const;
```

---

### Session (JWT Cookie)

Represents an authenticated user's proof of identity. Not persisted in the database —
exists only as a signed JWT token stored in the browser's httpOnly cookie.

| Property    | Type     | Value                                              |
|-------------|----------|----------------------------------------------------|
| Cookie name | `string` | `"token"`                                          |
| Transport   | —        | httpOnly cookie, never accessible via `document.cookie` |
| Lifetime    | `number` | 7 days (`maxAge: 60 * 60 * 24 * 7`)               |
| Algorithm   | `string` | HS256 (HMAC-SHA256)                                |

**JWT Payload shape**:
```ts
interface JwtPayload {
  userId: string   // User.id value
  email: string    // User.email value
}
```

**Cookie attributes**:
| Attribute  | Value                                           |
|------------|-------------------------------------------------|
| `httpOnly` | `true`                                          |
| `sameSite` | `"lax"`                                         |
| `secure`   | `true` in production, `false` in development    |
| `maxAge`   | `604800` (7 days in seconds)                    |
| `path`     | `"/"`                                           |

---

## Validation Rules

### Registration Input

| Field      | Rule                              | Error Message                          |
|------------|-----------------------------------|----------------------------------------|
| `name`     | Required, min 1 character         | "Name is required"                     |
| `email`    | Required, valid email format      | "Please enter a valid email address"   |
| `password` | Required, minimum 8 characters   | "Password must be at least 8 characters" |

### Login Input

| Field      | Rule                         | Error Message                          |
|------------|------------------------------|----------------------------------------|
| `email`    | Required, valid email format | "Please enter a valid email address"   |
| `password` | Required, min 1 character   | "Password is required"                 |

**Login server error** (generic — intentionally non-specific):
- Email not found OR password mismatch → `"Invalid email or password"`

**Registration server error** (email conflict):
- Email already registered → `"Email already in use"`

---

## State Transitions

```
[Anonymous Visitor]
      |
      |-- visits /register → fills form → submits
      |         |
      |         ├── validation fails → stays on /register (inline errors)
      |         └── success → JWT cookie set → redirect /dashboard
      |
      |-- visits /login → fills form → submits
                |
                ├── validation fails → stays on /login (inline errors)
                ├── credential mismatch → stays on /login (generic server error)
                └── success → JWT cookie set → redirect /dashboard

[Authenticated User]
      |
      |-- visits /dashboard → session valid → page renders
      |-- visits /login or /register → redirect /dashboard
      |-- triggers logout → cookie deleted → redirect /login

[Expired/Missing Session]
      |
      |-- visits /dashboard → redirect /login
```

---

## Environment Variables

| Variable      | Purpose                                  | Example                          |
|---------------|------------------------------------------|----------------------------------|
| `DATABASE_URL` | MongoDB connection string (pre-existing) | `mongodb+srv://...`             |
| `JWT_SECRET`  | HMAC-SHA256 signing key for JWT tokens   | 32+ random characters            |

`JWT_SECRET` must be added to `.env.local` for development and to the deployment environment.
It must never be committed to the repository.
