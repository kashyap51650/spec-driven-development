## Context

The expense tracker app uses Next.js with a Server Component-first architecture. The `src/data/` layer handles session authentication and delegates to services; services delegate to repositories which use Prisma. The `app/(dashboard)/` route group is protected by a layout that redirects unauthenticated users.

Expense and Income modules follow a layered pattern:
```
src/data/<domain>.ts          ← session gate, calls service
src/server/services/<domain>  ← business logic
src/server/repositories/<domain> ← Prisma queries
```

The Dashboard must aggregate data from both domains without coupling them — a new dashboard repository queries Prisma directly against both models using read-only aggregations.

## Goals / Non-Goals

**Goals:**
- Single-page dashboard showing financial summary for the current month
- Server-side data fetching only — no client state, no `useEffect`, no TanStack Query
- Parallel fetching (all four queries run concurrently via `Promise.all`)
- Recharts area chart as the only client component (required by the library)
- Suspense-based loading skeleton for perceived performance
- Empty/welcome state for new users with zero data

**Non-Goals:**
- Date range filtering on the dashboard (future feature)
- Real-time updates or polling
- Drill-down navigation from summary cards
- Any mutations (no forms, no server actions)
- Route Handlers or API endpoints

## Decisions

### D1 — Dashboard Repository queries Prisma directly (not via existing services)

**Decision**: `dashboard.repository.ts` imports Prisma and runs its own queries rather than calling `expense.service` or `income.service`.

**Rationale**: The dashboard needs aggregations (sums, groupings, cross-domain merges) that the existing CRUD services don't expose. Adding these methods to the existing services would violate their single-responsibility and bloat their APIs for a single consumer. A dedicated repository owns all dashboard-specific reads.

**Alternative considered**: Calling `getAll()` on both services and computing aggregations in JavaScript. Rejected: moves aggregation work out of the database, loads all rows into memory, and is O(n) instead of O(1) for sums.

---

### D2 — All four queries run in `Promise.all` inside the service layer

**Decision**: `dashboard.service.ts` calls `getSummary`, `getMonthlyTrends`, `getCategoryBreakdown`, and `getRecentTransactions` in a single `Promise.all`.

**Rationale**: The four queries are independent. Running them sequentially would add their latencies; running in parallel brings total latency close to the slowest query. The service layer is the right place for this coordination — it keeps the data layer and page thin.

**Alternative considered**: Using `Suspense` with separate server fetches per section. Rejected: adds route complexity and makes it harder to share the session context; the parallel `Promise.all` in a single async Server Component achieves the same perceived performance with simpler code.

---

### D3 — Monthly trends computed in JavaScript, not via Prisma `groupBy`

**Decision**: `getMonthlyTrends` fetches rows for the past N months and groups them by month in JavaScript.

**Rationale**: Prisma's `groupBy` on date fields requires truncating to month, which varies by database dialect. Doing the grouping in JavaScript is portable, readable, and fast enough for the expected data volumes (a few hundred rows per user). The query is still scoped to a date range so the result set is bounded.

**Alternative considered**: Raw SQL with `DATE_TRUNC`. Rejected: breaks Prisma abstraction and requires database-specific queries; premature optimization for this scale.

---

### D4 — `MonthlyTrendChart` is the only `"use client"` component

**Decision**: Only `MonthlyTrendChart.tsx` carries `"use client"`. All other components are Server Components.

**Rationale**: Recharts requires browser APIs and cannot render on the server. Every other component is pure presentation over props — no interactivity, no browser APIs. Keeping the client boundary as small as possible minimizes the JavaScript shipped to the browser.

---

### D5 — `RecentTransaction` is a unified type mapped at the repository layer

**Decision**: The repository merges expenses and incomes into a `RecentTransaction[]` shape before returning.

**Rationale**: The UI component (`RecentTransactionsList`) should not know about the distinction between `Expense` and `Income` model shapes. Mapping at the repository boundary keeps the component simple and the types clean. The discriminating `type` field preserves the distinction for display logic.

## Risks / Trade-offs

- **Stale data on navigation**: Next.js Server Components cache by default. If a user adds an expense and returns to the dashboard, they may see stale totals until the cache revalidates. Mitigation: configure `revalidate = 0` on the dashboard page or rely on Next.js default dynamic rendering (no static generation).

- **Monthly trends in JavaScript**: Loading all rows for the past 6 months to group in JS means the query scales linearly with user data volume. For users with thousands of transactions per month this could slow down. Mitigation: acceptable at MVP scale; migrate to `groupBy` with raw SQL if p95 query time exceeds 200ms.

- **Recharts bundle size**: Including Recharts adds ~100 kB gzipped to the client bundle. Mitigation: the chart component is lazy-loadable with Next.js dynamic imports if bundle size becomes a concern.

- **Category breakdown limited to 6**: Showing only the top 6 categories silently truncates data. Mitigation: the "and N more" label ensures users know data is truncated; a full breakdown view can be added to the Expenses module later.

## Open Questions

- Should the dashboard default to the current calendar month or a rolling 30-day window? (Current design uses calendar month; easy to change in the service layer.)
- Should the savings rate be shown as a percentage of gross income or of take-home? (Current design uses gross income as denominator.)
