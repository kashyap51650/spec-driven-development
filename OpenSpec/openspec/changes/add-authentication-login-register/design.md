# Design: Authentication (Login & Register)

This document describes the implementation approach, file locations, and important details.

1. Types

- `src/types/auth.ts` — Export `User`, `RegisterInput`, `LoginInput`, `JwtPayload` as described in the change spec. `User` must never include `password`.

2. Validation

- `src/server/validations/auth.validation.ts` using Zod.
- `registerSchema`: `name` min 2, `email` valid, `password` min 8.
- `loginSchema`: `email` valid, `password` required.

3. Repository layer

- `src/server/repositories/auth.repository.ts` — single responsibility for DB access. Functions:
  - `findUserByEmail(email: string): Promise<User | null>`
  - `findUserById(id: string): Promise<User | null>`
  - `createUser(data: { name: string; email: string; hashedPassword: string }): Promise<User>`
- Import Prisma from `src/lib/prisma.ts` and map Prisma's `User` model to the `User` return type excluding `password`.

4. Service layer

- `src/server/services/auth.service.ts` implements business logic and validation. Exports `register` and `login`:
  - `register(input: RegisterInput): Promise<{ user: User; token: string }>`
    - Validate input, check email uniqueness, bcrypt hash (12 rounds), create user, sign JWT.
  - `login(input: LoginInput): Promise<{ user: User; token: string }>`
    - Validate input, find user, compare password with bcrypt, sign JWT. On failure throw `new Error("Invalid email or password")`.

5. Auth lib

- Update/ensure `src/lib/auth.ts` includes `signToken`, `verifyToken`, `getSession` behavior as specified. Existing file contains `verifyToken` and `getSession` but not `signToken` — we'll add `signToken` implementation in the apply step.

6. Server Actions

- `src/actions/auth.actions.ts` (`"use server"`) with `registerAction`, `loginAction`, `logoutAction`.
- Actions set httpOnly `token` cookie via `next/headers` `cookies()` and redirect on success.

7. Pages and UI

- Install Shadcn components in expense-tracker repo first:
  - `npx shadcn@latest add card`
  - `npx shadcn@latest add field`
  - `npx shadcn@latest add input`
  - `npx shadcn@latest add label`
  - `npx shadcn@latest add button`
- `app/(auth)/layout.tsx` (Server Component): calls `getSession()` and redirects to `/dashboard` if logged in.
- `app/(auth)/login/page.tsx` (Client): React Hook Form + `zodResolver(loginSchema)`; call `loginAction` via `startTransition`.
- `app/(auth)/register/page.tsx` (Client): analogous to register.

8. Shared UI

- `src/features/auth/components/SubmitButton.tsx` — client component wrapping Shadcn `Button`.

9. Middleware

- `middleware.ts` already exists and protects `/dashboard` and `/api` routes. It checks `JWT_SECRET` via `jsonwebtoken` and redirects to `/login` when missing or invalid. It must also redirect `/login` and `/register` to `/dashboard` when token exists; we'll update `matcher` to include `/login` and `/register` and add that redirect logic.

10. Environment

- `JWT_SECRET` must be set. `JWT_EXPIRES_IN` optional (e.g., `7d` or `1h`). Cookies set with `sameSite: 'lax'`, `httpOnly: true`, `secure: process.env.NODE_ENV === 'production'`, `maxAge: 60*60*24*7`.

11. Security & UX notes

- Never reveal whether email or password was incorrect.
- Never return `password` field.
- Use bcrypt with 3 rounds.
