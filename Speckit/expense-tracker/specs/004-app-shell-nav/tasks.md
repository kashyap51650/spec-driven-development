# Tasks: App Shell Navigation

**Input**: Design documents from `specs/004-app-shell-nav/`

**Prerequisites**: [plan.md](./plan.md) | [spec.md](./spec.md) | [data-model.md](./data-model.md) | [contracts/component-props.md](./contracts/component-props.md) | [research.md](./research.md) | [quickstart.md](./quickstart.md)

**User Stories**:
- US1: Authenticated Desktop Navigation (P1)
- US2: Authenticated Mobile Navigation (P1)
- US3: User Identity and Logout (P2)
- US4: Unauthenticated Access Protection (P1)
- US5: Section Placeholder Pages with Loading States (P3)

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no shared dependencies)
- **[Story]**: User story this task belongs to
- All paths are relative to the repository root

---

## Phase 1: Setup

**Purpose**: Install required UI components and define navigation configuration before any component is written.

**⚠️ CRITICAL**: Layer 1 (Shadcn installs) must complete before any component file is created. Verify each component is absent from `src/components/ui/` before installing.

- [x] T001 Install 7 Shadcn components by running in sequence: `npx shadcn@latest add separator`, `npx shadcn@latest add avatar`, `npx shadcn@latest add dropdown-menu`, `npx shadcn@latest add sheet`, `npx shadcn@latest add scroll-area`, `npx shadcn@latest add skeleton`, `npx shadcn@latest add tooltip` — confirm each file appears under `src/components/ui/`
- [x] T002 Create `src/constants/navigation.ts` — export `interface NavItem { label: string; href: string; icon: LucideIcon }` and `export const navItems: NavItem[]` with 5 entries: Dashboard (`/dashboard`, `LayoutDashboard`), Expenses (`/expenses`, `ArrowDownCircle`), Income (`/income`, `ArrowUpCircle`), Transfers (`/transfers`, `ArrowLeftRight`), Budgets (`/budgets`, `PiggyBank`) — all icons from `lucide-react`

**Checkpoint**: Shadcn components present in `src/components/ui/`; `navItems` exported and TypeScript-valid.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Data access layer and shared AppLogo component. All user story phases depend on these being complete.

**⚠️ CRITICAL**: No shell component work can begin until T003–T005 are complete.

- [x] T003 Create `src/server/repositories/user.repository.ts` — export `async function findById(id: string): Promise<User | null>` using `db.user.findUnique({ where: { id }, select: { id: true, name: true, email: true, createdAt: true, updatedAt: true } })` — map result to `User` from `src/types/auth.ts`; never select `password`; import `db` from `src/lib/prisma.ts`
- [x] T004 Create `src/data/user.ts` — export `async function getUserById(): Promise<User>` that calls `getSession()` from `src/lib/auth.ts` (throws `new Error("Unauthorized")` if null), then calls `findById(session.userId)` from the user repository (throws `new Error("User not found")` if null), and returns the `User` directly — no envelope wrapper; explicit return type annotation required
- [x] T005 [P] Create `src/components/shared/AppLogo.tsx` — Server Component; `interface AppLogoProps { size?: "sm" | "md" | "lg" }`; default size `"md"`; render `Wallet` icon from `lucide-react` + "Expense Tracker" text in a `div` with `className="flex items-center gap-2"`; size map: `sm` → icon `h-4 w-4` + text `text-sm font-semibold`, `md` → icon `h-5 w-5` + text `text-base font-semibold`, `lg` → icon `h-6 w-6` + text `text-lg font-bold`

**Checkpoint**: `getUserById()` can be imported; `AppLogo` renders at all three sizes without TypeScript errors.

---

## Phase 3: US1 + US2 + US3 + US4 — Navigation Shell (P1 / P2)

**Goal**: Deliver the complete authenticated shell — desktop sidebar (US1), mobile header + drawer (US2), user identity + logout dropdown (US3), and layout-level session guard (US4). These four stories are implemented together because they share components and are connected through the single layout file.

**Independent test criteria**:
- Log in → desktop viewport shows sidebar with 5 links, user name, avatar
- Log in → mobile viewport shows header + hamburger; tapping opens drawer; tapping link closes drawer
- Click avatar → dropdown shows name, email, logout; logout clears session and redirects to `/login`
- Clear cookies → direct navigation to `/dashboard` redirects to `/login`

See [quickstart.md](./quickstart.md) scenarios S1–S5 for step-by-step validation.

- [x] T006 [P] [US1] Create `src/features/dashboard/components/NavLinks.tsx` — `"use client"`; `interface NavLinksProps { onNavigate?: () => void }`; import `navItems` from `src/constants/navigation.ts`; use `usePathname()` from `next/navigation`; active rule: `/dashboard` uses exact match (`pathname === href`), all others use prefix match (`pathname.startsWith(href)`); active classes: `bg-accent text-accent-foreground font-medium`; inactive classes: `text-muted-foreground hover:bg-accent hover:text-accent-foreground`; each link: Next.js `Link` wrapping `flex items-center gap-3 px-3 py-2 rounded-md text-sm` with icon + label; call `onNavigate?.()` on every link click; wrap all links in Shadcn `ScrollArea`
- [x] T007 [P] [US3] Create `src/features/dashboard/components/UserMenu.tsx` — `"use client"`; `interface UserMenuProps { user: { name: string; email: string } }`; initials helper: `name.split(" ").map(w => w[0]).join("").slice(0, 2).toUpperCase()`; Shadcn `DropdownMenu` with `DropdownMenuTrigger` wrapping `Avatar` + `AvatarFallback` (initials); `DropdownMenuContent` contains: non-interactive `div` with user name (`font-medium`), non-interactive `div` with user email (`text-sm text-muted-foreground`), `DropdownMenuSeparator`, then a `DropdownMenuItem` for logout — use `useTransition` from React, call `startTransition(() => logoutAction())` from `src/actions/auth.actions.ts`; while `isPending` show "Logging out…" text and disable the item; include `LogOut` icon from `lucide-react` in the logout item
- [x] T008 [US1] Create `src/features/dashboard/components/Sidebar.tsx` — Server Component; `interface SidebarProps { user: { name: string; email: string } }`; outer element: `aside` with `className="hidden md:flex flex-col h-screen w-60 border-r bg-background"`; top section: `div className="px-4 py-5"` containing `<AppLogo size="md" />`; middle section: `nav className="flex-1 px-3 py-2 overflow-hidden"` containing `<NavLinks />`; bottom section: `div className="px-4 py-3"` containing `<Separator />` then `<UserMenu user={user} />` — depends on T006 and T007 completing first
- [x] T009 [US2] Create `src/features/dashboard/components/MobileHeader.tsx` — `"use client"`; `interface MobileHeaderProps { user: { name: string; email: string } }`; `const [open, setOpen] = useState(false)`; outer: `header className="flex md:hidden h-14 border-b bg-background items-center justify-between px-4"`; left: `Button variant="ghost" size="icon" onClick={() => setOpen(true)}` with `Menu` icon from `lucide-react`; center: `<AppLogo size="sm" />`; right: `<UserMenu user={user} />`; after the header: `Sheet open={open} onOpenChange={setOpen}` with `side="left"`, `SheetContent className="flex flex-col h-full w-60"` containing `div className="p-4"` with `<AppLogo size="md" />` and `<NavLinks onNavigate={() => setOpen(false)} />` — depends on T006 and T007 completing first
- [x] T010 [US4] Create `src/app/(dashboard)/layout.tsx` — Server Component; `interface DashboardLayoutProps { children: React.ReactNode }`; wrap body in `try/catch`; call `const user = await getUserById()` from `src/data/user.ts`; on any error call `redirect("/login")` from `next/navigation`; render: `div className="flex h-screen overflow-hidden"` containing `<Sidebar user={{ name: user.name, email: user.email }} />` and `div className="flex flex-col flex-1 overflow-hidden"` containing `<MobileHeader user={{ name: user.name, email: user.email }} />` and `main className="flex-1 overflow-y-auto p-6"` with `{children}` — depends on T008 and T009 completing first

**Checkpoint**: Start dev server (`npm run dev`), verify all 4 user story tests in [quickstart.md](./quickstart.md) S1–S5 pass.

---

## Phase 4: US5 — Placeholder Pages, Loading Skeletons, Error Boundaries (P3)

**Goal**: Give each of the 5 sections a working placeholder page, a skeleton loading state, and an error boundary — completing the navigable shell and satisfying Constitution Principle VIII (`loading.tsx` + `error.tsx` per page).

**Independent test criteria**:
- Navigate to each of 5 sections → see section heading + "Coming soon."
- Throttle network → loading skeleton visible before page loads
- See [quickstart.md](./quickstart.md) scenarios S6–S7 for validation steps

- [x] T011 [P] [US5] Replace `src/app/(dashboard)/dashboard/page.tsx` — Server Component (no `getSession()` call — layout guards the route); render `<h1>Dashboard</h1><p>Coming soon.</p>`; remove the existing inline session check, logout form, and Button import
- [x] T012 [P] [US5] Create `src/app/(dashboard)/expenses/page.tsx` — Server Component; render `<h1>Expenses</h1><p>Coming soon.</p>`
- [x] T013 [P] [US5] Create `src/app/(dashboard)/income/page.tsx` — Server Component; render `<h1>Income</h1><p>Coming soon.</p>`
- [x] T014 [P] [US5] Create `src/app/(dashboard)/transfers/page.tsx` — Server Component; render `<h1>Transfers</h1><p>Coming soon.</p>`
- [x] T015 [P] [US5] Create `src/app/(dashboard)/budgets/page.tsx` — Server Component; render `<h1>Budgets</h1><p>Coming soon.</p>`
- [x] T016 [P] [US5] Create `src/app/(dashboard)/dashboard/loading.tsx` — import `Skeleton` from `src/components/ui/skeleton`; render `div className="space-y-4"` containing `div className="grid grid-cols-4 gap-4"` with 4× `Skeleton className="h-28 rounded-lg"` followed by `Skeleton className="h-72 rounded-lg"`
- [x] T017 [P] [US5] Create `src/app/(dashboard)/expenses/loading.tsx` — import `Skeleton`; render `div className="space-y-4"` containing `Skeleton className="h-10 rounded-md"` (toolbar row) then `div className="flex flex-col gap-2"` with 5× `Skeleton className="h-12 rounded-md"` (table rows)
- [x] T018 [P] [US5] Create `src/app/(dashboard)/income/loading.tsx` — identical structure to T017 (toolbar skeleton + 5 table row skeletons)
- [x] T019 [P] [US5] Create `src/app/(dashboard)/transfers/loading.tsx` — identical structure to T017
- [x] T020 [P] [US5] Create `src/app/(dashboard)/budgets/loading.tsx` — identical structure to T017
- [x] T021 [P] [US5] Create `src/app/(dashboard)/dashboard/error.tsx` — `"use client"`; `interface ErrorProps { error: Error & { digest?: string }; reset: () => void }`; render error message in `p` tag and a "Try again" `button` calling `reset()`
- [x] T022 [P] [US5] Create `src/app/(dashboard)/expenses/error.tsx` — identical structure to T021
- [x] T023 [P] [US5] Create `src/app/(dashboard)/income/error.tsx` — identical structure to T021
- [x] T024 [P] [US5] Create `src/app/(dashboard)/transfers/error.tsx` — identical structure to T021
- [x] T025 [P] [US5] Create `src/app/(dashboard)/budgets/error.tsx` — identical structure to T021

**Checkpoint**: Navigate to all 5 sections — each shows correct heading + "Coming soon." message.

---

## Phase 5: Polish & Validation

**Purpose**: Compile-time validation and end-to-end smoke test of the complete feature.

- [x] T026 Run `npx tsc --noEmit` from the repo root and fix every TypeScript error until the command exits with zero errors — pay special attention to: `LucideIcon` type import in `navigation.ts`, explicit return types on `getUserById` and `findById`, `interface` (not `type`) for all prop shapes, no `any` usage
- [ ] T027 Start the dev server (`npm run dev`), run all 8 validation scenarios from [quickstart.md](./quickstart.md) manually, confirm: unauthenticated redirect (S1), desktop shell (S2), active link state (S3), mobile drawer (S4), logout flow (S5), single-word initials (S6), loading skeletons (S7), TypeScript clean (S8)

---

## Dependency Graph

```
T001 (Shadcn install)
  └─→ T002 (navigation.ts)
        ├─→ T003 (user.repository.ts)
        │     └─→ T004 (getUserById)
        │           └─→ T005 (AppLogo) ─┐
        │                               ├─→ T006 (NavLinks) ─┐
        │                               │                     ├─→ T008 (Sidebar) ─┐
        │                               │                     │                    ├─→ T010 (Layout)
        │                               │                     └─→ T009 (MobileHeader)─┘
        │                               └─→ T007 (UserMenu) ─┘
        │
        └─→ T011–T025 (pages/loading/error) ← after T010
              └─→ T026 (tsc --noEmit)
                    └─→ T027 (quickstart validation)
```

**Story completion order**: US4 (layout, T010) must be done before placeholder pages are testable. US1+US2+US3 all complete together at T010. US5 completes at T025.

---

## Parallel Execution Opportunities

### Within Phase 2
- T005 (AppLogo) can start as soon as T001+T002 complete — it has no dependency on T003/T004

### Within Phase 3
- **T006 + T007 in parallel** — NavLinks and UserMenu have no dependency on each other
- **T008 + T009 in parallel** — Sidebar and MobileHeader both depend on T006+T007 but not on each other

### Within Phase 4
- **T011–T025 all in parallel** — 15 independent files once T010 is complete

---

## Implementation Strategy

**MVP scope** (deliver US1+US2+US3+US4 first): Complete Phase 1 → Phase 2 → Phase 3 (T001–T010). This produces a fully working, navigable authenticated shell with session protection and logout. The placeholder pages (T011–T015) exist but currently lack the shell wrapping.

**Full delivery**: Add Phase 4 (T011–T025) to connect all 5 section pages into the shell with loading skeletons and error boundaries.

**Incremental order**: If implementing sequentially, follow T001 → T002 → T003 → T004 → T005 → T006 → T007 → T008 → T009 → T010 → T011–T025 → T026 → T027. Never skip to a later task before all tasks it depends on are complete.
