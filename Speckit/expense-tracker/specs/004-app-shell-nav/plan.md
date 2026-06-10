# Implementation Plan: App Shell Navigation

**Branch**: `004-app-shell-nav` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `specs/004-app-shell-nav/spec.md`

## Summary

Add the authenticated application shell: a fixed desktop sidebar and a mobile top-header + drawer containing navigation links to all five sections (Dashboard, Expenses, Income, Transfers, Budgets). Session validation moves from individual pages to the shared `src/app/(dashboard)/layout.tsx`. Each section gets a placeholder page, a skeleton loading state, and an error boundary. A `getUserById` data function is added to resolve the user's display name from the database (the JWT only carries `userId` and `email`).

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)

**Primary Dependencies**: Next.js 16 App Router, Shadcn UI, Tailwind CSS, lucide-react, Prisma, `jose` (already installed)

**Storage**: MongoDB via Prisma (existing `db` singleton in `src/lib/prisma.ts`)

**Testing**: `tsc --noEmit` (TypeScript compilation gate)

**Target Platform**: Web — desktop (≥768px) and mobile (<768px)

**Project Type**: Web application — Next.js App Router, server-first

**Performance Goals**: Shell renders and is interactive within 1 second on broadband

**Constraints**: No new runtime dependencies; Shadcn components installed via CLI only; all Next.js app files reside under `src/app/` (not a root `app/` directory)

**Scale/Scope**: Single-user sessions; no concurrent-user concerns in this feature

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-checked after Phase 1 design.*

| Principle | Gate | Status | Notes |
|---|---|---|---|
| I. Server-First Data Access | `getUserById` in `src/data/`; no `useEffect` fetching | ✅ Pass | Layout fetches user via data function in RSC |
| II. Architecture Layering | RSC → `src/data/` → `src/server/repositories/` → Prisma | ✅ Pass | New `user.repository.ts` added; `auth.repository.ts` not reused for this read path |
| III. TypeScript Discipline | `interface` for props; explicit return types; no `any` | ✅ Pass | All component props use `interface`; functions carry explicit return types |
| IV. Response Contract | Data functions return directly; `logoutAction` already conforms | ✅ Pass | `getUserById` throws on error; no envelope wrapper |
| V. UI Component Integrity | Shadcn via CLI; lucide-react only | ✅ Pass | 7 components installed via `npx shadcn@latest add` before any code |
| VI. Formatting & Localisation | No monetary/date values in this feature | N/A | Not applicable |
| VII. Auth & Session Management | `getSession()` in layout; redirect on null | ✅ Pass | Middleware protects `/dashboard/*`; layout adds defence in depth |
| VIII. UI Interaction Patterns | `loading.tsx` + `error.tsx` per page; Skeleton components | ⚠️ Scope add | Spec covers `loading.tsx`; **`error.tsx` required by constitution** — 5 error boundaries added to scope |

**Complexity Tracking**: No violations requiring justification.

## Project Structure

### Documentation (this feature)

```text
specs/004-app-shell-nav/
├── plan.md              ← this file
├── research.md          ← Phase 0 output
├── data-model.md        ← Phase 1 output
├── quickstart.md        ← Phase 1 output
├── contracts/
│   └── component-props.md   ← Phase 1 output
└── tasks.md             ← Phase 2 output (/speckit-tasks)
```

### Source Code (repository root)

```text
src/
├── constants/
│   └── navigation.ts                          ← NEW
│
├── server/repositories/
│   └── user.repository.ts                     ← NEW
│
├── data/
│   └── user.ts                                ← NEW
│
├── components/shared/
│   └── AppLogo.tsx                            ← NEW
│
├── features/dashboard/components/
│   ├── NavLinks.tsx                           ← NEW ("use client")
│   ├── UserMenu.tsx                           ← NEW ("use client")
│   ├── Sidebar.tsx                            ← NEW (Server Component)
│   └── MobileHeader.tsx                       ← NEW ("use client")
│
└── app/(dashboard)/
    ├── layout.tsx                             ← NEW
    ├── dashboard/
    │   ├── page.tsx                           ← REPLACE (remove inline session check)
    │   ├── loading.tsx                        ← NEW
    │   └── error.tsx                          ← NEW
    ├── expenses/
    │   ├── page.tsx                           ← NEW
    │   ├── loading.tsx                        ← NEW
    │   └── error.tsx                          ← NEW
    ├── income/
    │   ├── page.tsx                           ← NEW
    │   ├── loading.tsx                        ← NEW
    │   └── error.tsx                          ← NEW
    ├── transfers/
    │   ├── page.tsx                           ← NEW
    │   ├── loading.tsx                        ← NEW
    │   └── error.tsx                          ← NEW
    └── budgets/
        ├── page.tsx                           ← NEW
        ├── loading.tsx                        ← NEW
        └── error.tsx                          ← NEW
```

**Structure Decision**: Single Next.js App Router project under `src/app/`. Route group `(dashboard)` provides the authenticated shell layout. Feature components under `src/features/dashboard/components/` follow the established `src/features/auth/` pattern.

## Implementation Layers

Ordered by dependency. Complete each layer before starting the next.

### Layer 1 — Install Shadcn Components

Run before writing any code. Verify absence in `src/components/ui/` first.

```bash
npx shadcn@latest add separator
npx shadcn@latest add avatar
npx shadcn@latest add dropdown-menu
npx shadcn@latest add sheet
npx shadcn@latest add scroll-area
npx shadcn@latest add skeleton
npx shadcn@latest add tooltip
```

### Layer 2 — Navigation Config

**File**: `src/constants/navigation.ts`

```
interface NavItem { label: string; href: string; icon: LucideIcon }
const navItems: NavItem[]  — export as const, 5 items
```

| Label | href | Icon |
|---|---|---|
| Dashboard | /dashboard | LayoutDashboard |
| Expenses | /expenses | ArrowDownCircle |
| Income | /income | ArrowUpCircle |
| Transfers | /transfers | ArrowLeftRight |
| Budgets | /budgets | PiggyBank |

### Layer 3 — User Repository + Data Function

**`src/server/repositories/user.repository.ts`**
- `findById(id: string): Promise<User | null>`
- Prisma `findUnique` by `{ id }`; explicit `select` excluding `password`; returns mapped `User` or `null`
- Pattern mirrors `auth.repository.ts` — use the same `USER_SELECT` constant approach

**`src/data/user.ts`**
- `getUserById(): Promise<User>`
- Calls `getSession()` → throws `"Unauthorized"` if null
- Calls `userRepository.findById(session.userId)` → throws `"User not found"` if null
- Returns `User` directly (no envelope)
- `session.userId` is the `JwtPayload.userId` string (MongoDB ObjectId)

### Layer 4 — AppLogo Component

**File**: `src/components/shared/AppLogo.tsx` (Server Component)

Props: `interface AppLogoProps { size?: "sm" | "md" | "lg" }`  Default: `"md"`

| Size | Icon classes | Text classes |
|---|---|---|
| sm | `h-4 w-4` | `text-sm font-semibold` |
| md | `h-5 w-5` | `text-base font-semibold` |
| lg | `h-6 w-6` | `text-lg font-bold` |

`Wallet` icon (lucide-react) + "Expense Tracker" text. Container: `flex items-center gap-2`.

### Layer 5 — NavLinks Component

**File**: `src/features/dashboard/components/NavLinks.tsx` (`"use client"`)

Props: `interface NavLinksProps { onNavigate?: () => void }`

Active detection — `usePathname()` from `next/navigation`:
- `href === "/dashboard"` → exact: `pathname === href`
- All others → prefix: `pathname.startsWith(href)`

Active link classes: `bg-accent text-accent-foreground font-medium`
Inactive link classes: `text-muted-foreground hover:bg-accent hover:text-accent-foreground`
Link layout: `flex items-center gap-3 px-3 py-2 rounded-md text-sm`
All links wrapped in Shadcn `ScrollArea`.
On click: call `onNavigate?.()` after navigation.

### Layer 6 — UserMenu Component

**File**: `src/features/dashboard/components/UserMenu.tsx` (`"use client"`)

Props: `interface UserMenuProps { user: { name: string; email: string } }`

Initials helper: `name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()`

Shadcn `DropdownMenu` structure:
- `DropdownMenuTrigger`: `Avatar` → `AvatarFallback` with initials
- `DropdownMenuContent`:
  - `div` with user name (`font-medium`) — not a `DropdownMenuItem`
  - `div` with user email (`text-sm text-muted-foreground`) — not a `DropdownMenuItem`
  - `DropdownMenuSeparator`
  - `DropdownMenuItem` for logout: `useTransition` → `startTransition(() => logoutAction())`; shows `"Logging out…"` + disabled when `isPending`; `LogOut` icon (lucide-react)

### Layer 7 — Sidebar Component

**File**: `src/features/dashboard/components/Sidebar.tsx` (Server Component)

Props: `interface SidebarProps { user: { name: string; email: string } }`

```
aside.hidden.md:flex.flex-col.h-screen.w-60.border-r.bg-background
  div.px-4.py-5                    ← AppLogo size="md"
  nav.flex-1.px-3.py-2.overflow-hidden  ← NavLinks
  div.px-4.py-3                    ← Separator + UserMenu
```

### Layer 8 — MobileHeader Component

**File**: `src/features/dashboard/components/MobileHeader.tsx` (`"use client"`)

Props: `interface MobileHeaderProps { user: { name: string; email: string } }`

State: `const [open, setOpen] = useState(false)`

```
header.flex.md:hidden.h-14.border-b.bg-background.items-center.justify-between.px-4
  Button[variant=ghost][size=icon] onClick={() => setOpen(true)}  ← Menu icon
  AppLogo size="sm"
  UserMenu
Sheet[side=left][open={open}][onOpenChange={setOpen}]
  SheetContent.flex.flex-col.h-full.w-60
    div.p-4  ← AppLogo size="md"
    NavLinks onNavigate={() => setOpen(false)}
```

### Layer 9 — Dashboard Layout

**File**: `src/app/(dashboard)/layout.tsx` (Server Component)

```typescript
import { getUserById } from "@/data/user"
import { redirect } from "next/navigation"

export default async function DashboardLayout({ children }) {
  try {
    const user = await getUserById()
    return (
      <div className="flex h-screen overflow-hidden">
        <Sidebar user={user} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <MobileHeader user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    )
  } catch {
    redirect("/login")
  }
}
```

Passes `{ name: user.name, email: user.email }` to child components.

### Layer 10 — Placeholder Pages

Five pure Server Components. No `getSession()` — the layout handles session guarding.

| File | h1 text |
|---|---|
| `src/app/(dashboard)/dashboard/page.tsx` | Dashboard |
| `src/app/(dashboard)/expenses/page.tsx` | Expenses |
| `src/app/(dashboard)/income/page.tsx` | Income |
| `src/app/(dashboard)/transfers/page.tsx` | Transfers |
| `src/app/(dashboard)/budgets/page.tsx` | Budgets |

Each renders `<h1>{name}</h1><p>Coming soon.</p>`. **Replace** existing `dashboard/page.tsx`.

### Layer 11 — Loading Skeletons

**`src/app/(dashboard)/dashboard/loading.tsx`**:
- `div.grid.grid-cols-4.gap-4` → 4× `Skeleton.h-28.rounded-lg`
- `Skeleton.h-72.rounded-lg.mt-4` for chart area

**`src/app/(dashboard)/{expenses,income,transfers,budgets}/loading.tsx`** (same pattern × 4):
- `Skeleton.h-10.rounded-md.mb-4` for toolbar row
- `div.flex.flex-col.gap-2` → 5× `Skeleton.h-12.rounded-md`

### Layer 12 — Error Boundaries (Constitution Requirement)

Five `"use client"` files. Next.js `error.tsx` signature: `{ error: Error & { digest?: string }; reset: () => void }`.

All five sections: `src/app/(dashboard)/{dashboard,expenses,income,transfers,budgets}/error.tsx`

Minimal UI: display `error.message`, a "Try again" button calling `reset()`.
