## Tasks — implement app shell

- [x] Add navigation constants — create `src/constants/navigation.ts` with typed `navItems`.
- [x] Shared components — add `src/components/shared/AppLogo.tsx`.
- [x] Dashboard components — implement `Sidebar` (server), `NavLinks` (client), `UserMenu` (client), `MobileHeader` (client).
- [x] Dashboard layout — add `src/app/(dashboard)/layout.tsx` and guard with `getSession()` redirect to `/login`.
- [x] Placeholder pages — add `page.tsx` + `loading.tsx` for dashboard, expenses, income, transfers, budgets.
- [x] Verify — run `npx tsc --noEmit` and `npm run lint`, fix issues unrelated to auth if needed.

Notes:

- Implementation files were added to the repo; verification remains pending due to an unrelated type error in `src/lib/auth.ts`.
