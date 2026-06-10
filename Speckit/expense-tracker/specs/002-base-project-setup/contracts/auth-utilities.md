# Contract: Auth Utilities & Middleware

**Phase**: 1 | **Plan**: [../plan.md](../plan.md) | **Date**: 2026-06-09

This document defines the contracts for the three exported functions from `src/lib/auth.ts` and the routing rules enforced by `middleware.ts`. These contracts are implemented in the base setup and consumed by every downstream feature.

---

## `src/lib/auth.ts` — Exported API

### JwtPayload Interface

```ts
export interface JwtPayload {
  userId: string;
  email: string;
}
```

Exactly two fields. No additional fields are permitted (Constitution VII).

---

### signToken

```ts
export async function signToken(payload: JwtPayload): Promise<string>
```

| Aspect | Value |
|--------|-------|
| Input | `JwtPayload` — `{ userId: string; email: string }` |
| Output | Signed JWT string (compact format) |
| Library | `jose` (`SignJWT`) |
| Secret | `process.env.JWT_SECRET` — throws at call time if missing |
| Algorithm | HS256 |
| Expiry | `process.env.JWT_EXPIRES_IN` (default `"7d"`) |
| Throws | If `JWT_SECRET` is absent or signing fails |
| Runtime | Node.js only (used in Server Actions, not middleware) |

---

### verifyToken

```ts
export async function verifyToken(token: string): Promise<JwtPayload | null>
```

| Aspect | Value |
|--------|-------|
| Input | Raw JWT string |
| Output | Decoded `JwtPayload` on success; `null` on any failure |
| Library | `jose` (`jwtVerify`) |
| Guarantee | NEVER throws — all errors caught internally and return `null` |
| Runtime | Edge-compatible (used in `middleware.ts`) |
| Failure cases | Invalid signature, expired token, malformed token, missing secret → all return `null` |

---

### getSession

```ts
export async function getSession(): Promise<JwtPayload | null>
```

| Aspect | Value |
|--------|-------|
| Input | None — reads `token` cookie from `next/headers` |
| Output | Decoded `JwtPayload` if cookie exists and is valid; `null` otherwise |
| Cookie name | `token` |
| Guarantee | NEVER throws — all errors caught internally |
| Runtime | Node.js only (server components and Server Actions; NOT usable in middleware) |

---

## `middleware.ts` — Route Protection Rules

**Runtime**: Next.js Edge runtime

**Matcher**: Applied to all requests (default matcher); route-specific logic handled inside the function body.

### Routing Table

| Path pattern | Auth state | Action |
|---|---|---|
| `/dashboard/*` | No valid token | Redirect → `/login` |
| `/dashboard/*` | Valid token | Pass through |
| `/login`, `/register` | Valid token | Redirect → `/dashboard` |
| `/login`, `/register` | No valid token | Pass through |
| `/api/auth/*` | Any | Pass through (no auth check) |
| Everything else | Any | Pass through |

### Token Source

- Read from cookie named `token`
- Verified via `verifyToken(token)` — returns `null` on failure, never throws
- A `null` result from `verifyToken` is treated as unauthenticated

### Error Handling

- If `JWT_SECRET` is missing when `verifyToken` is called → returns `null` (treated as unauthenticated)
- No errors are surfaced to the client — all failures silently result in the appropriate redirect

---

## Cookie Contract (for downstream auth feature)

The auth feature (future spec) MUST set the `token` cookie with these attributes:

```ts
{
  name: "token",
  value: await signToken(payload),
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7   // 7 days
}
```

This contract is enforced by Constitution VII and referenced here so the auth feature spec can cite it.
