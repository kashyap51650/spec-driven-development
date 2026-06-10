# Quickstart Validation Guide: Base Project Setup

**Phase**: 1 | **Plan**: [plan.md](./plan.md) | **Date**: 2026-06-09

Use this guide to validate that the base project setup is complete and correct. Each scenario maps to a success criterion in the spec.

---

## Prerequisites

- Node.js 18+ and npm installed
- A MongoDB connection string (Atlas or local `mongod`) — only needed for SC-005
- Git installed

---

## Scenario 1 — Zero-Error Dev Server (SC-001, SC-002, SC-003)

**What it proves**: The project compiles, lints, and runs cleanly.

```bash
# From repo root
npm install
cp .env.example .env
# Populate DATABASE_URL and JWT_SECRET in .env (any non-empty value for JWT_SECRET)

npm run dev
```

Expected: Server starts at `http://localhost:3000` with no errors in terminal.

Open browser at `http://localhost:3000`:
- Expected: Browser immediately lands on `/dashboard` (redirect from root `page.tsx`, then middleware redirects to `/login` if unauthenticated)

Stop the server (`Ctrl+C`), then run:

```bash
npx tsc --noEmit
npm run lint
```

Expected: Both commands exit with code 0 and zero diagnostic output.

---

## Scenario 2 — Directory Structure Intact (SC-004)

**What it proves**: All 12 required `src/` directories exist and are git-tracked.

```bash
ls src/types src/constants src/server/validations src/server/repositories \
   src/server/services src/data src/actions src/features src/components/ui \
   src/components/shared src/lib src/utils
```

Expected: Each directory listed with no "No such file or directory" errors.

```bash
find src -name '.gitkeep'
```

Expected: One `.gitkeep` per empty directory (directories with files, e.g. `src/lib/`, may not have one).

---

## Scenario 3 — Root Redirect Only (FR-005)

**What it proves**: `app/page.tsx` contains only a redirect — no UI content.

```bash
cat src/app/page.tsx
```

Expected: File contains only a `redirect('/dashboard')` call and necessary import. No JSX, no layout, no content.

---

## Scenario 4 — Prisma Schema Generates Successfully (SC-005)

**What it proves**: All 5 data models produce a valid typed Prisma client.

```bash
# Requires DATABASE_URL set in .env
npx prisma generate
```

Expected: Command completes with "Generated Prisma Client" message and zero errors.

Spot-check the schema:

```bash
grep -E "^model " prisma/schema.prisma
```

Expected output:
```
model User
model Expense
model Income
model Transfer
model Budget
```

---

## Scenario 5 — Auth Utility Type Signatures (SC-006)

**What it proves**: All three functions resolve with correct TypeScript signatures.

Create a temporary type-check file (do not commit):

```bash
cat > /tmp/auth-check.ts << 'EOF'
import { signToken, verifyToken, getSession, JwtPayload } from './src/lib/auth'

const payload: JwtPayload = { userId: 'abc', email: 'test@example.com' }
const _a: Promise<string> = signToken(payload)
const _b: Promise<JwtPayload | null> = verifyToken('token')
const _c: Promise<JwtPayload | null> = getSession()
EOF
npx tsc --noEmit --strict /tmp/auth-check.ts 2>&1 | head -20
```

Expected: Zero TypeScript errors (some path resolution noise is acceptable; no type errors on the three function calls).

---

## Scenario 6 — Middleware Route Protection (SC-007)

**What it proves**: Unauthenticated requests to `/dashboard/*` are redirected to `/login`.

With `npm run dev` running:

```bash
# Using curl — follow redirects and show final URL
curl -s -o /dev/null -w "%{url_effective}" -L http://localhost:3000/dashboard
```

Expected: Final URL is `http://localhost:3000/login` (middleware redirected unauthenticated request).

```bash
# API auth pass-through — should not redirect
curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/auth/anything
```

Expected: HTTP status is NOT 302 (pass-through; 404 is fine since the route doesn't exist yet).

---

## Scenario 7 — Environment Variable Safety

**What it proves**: `.env` is gitignored; `.env.example` is tracked.

```bash
git status .env
git status .env.example
```

Expected:
- `.env` → not tracked (listed under "Ignored files" or absent from `git status` output)
- `.env.example` → tracked (listed under "Changes to be committed" or "nothing to commit" once staged)

---

## Reference

- Data model contracts: [data-model.md](./data-model.md)
- Auth utility contracts: [contracts/auth-utilities.md](./contracts/auth-utilities.md)
- Full requirement list: [spec.md](./spec.md) — FR-001 through FR-032
