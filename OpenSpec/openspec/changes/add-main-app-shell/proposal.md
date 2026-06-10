# Add main app shell (sidebar + navigation)

What: Add a top-level authenticated application shell for the Expense Tracker app. This includes a desktop sidebar, a mobile header with a slide-in sheet, navigation links, a user menu with logout, and placeholder pages/loading states for the primary dashboard routes.

Why: The project currently has authentication in place but no consolidated application layout for the authenticated area. Adding a shell provides consistent navigation, a place to mount future features, and a UX baseline for desktop and mobile.

Scope & Constraints:

- Server components by default; only lightweight client components where interaction is required (mobile sheet, active link highlighting, dropdown interactions).
- No changes to auth, middleware, or Prisma schema.
- No data fetching in this step — shell only.

Files added (overview):

- `src/constants/navigation.ts` — typed nav config
- `src/components/shared/AppLogo.tsx` — shared logo
- `src/features/dashboard/components/*` — Sidebar, NavLinks (client), UserMenu (client), MobileHeader (client)
- `src/app/(dashboard)/layout.tsx` — guarded dashboard layout using `getSession()`
- Placeholder pages and `loading.tsx` for: dashboard, expenses, income, transfers, budgets

Next: Run `/opsx:apply` to begin implementing the change in the codebase (already implemented here).
