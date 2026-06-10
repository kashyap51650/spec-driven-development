## Context

The expense-tracker Next.js app uses ShadCN UI as its design system, but adoption is inconsistent. Forms and dialogs already use ShadCN components correctly. However, the data tables (`ExpenseTable`, `IncomeTable`) use raw HTML table elements, and the filter bars (`ExpenseFiltersBar`, `IncomeFiltersBar`) use native `<input>`, `<select>`, and `<button>` with ad-hoc class names (`"input"`, `"btn"`). Action buttons (Edit, Delete) exist as ShadCN `Button` but carry only text labels — no icons. All required ShadCN primitives and `lucide-react` are already installed.

## Goals / Non-Goals

**Goals:**
- Replace all native HTML table elements with ShadCN `Table` family components
- Replace native `<input>`, `<select>`, `<button>` in filter bars with ShadCN `Input`, `Select`, `Button`
- Add Lucide icons to every action button for visual clarity
- Maintain existing filter/search/debounce behaviour exactly
- Keep all existing props, signatures, and functionality intact

**Non-Goals:**
- Adding new filter types or search behaviours
- Changing server actions, validation, or data fetching
- Changing auth page UI (already correctly uses ShadCN)
- Adding animations or new component variants beyond what's needed

## Decisions

### 1. ShadCN `Table` for data tables

**Decision:** Replace raw `<table>` with `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`.

**Rationale:** The ShadCN table component applies consistent border, spacing, and hover styling that matches the rest of the design system. It also adds `role` attributes for accessibility.

**Alternative considered:** Wrapping the existing table in a styled `div` — rejected because it doesn't standardise markup or add semantic attributes.

### 2. ShadCN `Select` (controlled) for filter dropdowns

**Decision:** Use ShadCN `Select` with `value` + `onValueChange` (controlled) instead of native `<select>` with `defaultValue`.

**Rationale:** ShadCN `Select` is a Radix-based popover and cannot be used as an uncontrolled native element. The filter bar already manages state through URL params via `setSearchParams`, so holding the selected value from the URL prop as `value` is natural.

**Alternative considered:** Keeping `defaultValue`-based uncontrolled — not possible with the Radix Select API.

### 3. Icons via Lucide React

**Decision:** Import icons directly from `lucide-react`: `Pencil` for Edit, `Trash2` for Delete, `Search` for the search input adornment, `SlidersHorizontal` for the filter label, `X` for Clear.

**Rationale:** `lucide-react` is already a project dependency. Using it consistently avoids adding a second icon library.

**Button pattern:** `<Button size="sm" variant="ghost">` with `<Pencil className="h-4 w-4" />` inside for icon-only or icon+text layouts.

### 4. Filter bar layout — controlled state from URL props

**Decision:** `ExpenseFiltersBar` and `IncomeFiltersBar` will derive their controlled `value` props from the URL search params passed in from the page (already passed as props: `category`, `search`, `startDate`, `endDate`).

**Rationale:** The filter bars are already driven by URL state; passing the prop as `value` to `Input` and `Select` makes the components fully controlled without adding local state.

## Risks / Trade-offs

- [ShadCN Select controlled value] The Select component shows an empty placeholder when `value` is `undefined`. Ensure `value={prop ?? ""}` is avoided for Select — pass `undefined` when nothing is selected to render the placeholder correctly. → Mitigation: Use `value={prop || undefined}` explicitly.
- [Table column widths] ShadCN Table does not set fixed column widths; the layout relies on content. → Mitigation: Add `className` width hints (`w-[120px]` etc.) on `TableHead` cells if columns shift during testing.
- [Filter bar responsiveness] Filter bars on mobile may overflow on small screens with multiple ShadCN `Input` + `Select` in a flex row. → Mitigation: Wrap in `flex-wrap gap-2` and add `min-w-[120px]` on inputs; existing mobile card view remains unchanged.
