# Server Action Contracts: User Authentication

**File**: `src/actions/auth.actions.ts`
**Directive**: `"use server"`

---

## `registerAction`

**Signature**: `registerAction(formData: FormData): Promise<{ success: boolean; message: string } | never>`

**Inputs** (extracted from `FormData`):
| Key        | Type     | Validation            |
|------------|----------|-----------------------|
| `name`     | `string` | registerSchema        |
| `email`    | `string` | registerSchema        |
| `password` | `string` | registerSchema        |

**Outputs**:
| Scenario          | Return value                                        | Side effect                        |
|-------------------|-----------------------------------------------------|------------------------------------|
| Success           | *(never returned — redirect fires)*                 | Cookie set + `redirect("/dashboard")` |
| Validation error  | `{ success: false, message: "<zod error message>" }` | None                               |
| Email taken       | `{ success: false, message: "Email already in use" }` | None                               |
| Server error      | `{ success: false, message: "<error.message>" }`    | None                               |

**Cookie set on success**:
```ts
(await cookies()).set("token", token, {
  httpOnly: true,
  sameSite: "lax",
  secure: process.env.NODE_ENV === "production",
  maxAge: 60 * 60 * 24 * 7,
  path: "/",
});
```

**Critical**: `redirect("/dashboard")` is called **outside** the `try/catch` block.

---

## `loginAction`

**Signature**: `loginAction(formData: FormData): Promise<{ success: boolean; message: string } | never>`

**Inputs** (extracted from `FormData`):
| Key        | Type     | Validation       |
|------------|----------|------------------|
| `email`    | `string` | loginSchema      |
| `password` | `string` | loginSchema      |

**Outputs**:
| Scenario           | Return value                                                | Side effect                        |
|--------------------|-------------------------------------------------------------|------------------------------------|
| Success            | *(never returned — redirect fires)*                         | Cookie set + `redirect("/dashboard")` |
| Validation error   | `{ success: false, message: "<zod error message>" }`        | None                               |
| Invalid credential | `{ success: false, message: "Invalid email or password" }`  | None                               |
| Server error       | `{ success: false, message: "<error.message>" }`            | None                               |

**Security requirement**: The error message for both "email not found" and "password mismatch"
MUST be identical: `"Invalid email or password"`. Do not branch on which condition failed.

**Critical**: `redirect("/dashboard")` is called **outside** the `try/catch` block.

---

## `logoutAction`

**Signature**: `logoutAction(): Promise<never>`

**Inputs**: None.

**Outputs**: Never returns (always redirects).

| Scenario   | Side effect                                         |
|------------|-----------------------------------------------------|
| Always     | Cookie `"token"` deleted + `redirect("/login")`     |

**Implementation**:
```ts
export async function logoutAction(): Promise<never> {
  (await cookies()).delete("token");
  redirect("/login");
}
```

No `try/catch` needed. Cookie deletion is infallible (missing cookie is a no-op).

---

## `lib/auth.ts` Utility Contracts

**File**: `src/lib/auth.ts`

### `signToken`
```ts
signToken(payload: JwtPayload): Promise<string>
```
- Creates a signed HS256 JWT with the given payload
- Sets `expirationTime` to `"7d"`
- Uses `JWT_SECRET` from environment
- Must not throw (caller is responsible for try/catch if needed)

### `verifyToken`
```ts
verifyToken(token: string): Promise<JwtPayload | null>
```
- Verifies the JWT signature and expiry
- Returns the decoded `JwtPayload` on success
- Returns `null` on ANY failure (expired, invalid signature, malformed)
- MUST NEVER throw

### `getSession`
```ts
getSession(): Promise<JwtPayload | null>
```
- Calls `await cookies()` from `next/headers`
- Reads the `"token"` cookie value
- Calls `verifyToken(token)`
- Returns the payload or `null`
- MUST NEVER throw

---

## Middleware Contract

**File**: `middleware.ts` (repository root — not inside `src/`)

**Matcher**:
```ts
export const config = {
  matcher: ["/dashboard/:path*", "/login", "/register"],
};
```

**Logic**:
| Request path           | Session state  | Action                              |
|------------------------|----------------|-------------------------------------|
| `/dashboard` or sub    | No valid token | `redirect(/login)`                  |
| `/dashboard` or sub    | Valid token    | Pass through                        |
| `/login` or `/register`| Valid token    | `redirect(/dashboard)`              |
| `/login` or `/register`| No valid token | Pass through                        |

**Token reading in middleware**: Use `request.cookies.get("token")?.value` — do NOT use
`next/headers` (not available in Edge runtime). Call `verifyToken` from `src/lib/auth.ts`.
