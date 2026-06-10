# Feature Specification: Expense and Income Modules

**Feature Branch**: `005-expense-income-modules`

**Created**: 2026-06-10

**Status**: Draft

**Input**: User description: "Build the Expense and Income modules for the expense tracker. Users can create, edit, and delete their own expenses and income records. Users can only see and modify their own data. Filter by category/source, date range, and title search. Filter state persists in the URL. Newest records first. Desktop table, mobile cards. Create/edit in Dialog modal. Delete requires AlertDialog confirmation. List updates immediately after any mutation. INR amounts. MMM dd, yyyy dates. Empty states with create button. Expense fields: title, amount, category, account, date, notes (optional), tags (optional), recurring (boolean). Income fields: title, amount, source, account, date, notes (optional)."

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Create an Expense Record (Priority: P1)

A logged-in user navigates to the Expenses page and adds a new expense by clicking "Add Expense." A dialog modal opens with a form. The user fills in the required fields (title, amount, category, account, date), optionally adds notes, tags, and marks the expense as recurring, then submits. The new expense appears at the top of the list immediately without a page reload.

**Why this priority**: Creating records is the foundational action the entire module depends on; no other story is meaningful without it.

**Independent Test**: Can be fully tested by opening the Expenses page on a fresh account, clicking "Add Expense," submitting a valid form, and verifying the new record appears at the top of the list.

**Acceptance Scenarios**:

1. **Given** the user is on the Expenses page, **When** they click "Add Expense" and submit a valid form, **Then** the expense is saved and appears at the top of the list without a page reload.
2. **Given** the "Add Expense" dialog is open, **When** the user submits with a required field empty, **Then** an inline validation error appears on that field and the record is not saved.
3. **Given** the "Add Expense" dialog is open, **When** the user enters a zero or negative amount, **Then** an inline validation error appears and the record is not saved.
4. **Given** the user successfully creates an expense, **When** they view the list, **Then** the amount is displayed in INR format and the date is displayed as MMM dd, yyyy.

---

### User Story 2 — Create an Income Record (Priority: P1)

A logged-in user navigates to the Income page and adds a new income entry by clicking "Add Income." A dialog modal opens. The user fills in the required fields (title, amount, source, account, date) and optionally adds notes, then submits. The new income record appears at the top of the list immediately.

**Why this priority**: Creating income records is the foundational action for the Income module, symmetric to expense creation.

**Independent Test**: Can be fully tested by opening the Income page on a fresh account, clicking "Add Income," submitting a valid form, and verifying the new record appears at the top of the list.

**Acceptance Scenarios**:

1. **Given** the user is on the Income page, **When** they click "Add Income" and submit a valid form, **Then** the income record is saved and appears at the top of the list without a page reload.
2. **Given** the "Add Income" dialog is open, **When** the user submits with a required field empty, **Then** an inline validation error appears and the record is not saved.
3. **Given** the user successfully creates an income record, **When** they view the list, **Then** the amount is displayed in INR format and the date is displayed as MMM dd, yyyy.

---

### User Story 3 — Edit an Existing Record (Priority: P2)

A user sees a record in the list and clicks its "Edit" action. The dialog modal opens pre-populated with the record's current values. The user changes one or more fields and saves. The list reflects the updated values immediately.

**Why this priority**: Editing corrects mistakes and keeps data accurate; it is the second most critical write operation after create.

**Independent Test**: Can be fully tested by creating a record, clicking its edit action, changing a field, saving, and verifying the list shows the updated value.

**Acceptance Scenarios**:

1. **Given** the user clicks "Edit" on a record, **When** the dialog opens, **Then** all fields are pre-populated with the current values of that record.
2. **Given** the edit dialog is open, **When** the user changes the amount and saves, **Then** the list shows the updated amount immediately.
3. **Given** the edit dialog is open, **When** the user clears a required field and tries to save, **Then** an inline validation error appears and the record is not updated.

---

### User Story 4 — Delete a Record (Priority: P2)

A user clicks "Delete" on a record. A confirmation dialog appears asking the user to confirm. If confirmed, the record is permanently removed and the list updates immediately. If cancelled, the record remains.

**Why this priority**: Deletion is irreversible; the confirmation guard prevents accidental data loss.

**Independent Test**: Can be fully tested by creating a record, clicking its delete action, confirming, and verifying it disappears from the list.

**Acceptance Scenarios**:

1. **Given** the user clicks "Delete" on a record, **When** the confirmation dialog appears and the user confirms, **Then** the record is removed and disappears from the list without a page reload.
2. **Given** the confirmation dialog is open, **When** the user clicks "Cancel," **Then** the record remains unchanged in the list.

---

### User Story 5 — Filter and Search Records (Priority: P3)

A user narrows the displayed list by typing in the search bar (matches title), selecting a category or source from a dropdown, and/or setting a date range. All active filter state is reflected in the URL. Refreshing the page or sharing the URL preserves the current filtered view. Clearing all filters returns the full list.

**Why this priority**: Filtering improves navigation and discoverability; it enhances an already-functional list but is not required for basic record management.

**Independent Test**: Can be tested by creating several records with different categories and dates, applying filters, verifying the correct records appear, refreshing the page, and confirming the filter state is restored.

**Acceptance Scenarios**:

1. **Given** expenses with different categories, **When** the user selects a specific category, **Then** only expenses matching that category are shown.
2. **Given** the user applies a date-range filter, **When** viewing the list, **Then** only records whose date falls within the range are shown.
3. **Given** the user types a partial title in the search bar, **When** viewing the list, **Then** only records whose title contains that text (case-insensitive) are shown.
4. **Given** the user has active filters, **When** they refresh the page or open the URL in a new tab, **Then** the same filters are active and the same records are shown.
5. **Given** filters are active, **When** the user clears all filters, **Then** the full unfiltered list is restored.

---

### User Story 6 — Data Isolation Between Users (Priority: P1)

A user can only see and modify their own expense and income records. Records belonging to other users are never visible or accessible.

**Why this priority**: Data isolation is a security requirement; violating it would be a critical privacy breach.

**Independent Test**: Can be tested by creating two separate user accounts with records, logging into each, and confirming each account's list shows only its own records.

**Acceptance Scenarios**:

1. **Given** User A and User B each have expense records, **When** User A views the Expenses page, **Then** only User A's expenses are shown.
2. **Given** User A is authenticated, **When** they attempt to modify a record that belongs to User B, **Then** the operation is rejected and no data is changed.

---

### User Story 7 — Responsive List Views (Priority: P3)

On desktop screens records are displayed in a table. On mobile screens the same records are displayed as cards. Both views show identical data and offer the same create, edit, and delete actions.

**Why this priority**: Responsive layout improves usability on mobile but does not affect data correctness.

**Independent Test**: Can be tested by viewing the Expenses page on a desktop viewport (≥768px) to confirm a table, then viewing on a mobile viewport (<768px) to confirm cards.

**Acceptance Scenarios**:

1. **Given** the Expenses page is viewed on a desktop viewport (≥768px) with records present, **Then** records are displayed in a table layout.
2. **Given** the Expenses page is viewed on a mobile viewport (<768px) with records present, **Then** records are displayed as cards.
3. **Given** both layouts, **Then** each record shows the same fields and the same edit/delete actions.

---

### User Story 8 — Empty States (Priority: P3)

When a user has no records, or active filters return no results, the list area shows a helpful message and a prominent button to create the first record.

**Why this priority**: Empty states guide new users and prevent a blank, confusing screen.

**Independent Test**: Can be tested by visiting the Expenses or Income page on a fresh account with no records, confirming the empty state message and "Add" button are displayed.

**Acceptance Scenarios**:

1. **Given** the user has no expenses, **When** they visit the Expenses page, **Then** an empty-state message and "Add Expense" button are displayed.
2. **Given** filters are applied that match no records, **When** viewing the filtered list, **Then** an empty-state message is shown.

---

### Edge Cases

- What happens when the user submits a form while a save is already in progress? The submit button must be disabled after the first click to prevent duplicate submissions.
- What happens when a server error occurs during save? A user-readable error message is shown; the dialog stays open so the user can retry.
- What happens when the user sets a date-range filter where the start date is after the end date? The filter is treated as invalid; the list is not further narrowed and a hint is shown.
- What happens when the user has a very large number of records? All records are fetched and displayed in a single scrollable view; no pagination is required for this version.
- What happens when a tag contains special characters or is very long? Tags are stored as entered; display is truncated with a tooltip if they overflow the available space.

---

## Requirements *(mandatory)*

### Functional Requirements

**Expense Module**

- **FR-001**: The system MUST allow an authenticated user to create a new expense record with the following fields: title (text, required, minimum 1 character), amount (positive number greater than zero, required), category (selected from a predefined list of expense categories, required), account (selected from a predefined list of account types, required), date (date, required), notes (text, optional), tags (optional list of labels — entered as comma-separated text and stored as individual values), recurring (boolean, defaults to false).
- **FR-002**: The system MUST allow an authenticated user to edit any of their own expense records; all fields must be editable after creation.
- **FR-003**: The system MUST allow an authenticated user to delete any of their own expense records, requiring explicit confirmation before the record is permanently removed.
- **FR-004**: The Expenses list MUST display records sorted by date descending (newest first).
- **FR-005**: The Expenses list MUST support three combinable filters: (a) category — shows only expenses matching the selected category; (b) date range — shows only expenses whose date falls between the start and end date inclusive; (c) title search — case-insensitive partial match against the expense title.
- **FR-006**: All active Expense filter state MUST be stored as URL query parameters; loading or refreshing the URL MUST restore the identical filtered view.
- **FR-007**: The Expenses list MUST render as a table on viewports ≥768px wide and as a stack of cards on viewports <768px wide; both layouts MUST expose create, edit, and delete actions.
- **FR-008**: When the Expenses list is empty (no records exist, or no records match active filters), the system MUST display an empty-state message and a button to create a new expense.

**Income Module**

- **FR-009**: The system MUST allow an authenticated user to create a new income record with the following fields: title (text, required, minimum 1 character), amount (positive number greater than zero, required), source (selected from a predefined list of income sources, required), account (selected from a predefined list of account types, required), date (date, required), notes (text, optional).
- **FR-010**: The system MUST allow an authenticated user to edit any of their own income records; all fields must be editable after creation.
- **FR-011**: The system MUST allow an authenticated user to delete any of their own income records, requiring explicit confirmation before the record is permanently removed.
- **FR-012**: The Income list MUST display records sorted by date descending (newest first).
- **FR-013**: The Income list MUST support three combinable filters: (a) source — shows only income records matching the selected source; (b) date range; (c) title search (case-insensitive partial match).
- **FR-014**: All active Income filter state MUST be stored as URL query parameters; loading or refreshing the URL MUST restore the identical filtered view.
- **FR-015**: The Income list MUST render as a table on viewports ≥768px wide and as a stack of cards on viewports <768px wide; both layouts MUST expose create, edit, and delete actions.
- **FR-016**: When the Income list is empty, the system MUST display an empty-state message and a button to create a new income record.

**Shared Behaviour**

- **FR-017**: All create and edit forms MUST be rendered inside a modal dialog; dedicated full-page form routes are not permitted.
- **FR-018**: All delete actions MUST require the user to confirm in an alert dialog before the record is permanently removed.
- **FR-019**: After any create, edit, or delete operation completes, the list view MUST reflect the change without requiring a full page reload.
- **FR-020**: All monetary amounts MUST be displayed in INR format throughout all list, card, and form views.
- **FR-021**: All dates MUST be displayed in MMM dd, yyyy format (e.g., "Jun 09, 2026") throughout all list, card, and form views.
- **FR-022**: A user MUST only be able to view and modify their own records; the system MUST prevent any user from reading or mutating another user's data.
- **FR-023**: Form validation MUST block submission when required fields are empty or when values are invalid (e.g., non-positive amount); each invalid field MUST display an inline error message.
- **FR-024**: The submit button in any create or edit form MUST be disabled while a save operation is in progress to prevent duplicate submissions.

### Key Entities

- **Expense**: A single spending record owned by one user. Carries a title, positive amount, a category (one of: Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, Rent, Education, Travel, Other), an account type (one of: Cash, Bank Account, Credit Card, Savings), a date, optional notes, an optional list of tags, and a recurring boolean flag. A user can only access their own expenses.
- **Income**: A single earning record owned by one user. Carries a title, positive amount, a source (one of: Salary, Freelance, Business, Investment, Gift, Other), an account type (one of: Cash, Bank Account, Credit Card, Savings), a date, and optional notes. A user can only access their own income records.
- **Filter State**: A transient view configuration derived from the current URL query parameters on each page load. Comprises: an optional title search string, an optional category (expenses) or source (income) value, and an optional date range (start date, end date). Category and date filters use exact-match and inclusive-range matching respectively; the title search is a case-insensitive partial match. Not persisted to the database.

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A user can create a new expense or income record within 60 seconds of clicking the "Add" button and see the new record in the list.
- **SC-002**: After any create, edit, or delete action the updated list is visible to the user within 2 seconds — no manual page refresh required.
- **SC-003**: Applying a filter (category/source, date range, or search) visibly updates the list within 1 second of the user finishing their filter interaction.
- **SC-004**: 100% of records shown in any list belong only to the currently authenticated user — cross-user data leakage must be impossible under normal operation.
- **SC-005**: Refreshing a filtered-page URL restores the identical filtered view, preserving all active filter parameters without any additional user action.
- **SC-006**: Every monetary amount shown in any list, card, or form is formatted in INR; no raw unformatted numbers appear in the UI.
- **SC-007**: Both the Expenses and Income pages provide a loading skeleton during data fetch and an error boundary with a "Try again" action — users never see a blank screen.

---

## Assumptions

- The Expense and Income data schemas (fields, types, and relationships) already exist in the database and match the fields described in this specification; no schema migration work is in scope.
- User authentication and session management are handled by the existing shared authenticated layout; the Expenses and Income pages do not re-implement session guarding.
- Pagination is out of scope for this version; all records for the authenticated user are fetched and displayed in a single scrollable view.
- Expense categories, income sources, and account types are each selected from a fixed predefined list; users cannot add new values to these lists. The predefined values are: expense categories — Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, Rent, Education, Travel, Other; income sources — Salary, Freelance, Business, Investment, Gift, Other; account types — Cash, Bank Account, Credit Card, Savings.
- Tags (expenses only) are stored and displayed as plain text labels; no tag management, suggestion, or autocomplete feature is in scope.
- The "recurring" flag on expenses is stored and displayed as a boolean indicator only; no automated scheduling or auto-generation of recurring records is in scope.
- Date range filtering uses two independent date inputs (start date, end date) rather than a visual calendar range picker.
- No bulk operations (e.g., multi-select and batch delete) are required for this version.
- The same empty-state component is reused for both "no records exist" and "no records match filters" scenarios; message copy may differ between the two cases.

---

## Clarifications

### Session 2026-06-10

- Q: Are category (expenses), source (income), and account fields free-text or selected from predefined lists? → A: All three use predefined fixed lists — 10 expense categories (Food & Dining, Transport, Shopping, Entertainment, Health, Utilities, Rent, Education, Travel, Other), 6 income sources (Salary, Freelance, Business, Investment, Gift, Other), and 4 account types (Cash, Bank Account, Credit Card, Savings). Users cannot add new values.
- Q: How are tags entered in the expense creation/edit form? → A: Tags are entered as a single comma-separated text string in the form; the system splits the input on commas and trims whitespace to produce the individual tag values stored on the record.
