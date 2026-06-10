# Feature Specification: App Shell Navigation

**Feature Branch**: `004-app-shell-nav`

**Created**: 2026-06-09

**Status**: Draft

**Input**: User description: "Build the main application shell for the expense tracker. Authentication is already complete. This step adds the persistent navigation structure that all authenticated pages share."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Authenticated Desktop Navigation (Priority: P1)

A logged-in user opens the expense tracker on a desktop browser. They immediately see a fixed vertical sidebar on the left containing the app logo, links to all five main sections (Dashboard, Expenses, Income, Transfers, Budgets), their display name, and a logout option. The currently active section is visually distinct from the others. Clicking any section link navigates to that section.

**Why this priority**: This is the primary navigation experience for the majority of users. All other features depend on this navigation shell being in place.

**Independent Test**: Can be fully tested by logging in and verifying the sidebar appears with correct links and active highlighting.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a desktop browser (≥768px wide), **When** they view any protected page, **Then** a fixed sidebar is visible on the left showing the app logo, all five section links, the user's name, and a logout button.
2. **Given** a sidebar with five navigation links, **When** the user is on the Dashboard page, **Then** the Dashboard link is visually highlighted (active) and all others are not.
3. **Given** an active sidebar, **When** the user clicks the "Expenses" link, **Then** they are navigated to the Expenses section and the Expenses link becomes the active/highlighted item.

---

### User Story 2 - Authenticated Mobile Navigation (Priority: P1)

A logged-in user opens the expense tracker on a mobile device. A fixed top header bar is visible at all times, showing the app logo in the center, a hamburger menu button on the left, and a user avatar on the right. Tapping the hamburger button opens a slide-in drawer from the left containing the app logo and all five section links. Tapping any link navigates to that section and automatically closes the drawer.

**Why this priority**: Equivalent in importance to desktop navigation — mobile users must have full access to all sections without a degraded experience.

**Independent Test**: Can be tested on a viewport below 768px by verifying the header appears, the drawer opens on tap, navigation works, and the drawer auto-closes.

**Acceptance Scenarios**:

1. **Given** an authenticated user on a mobile browser (<768px wide), **When** they view any protected page, **Then** a fixed top header bar is visible with a menu button, app logo, and user avatar; no sidebar is shown.
2. **Given** the mobile header, **When** the user taps the hamburger menu button, **Then** a drawer slides in from the left containing the app logo and all five section links.
3. **Given** the open navigation drawer, **When** the user taps any section link, **Then** they are navigated to that section and the drawer closes automatically.

---

### User Story 3 - User Identity and Logout (Priority: P2)

The navigation displays the logged-in user's name, confirming their identity at a glance. A logout option is accessible from the navigation. Selecting logout ends the session immediately and redirects the user to the login page. While the logout operation is processing, a loading indicator is shown.

**Why this priority**: User identity confirmation and secure logout are trust-critical features, but secondary to establishing navigation access.

**Independent Test**: Can be tested by verifying the user's name appears correctly, tapping logout redirects to /login, and the session cookie is cleared.

**Acceptance Scenarios**:

1. **Given** a logged-in user viewing any protected page, **When** they look at the navigation, **Then** their display name is visible (derived from their full account name, not their email address).
2. **Given** a user who taps the user avatar/menu trigger in the navigation, **When** they select "Logout", **Then** their session is terminated and they are redirected to `/login`.
3. **Given** the logout process has been initiated, **When** it is in progress, **Then** the logout button/item shows a loading state to prevent double-submission.

---

### User Story 4 - Unauthenticated Access Protection (Priority: P1)

Any user who attempts to access a protected page without a valid session is immediately redirected to the login page. The navigation shell is never rendered for unauthenticated users.

**Why this priority**: Security boundary — all authenticated content must be gated.

**Independent Test**: Can be tested by clearing session cookies and navigating directly to `/dashboard` or any other protected route.

**Acceptance Scenarios**:

1. **Given** a user with no valid session, **When** they navigate directly to any URL under the authenticated section, **Then** they are redirected to `/login` without seeing any protected content.
2. **Given** an authenticated user whose session has expired, **When** they attempt to load a protected page, **Then** they are redirected to `/login`.

---

### User Story 5 - Section Placeholder Pages with Loading States (Priority: P3)

Each of the five navigation sections (Dashboard, Expenses, Income, Transfers, Budgets) has a placeholder page. The placeholder displays the section name as a prominent heading and a "Coming soon" message. Each page also has a loading skeleton that appears while the page is being prepared, ensuring the layout infrastructure is ready for future real content.

**Why this priority**: Placeholder pages provide navigational completeness. The loading skeleton infrastructure is foundational for future content development.

**Independent Test**: Can be tested by navigating to each section and verifying the heading, message, and skeleton layout all render correctly.

**Acceptance Scenarios**:

1. **Given** an authenticated user who navigates to any of the five sections, **When** the page loads, **Then** they see the section name as a heading and a "Coming soon" message.
2. **Given** a page that is loading, **When** data is being fetched or the page is rendering, **Then** a skeleton layout matching the section's intended structure is shown before content appears.
3. **Given** the Dashboard loading state, **When** displayed, **Then** it shows four stat card skeletons in a grid row and a large chart skeleton below.
4. **Given** Expenses, Income, Transfers, or Budgets loading state, **When** displayed, **Then** it shows a toolbar skeleton row followed by a table skeleton with five rows.

---

### Edge Cases

- What happens when the user's name is a single word? The avatar initials should show just one letter.
- What happens when the session becomes invalid mid-session (token expires)? Navigation to a new page should redirect to `/login`.
- What happens if the user record cannot be fetched from the database? The system should throw an "Unauthorized" error, which propagates to the nearest error boundary.
- What happens when the user double-taps the logout button? The loading state during logout prevents double-submission.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST redirect unauthenticated users attempting to access any protected page to `/login`.
- **FR-002**: Authenticated users on desktop (viewport ≥768px) MUST see a fixed left sidebar containing the app logo, five section navigation links, the user's display name, and a logout option.
- **FR-003**: Authenticated users on mobile (viewport <768px) MUST see a fixed top header bar containing a hamburger menu button, the app logo, and a user avatar/menu trigger; the sidebar MUST NOT be visible on mobile.
- **FR-004**: The navigation MUST include exactly five sections: Dashboard, Expenses, Income, Transfers, Budgets — each linking to its respective route.
- **FR-005**: The currently active navigation section MUST be visually highlighted with a distinct background and foreground colour; inactive links MUST use a muted foreground and show a hover background on pointer interaction.
- **FR-006**: Dashboard section active state MUST be determined by exact URL match only; all other sections MUST use prefix-based URL matching for their active state.
- **FR-007**: The mobile hamburger menu MUST open a slide-in drawer from the left containing the app logo and the same five navigation links.
- **FR-008**: Tapping any navigation link inside the mobile drawer MUST close the drawer immediately after navigation.
- **FR-009**: The user's display name shown in the navigation MUST be fetched from the full user record using the session's user ID (not derived from the JWT payload alone, which contains only userId and email).
- **FR-010**: The navigation MUST provide a logout option accessible via a dropdown triggered by the user avatar; the dropdown MUST show the user's name (non-interactive), the user's email (non-interactive), a separator, and a logout action.
- **FR-011**: The user avatar MUST display the user's initials: the first letter of each word in their name, capped at two letters.
- **FR-012**: The logout action MUST show a loading state while the session termination is in progress.
- **FR-013**: After successful logout, the user MUST be redirected to `/login`.
- **FR-014**: Each of the five sections MUST have a placeholder page displaying the section name as a heading and the message "Coming soon."
- **FR-015**: Each section page MUST have a dedicated loading skeleton that is displayed while the page content is being prepared.
- **FR-016**: The Dashboard loading skeleton MUST consist of four stat card skeletons in a grid row and a large chart skeleton below.
- **FR-017**: The Expenses, Income, Transfers, and Budgets loading skeletons MUST each consist of a toolbar skeleton row and a table skeleton with five rows.

### Key Entities

- **User**: Represents the authenticated account holder. Key attributes: unique identifier, display name, email address. The display name is stored in the database and retrieved via the user ID from the session.
- **Session**: Represents the authenticated state of the current user. Contains the user's ID and email (from JWT). Used to gate access to all protected pages and to retrieve the full user record.
- **NavItem**: Represents a single navigation link. Attributes: human-readable label, destination route path, associated icon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An authenticated user can navigate to any of the five sections within 2 taps/clicks from any protected page.
- **SC-002**: The navigation shell renders and is fully interactive within 1 second of the protected page loading on a standard broadband connection.
- **SC-003**: Unauthenticated direct URL access to any protected route results in a redirect to `/login` with no protected content rendered.
- **SC-004**: The active navigation item correctly reflects the current page on 100% of navigation interactions across both desktop and mobile.
- **SC-005**: The logout flow completes (session cleared + redirect to `/login`) within 2 seconds of the user initiating logout.
- **SC-006**: The mobile navigation drawer opens and closes smoothly, with link taps triggering navigation and drawer closure without additional user interaction.

## Assumptions

- Authentication infrastructure is fully implemented: `getSession()` returns the decoded JWT payload or `null`; `logoutAction` is available in `src/actions/auth.actions.ts`.
- The user record in the database contains a display name field accessible via the user's ID.
- All five navigation sections will have real content implemented in future features; this feature only establishes the shell and placeholder pages.
- The Shadcn UI component library is installed and configured in the project; specific components (Avatar, DropdownMenu, Sheet, ScrollArea, Skeleton, Separator, Tooltip) will be added via the Shadcn CLI before implementation.
- The app uses a route group structure: `app/(dashboard)/` for authenticated pages; the shared layout at `app/(dashboard)/layout.tsx` is the single point for session validation across all authenticated routes.
- Middleware at the repository root also protects `/dashboard/*` routes (defence in depth), complementing the layout-level session check.
- Navigation links use icons from the `lucide-react` library already present in the project.

## Clarifications

### Session 2026-06-09

- Q: How is the authenticated layout structured and where does session validation occur? → A: `app/(dashboard)/layout.tsx` is a Server Component. It calls `getSession()`; if no session, it calls `redirect("/login")`. It fetches the full user record from the database via `getUserById(userId)` in `src/data/user.ts` to obtain the display name (JWT contains only userId and email). It renders the Sidebar and main content area, passing `{ name, email }` to child components. `getUserById` calls `getSession()` internally, fetches from the repository, and returns `User` or throws `"Unauthorized"`.
- Q: What are the exact layout and visibility rules for the Sidebar component? → A: `Sidebar.tsx` is a Server Component. Props: `{ user: { name: string; email: string } }`. Width: `w-60`, full height: `h-screen`. Hidden on mobile: `hidden md:flex md:flex-col`. Contains: `AppLogo` at top, `NavLinks` in middle (`flex-1`), `UserMenu` pinned to bottom.
- Q: How does active link detection work in NavLinks? → A: `NavLinks.tsx` is a Client Component. Uses `usePathname()` for active state. Active rule: `/dashboard` uses exact match only; all others use `startsWith` match. Active styles: highlighted background + accent foreground. Inactive styles: muted foreground + hover background. Each link shows icon + label side by side. Wrapped in Shadcn `ScrollArea`. Accepts optional `onNavigate?: () => void` prop; calls it after any link click (used by mobile sheet to close the drawer).
- Q: How does the UserMenu component work and handle logout? → A: `UserMenu.tsx` is a Client Component. Props: `{ user: { name: string; email: string } }`. Trigger is a Shadcn `Avatar` showing initials (first letter of each word in name, max 2 letters). Dropdown shows: user name (non-clickable, `font-medium`), user email (non-clickable, `text-muted-foreground text-sm`), `Separator`, then a Logout item that calls `logoutAction` from `src/actions/auth.actions.ts` inside `startTransition` and shows a loading state while pending.
- Q: How is the mobile header structured? → A: `MobileHeader.tsx` is a Client Component. Props: `{ user: { name: string; email: string } }`. Visible only on mobile: `flex md:hidden`. Fixed top bar, `h-14`, border-bottom, background. Left: Menu icon button opens a Sheet. Center: `AppLogo`. Right: `UserMenu`. Sheet `side="left"` contains `AppLogo` + `NavLinks`. Passes `onNavigate={() => setOpen(false)}` to `NavLinks` so clicking any link closes the sheet.
- Q: What are the navigation items, their routes, and icons? → A: Defined in `src/constants/navigation.ts` as `NavItem[]` with `{ label, href, icon }`. Items: Dashboard (`/dashboard`, `LayoutDashboard`), Expenses (`/expenses`, `ArrowDownCircle`), Income (`/income`, `ArrowUpCircle`), Transfers (`/transfers`, `ArrowLeftRight`), Budgets (`/budgets`, `PiggyBank`). Icons from `lucide-react`.
- Q: What Shadcn components must be installed before implementation? → A: `separator`, `avatar`, `dropdown-menu`, `sheet`, `scroll-area`, `skeleton`, `tooltip` — all installed via `npx shadcn@latest add <component>` before writing any code.
