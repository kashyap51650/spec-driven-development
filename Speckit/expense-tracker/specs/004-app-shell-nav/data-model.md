# Data Model: App Shell Navigation

**Feature**: `004-app-shell-nav` | **Date**: 2026-06-09

This feature introduces no new database entities. It reads from the existing `User` collection and defines two client-side types: `UserDisplay` (a prop shape used by UI components) and `NavItem` (the navigation configuration type).

---

## Existing Entity: User (read-only in this feature)

Defined in `src/types/auth.ts`. No schema changes.

| Field | Type | Source | Notes |
|---|---|---|---|
| `id` | `string` | MongoDB ObjectId | Primary key |
| `name` | `string` | DB | Full display name (e.g., "Jane Smith") |
| `email` | `string` | DB | Lowercase-normalised on write |
| `createdAt` | `Date` | DB | Auto-set on create |
| `updatedAt` | `Date` | DB | Auto-updated on write |

**Constraints**:
- `email` is unique
- `password` is NEVER selected in any query in this feature (excluded via `select` in repository)

**Access pattern**: Read by `id` only. `getUserById()` calls `userRepository.findById(session.userId)` which maps to `prisma.user.findUnique({ where: { id }, select: { id, name, email, createdAt, updatedAt } })`.

---

## New Type: UserDisplay (prop shape, not persisted)

Used as the prop type for navigation shell components (`Sidebar`, `UserMenu`, `MobileHeader`). A projection of `User` containing only what the UI needs.

```typescript
interface UserDisplay {
  name: string;
  email: string;
}
```

**Derivation**: The layout calls `getUserById()`, receives a full `User`, and passes `{ name: user.name, email: user.email }` to shell components. This limits the surface area of data flowing into client components.

**Validation rules**:
- `name` — expected to be non-empty; derived from user registration; no runtime guard needed in shell components
- Initials for `UserMenu` avatar: first letter of each space-separated word, max 2 chars, uppercased

---

## New Type: NavItem (config type, not persisted)

Defined in `src/constants/navigation.ts`. Represents a single navigation link entry.

```typescript
interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}
```

| Field | Type | Description |
|---|---|---|
| `label` | `string` | Human-readable section name shown in nav |
| `href` | `string` | Absolute path used for routing and active-state detection |
| `icon` | `LucideIcon` | React component from `lucide-react` |

**Static data** (all five items):

| label | href | icon |
|---|---|---|
| Dashboard | /dashboard | LayoutDashboard |
| Expenses | /expenses | ArrowDownCircle |
| Income | /income | ArrowUpCircle |
| Transfers | /transfers | ArrowLeftRight |
| Budgets | /budgets | PiggyBank |

**Active-state rules** (used in `NavLinks.tsx`):
- `/dashboard`: exact match — `pathname === "/dashboard"`
- All others: prefix match — `pathname.startsWith(href)`

---

## Data Flow Diagram

```
JWT cookie (httpOnly)
  ↓ getSession() [src/lib/auth.ts]
  → JwtPayload { userId, email }
  ↓ getUserById() [src/data/user.ts]
  → userRepository.findById(userId) [src/server/repositories/user.repository.ts]
  → prisma.user.findUnique({ id: userId })
  → User { id, name, email, createdAt, updatedAt }
  ↓ layout.tsx extracts { name, email }
  → UserDisplay passed as props to Sidebar / MobileHeader
  → UserMenu renders avatar initials + logout dropdown
  → NavLinks reads navItems[] (static, no DB)
```

---

## No Schema Migrations Required

This feature adds no new Prisma models, fields, or indexes. The `User` model is read-only from the perspective of this feature.
