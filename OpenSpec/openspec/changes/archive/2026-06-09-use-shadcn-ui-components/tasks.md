## 1. Expense Table — ShadCN Table

- [x] 1.1 Replace native `<table>/<thead>/<tbody>/<tr>/<th>/<td>` in `src/features/expenses/components/ExpenseTable.tsx` with ShadCN `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`

## 2. Income Table — ShadCN Table

- [x] 2.1 Replace native `<table>/<thead>/<tbody>/<tr>/<th>/<td>` in `src/features/income/components/IncomeTable.tsx` with ShadCN `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` from `@/components/ui/table`

## 3. Expense Filter Bar — ShadCN Controls

- [x] 3.1 Replace native `<input>` (search) with ShadCN `Input` and add a `Search` icon from `lucide-react` as a leading adornment in `src/features/expenses/components/ExpenseFiltersBar.tsx`
- [x] 3.2 Replace native `<select>` (category) with ShadCN controlled `Select` / `SelectTrigger` / `SelectContent` / `SelectItem`; derive `value` from the `category` prop
- [x] 3.3 Replace native `<input type="date">` (startDate, endDate) with ShadCN `Input type="date"`
- [x] 3.4 Replace native `<button>` (Clear) with ShadCN `Button variant="outline" size="sm"` and an `X` icon from `lucide-react`

## 4. Income Filter Bar — ShadCN Controls

- [x] 4.1 Replace native `<input>` (search) with ShadCN `Input` and add a `Search` icon in `src/features/income/components/IncomeFiltersBar.tsx`
- [x] 4.2 Replace native `<select>` (source) with ShadCN controlled `Select`; derive `value` from the `source` prop
- [x] 4.3 Replace native `<input type="date">` (startDate, endDate) with ShadCN `Input type="date"`
- [x] 4.4 Replace native `<button>` (Clear) with ShadCN `Button variant="outline" size="sm"` and an `X` icon

## 5. Expense Action Buttons — Lucide Icons

- [x] 5.1 Add `Pencil` icon (16×16) to the Edit button in `src/features/expenses/components/EditExpenseButton.tsx`; keep `variant="ghost" size="sm"`
- [x] 5.2 Add `Trash2` icon (16×16) to the Delete button in `src/features/expenses/components/DeleteExpenseButton.tsx`; keep `variant="ghost" size="sm"` with `text-red-600`

## 6. Income Action Buttons — Lucide Icons

- [x] 6.1 Add `Pencil` icon (16×16) to the Edit button in `src/features/income/components/EditIncomeButton.tsx`; keep `variant="ghost" size="sm"`
- [x] 6.2 Add `Trash2` icon (16×16) to the Delete button in `src/features/income/components/DeleteIncomeButton.tsx`; keep `variant="ghost" size="sm"` with `text-red-600`

## 7. Verification

- [x] 7.1 Run `npx tsc --noEmit` — zero type errors
- [x] 7.2 Visually verify expenses page: table renders, filters work, icons appear on action buttons
- [x] 7.3 Visually verify income page: same checks as above
