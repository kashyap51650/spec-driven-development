# Component Prop Contracts: App Shell Navigation

**Feature**: `004-app-shell-nav` | **Date**: 2026-06-09

These contracts define the public interface of every component introduced in this feature. They are the authoritative reference for the `/speckit-tasks` step and for implementation.

---

## AppLogo

**File**: `src/components/shared/AppLogo.tsx`
**Type**: Server Component

```typescript
interface AppLogoProps {
  size?: "sm" | "md" | "lg";  // default: "md"
}
```

**Renders**: `Wallet` icon (lucide-react) + "Expense Tracker" text, side by side.
**Size mapping**:
| prop value | icon | text |
|---|---|---|
| `"sm"` | `h-4 w-4` | `text-sm font-semibold` |
| `"md"` | `h-5 w-5` | `text-base font-semibold` |
| `"lg"` | `h-6 w-6` | `text-lg font-bold` |

**Used by**: `Sidebar` (md), `MobileHeader` (sm + md inside Sheet)

---

## NavLinks

**File**: `src/features/dashboard/components/NavLinks.tsx`
**Type**: Client Component (`"use client"`)

```typescript
interface NavLinksProps {
  onNavigate?: () => void;
}
```

**Behaviour**:
- Reads `navItems` from `src/constants/navigation.ts` (static import)
- Uses `usePathname()` to compute active state
- Calls `onNavigate?.()` after any link click
- Returns a `ScrollArea` containing styled `Link` elements

**Active state rules**:
| href | Method | Condition |
|---|---|---|
| `/dashboard` | Exact match | `pathname === "/dashboard"` |
| All others | Prefix match | `pathname.startsWith(href)` |

**Used by**: `Sidebar` (no `onNavigate`), `MobileHeader` (passes `() => setOpen(false)`)

---

## UserMenu

**File**: `src/features/dashboard/components/UserMenu.tsx`
**Type**: Client Component (`"use client"`)

```typescript
interface UserMenuProps {
  user: {
    name: string;
    email: string;
  };
}
```

**Renders**: Shadcn `DropdownMenu` triggered by a `Avatar` showing user initials.

**Initials algorithm**: `name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()`

**Dropdown items**:
| Item | Interactive | Notes |
|---|---|---|
| User name | No | `font-medium` |
| User email | No | `text-sm text-muted-foreground` |
| Separator | — | `DropdownMenuSeparator` |
| Logout | Yes | `startTransition(() => logoutAction())`; `isPending` → "Logging out…" + disabled |

**Used by**: `Sidebar`, `MobileHeader`

---

## Sidebar

**File**: `src/features/dashboard/components/Sidebar.tsx`
**Type**: Server Component

```typescript
interface SidebarProps {
  user: {
    name: string;
    email: string;
  };
}
```

**Renders**: Fixed left sidebar, desktop only.
- Container: `hidden md:flex flex-col h-screen w-60 border-r bg-background`
- Sections: `AppLogo` (top) → `NavLinks` (flex-1 middle) → `Separator` + `UserMenu` (bottom)
- No client-side state; passes `user` down to `UserMenu`

**Used by**: `src/app/(dashboard)/layout.tsx`

---

## MobileHeader

**File**: `src/features/dashboard/components/MobileHeader.tsx`
**Type**: Client Component (`"use client"`)

```typescript
interface MobileHeaderProps {
  user: {
    name: string;
    email: string;
  };
}
```

**Renders**: Fixed top bar, mobile only.
- Container: `flex md:hidden h-14 border-b bg-background items-center justify-between px-4`
- Left: `Button[variant=ghost][size=icon]` with `Menu` icon — opens Sheet
- Center: `AppLogo size="sm"`
- Right: `UserMenu`
- Sheet: `side="left"`, controlled (`open` / `onOpenChange`)
  - Sheet content: `AppLogo size="md"` + `NavLinks onNavigate={() => setOpen(false)}`

**Used by**: `src/app/(dashboard)/layout.tsx`

---

## DashboardLayout (src/app/(dashboard)/layout.tsx)

Not a reusable component but included here as a contract for the layout's render output and data dependencies.

**Type**: Server Component (async)

**Props**: `{ children: React.ReactNode }` (Next.js layout convention)

**Data dependency**: `getUserById()` from `src/data/user.ts`
- On success: renders shell with `user = { name, email }`
- On error (any thrown error): calls `redirect("/login")`

**Render structure**:
```
div.flex.h-screen.overflow-hidden
  <Sidebar user={user} />
  div.flex.flex-col.flex-1.overflow-hidden
    <MobileHeader user={user} />
    main.flex-1.overflow-y-auto.p-6
      {children}
```

---

## getUserById (src/data/user.ts)

Data function contract.

```typescript
async function getUserById(): Promise<User>
```

**Throws**:
- `Error("Unauthorized")` — `getSession()` returns `null`
- `Error("User not found")` — `userRepository.findById` returns `null`

**Returns**: `User` from `src/types/auth.ts` (`{ id, name, email, createdAt, updatedAt }`)

**Does NOT**: accept a `userId` argument — reads session internally (constitution Principle II)

---

## findById (src/server/repositories/user.repository.ts)

Repository method contract.

```typescript
async function findById(id: string): Promise<User | null>
```

**Query**: `prisma.user.findUnique({ where: { id }, select: { id, name, email, createdAt, updatedAt } })`

**Returns**: Mapped `User` (no `password` field) or `null`

**Does NOT**: call `getSession()` — receives `userId` from the data function (constitution layer separation)

---

## navItems (src/constants/navigation.ts)

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

const navItems: NavItem[]  // export as const
```

5 entries — see data-model.md for the full table.
