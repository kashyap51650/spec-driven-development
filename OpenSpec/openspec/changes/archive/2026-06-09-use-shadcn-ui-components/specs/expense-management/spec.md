## ADDED Requirements

### Requirement: Expense table uses ShadCN Table components
The expense list on desktop SHALL render using ShadCN `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, and `TableCell` components instead of native HTML table elements.

#### Scenario: Table renders with ShadCN markup
- **WHEN** the expenses page loads with one or more expenses
- **THEN** the desktop table SHALL be rendered using ShadCN Table components with consistent border and hover styling

### Requirement: Expense filter bar uses ShadCN form controls
The filter bar for expenses SHALL use ShadCN `Input` for text and date inputs, ShadCN `Select` for the category dropdown, and ShadCN `Button` for the Clear action, replacing all native `<input>`, `<select>`, and `<button>` elements.

#### Scenario: Category filter uses ShadCN Select
- **WHEN** the user opens the category filter
- **THEN** a ShadCN Select popover SHALL appear with all expense categories listed as `SelectItem` entries

#### Scenario: Search input uses ShadCN Input
- **WHEN** the user types in the search field
- **THEN** the ShadCN Input component SHALL render with a `Search` icon adornment and debounce updates to the URL

#### Scenario: Clear button uses ShadCN Button
- **WHEN** one or more filters are active
- **THEN** a ShadCN `Button` with an `X` icon SHALL appear and clear all filters on click

### Requirement: Expense action buttons use Lucide icons
Edit and Delete buttons in the expense table and card list SHALL include Lucide icons (`Pencil` for edit, `Trash2` for delete) alongside or instead of plain text labels.

#### Scenario: Edit button shows Pencil icon
- **WHEN** an expense row or card is rendered
- **THEN** the Edit action button SHALL display a `Pencil` icon (16×16) from `lucide-react`

#### Scenario: Delete button shows Trash icon
- **WHEN** an expense row or card is rendered
- **THEN** the Delete action button SHALL display a `Trash2` icon (16×16) from `lucide-react`
