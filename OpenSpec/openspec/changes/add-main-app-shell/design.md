# Design — App shell (sidebar + mobile sheet)

## Overview

The app shell is implemented as a server-level layout under `src/app/(dashboard)/layout.tsx`. The layout calls `getSession()` (from `src/lib/auth.ts`) and redirects unauthenticated users to `/login`.

## Structure

- `Sidebar` (server component)
  - Visible on desktop (`hidden md:flex`) and occupies a fixed width (`w-60`).
  - Contains `AppLogo` at top, `NavLinks` in the middle (fills remaining space), and `UserMenu` pinned to the bottom.

- `MobileHeader` (client component)
  - Visible on mobile (`flex md:hidden`).
  - Uses a Shadcn `Sheet` (left side) to show navigation on small screens. The sheet is controlled by local state and closes when a navigation link is clicked.

- `NavLinks` (client component)
  - Uses `usePathname()` to determine active link and applies the following matching rules:
    - `/dashboard` → exact match only
    - Other routes → `startsWith` match
  - Renders links from `src/constants/navigation.ts`.
  - Wrapped in `ScrollArea` to handle overflow.

- `UserMenu` (client component)
  - Uses Shadcn `Avatar` + `DropdownMenu`.
  - Logout implemented as a form that calls the server action `logoutAction` from `src/actions/auth.actions.ts`.

## Shadcn components

I installed missing shadcn components (separator, avatar, dropdown-menu, sheet, tooltip, scroll-area, skeleton) using the `npx shadcn@latest add ...` CLI before creating code that imports them.

## Notes on strict rules

- No auth files, middleware, or Prisma schema were modified.
- No data fetching was added; layout reads session only to guard access.
