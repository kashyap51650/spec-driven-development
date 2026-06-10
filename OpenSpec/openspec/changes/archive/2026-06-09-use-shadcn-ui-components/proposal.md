## Why

The expense tracker UI has inconsistent use of ShadCN components — native `<table>`, `<input>`, `<select>`, and `<button>` elements appear in the filter bars and data tables, while forms and dialogs already use ShadCN. This causes visual inconsistency and bypasses ShadCN's built-in accessibility and theming. Standardising now, while the codebase is small, avoids compounding technical debt.

## What Changes

- Replace native `<table>` / `<thead>` / `<tbody>` / `<tr>` / `<th>` / `<td>` in `ExpenseTable` and `IncomeTable` with ShadCN `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell`
- Replace native `<input>` and `<select>` in `ExpenseFiltersBar` and `IncomeFiltersBar` with ShadCN `Input` and `Select`; replace raw `<button>` with ShadCN `Button`
- Add Lucide icons to action buttons: `Pencil` icon for Edit, `Trash2` icon for Delete, `Search` icon for search inputs, `SlidersHorizontal` icon for filter controls, `X` icon for the Clear filters button
- Replace text-only button labels with icon + label pairs using ShadCN `Button size="sm"` and `variant` props throughout

## Capabilities

### New Capabilities

None — this is a pure UI consistency improvement with no new features.

### Modified Capabilities

- `expense-management`: Filter bar and table rendering change from native HTML to ShadCN; icon buttons replace text buttons — visual/UX change, no behaviour change.
- `income-management`: Same as above for the income module.

## Impact

- **Files changed**: `ExpenseTable.tsx`, `IncomeTable.tsx`, `ExpenseFiltersBar.tsx`, `IncomeFiltersBar.tsx`, `EditExpenseButton.tsx`, `DeleteExpenseButton.tsx`, `EditIncomeButton.tsx`, `DeleteIncomeButton.tsx`
- **Dependencies**: `lucide-react` (already installed at ^1.17.0); all required ShadCN components already present in `src/components/ui/`
- **No API / server changes**; no schema or action changes required
