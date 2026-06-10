# Research: Base Project Setup

**Phase**: 0 | **Plan**: [plan.md](./plan.md) | **Date**: 2026-06-09

All decisions below were resolved during the clarification session on 2026-06-09. No open unknowns remain.

---

## R-001: JWT Library Selection

**Decision**: Use `jose` (not `jsonwebtoken`)

**Rationale**: `jsonwebtoken` relies on Node.js-only APIs (`crypto`, `Buffer`) that are unavailable in the Next.js Edge runtime. `middleware.ts` runs on the Edge runtime, so the JWT verification call inside it requires an Edge-compatible library. `jose` is fully compatible with both Node.js and the Edge runtime and is the de-facto standard for Next.js middleware JWT work.

**Alternatives considered**:
- `jsonwebtoken` — rejected: Node.js-only, crashes in Edge runtime
- `next-auth` — rejected: adds session management overhead not required for this bespoke auth implementation; constitution mandates custom JWT approach

---

## R-002: Auth Utility API Surface

**Decision**: Export exactly three functions from `src/lib/auth.ts`:
- `signToken(payload: JwtPayload): Promise<string>`
- `verifyToken(token: string): Promise<JwtPayload | null>`
- `getSession(): Promise<JwtPayload | null>`

**Rationale**: Minimal surface area — downstream auth feature imports only what it needs. `getSession` is server-only (reads `next/headers`); `verifyToken` is used in both server components and middleware. Separating them avoids importing `next/headers` into middleware (which causes Edge runtime errors).

**Alternatives considered**:
- Single `auth()` helper — rejected: conflates session reading (needs `next/headers`) with token verification (Edge-safe), forcing a split anyway
- Class-based approach — rejected: functions are simpler and more tree-shakeable

---

## R-003: bcrypt Variant

**Decision**: `bcryptjs` (pure JavaScript implementation)

**Rationale**: `bcryptjs` has no native bindings, making it trivially installable on any platform without build tools. It is the correct choice for a project where developers may use Windows, macOS, or Linux. The `bcrypt` native module requires `node-pre-gyp` and platform-specific build tooling, which adds friction.

**Alternatives considered**:
- `bcrypt` (native) — rejected: native bindings add setup friction; no measurable performance difference at the scale of a personal finance app
- `argon2` — rejected: more secure but requires native bindings; constitution does not require argon2

---

## R-004: Prisma Provider

**Decision**: MongoDB provider with ObjectId conventions

**Rationale**: The spec requires MongoDB (constitution technology table). Prisma's MongoDB provider requires `@id @default(auto()) @map("_id") @db.ObjectId` on all model IDs — this is a MongoDB-specific convention that differs from PostgreSQL's `autoincrement()`. All five models must follow this pattern.

**Alternatives considered**:
- PostgreSQL — rejected: database choice already fixed by constitution
- Raw MongoDB driver — rejected: Prisma provides type-safe query building and schema-as-code

---

## R-005: Middleware Routing Logic

**Decision**: Three distinct route categories in `middleware.ts`:
1. `/dashboard/*` — protected; redirect to `/login` if no valid token
2. `/login`, `/register` — authenticated bounce; redirect to `/dashboard` if valid token
3. `/api/auth/*` — pass-through; no auth check

**Rationale**: Matches the spec exactly (FR-023 through FR-026). Using `jose`'s `jwtVerify` in middleware is safe for the Edge runtime. `verifyToken` returns `null` on any failure (never throws), so the middleware can treat `null` as unauthenticated without try/catch.

**Alternatives considered**:
- Protecting all routes except a whitelist — rejected: more complex matcher config, higher risk of accidentally blocking public routes
- Using Next.js `auth()` middleware helper — rejected: requires NextAuth, which is not in the stack

---

## R-006: Environment Variables

**Decision**: Six keys in `.env` and `.env.example`:
```
DATABASE_URL=
JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=3000
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**Rationale**: Exactly what FR-027 specifies. `DATABASE_URL` left empty — developers supply their own MongoDB connection string. `JWT_SECRET` left empty — filled before running auth features. `JWT_EXPIRES_IN=7d` matches the constitution's `maxAge: 60 * 60 * 24 * 7` cookie setting.

**Alternatives considered**:
- Hardcoding a development JWT secret — rejected: security risk; teaches bad habits
- Using a secrets manager — rejected: out of scope for local development setup

---

## R-007: Shadcn UI Initialization

**Decision**: `npx shadcn@latest init` with: style = default, color = neutral, CSS variables = yes

**Rationale**: Neutral base color is a safe choice for a financial app (no strong brand color bias). CSS variables are required for Shadcn's theming system. No components are installed during setup — they are added per-feature via `npx shadcn@latest add <component>`.

**Alternatives considered**:
- Style = new-york — rejected: constitution does not specify a preference; default is safer
- Pre-installing components — rejected: violates FR-010 (ui/ must not contain manually created files at setup time)
