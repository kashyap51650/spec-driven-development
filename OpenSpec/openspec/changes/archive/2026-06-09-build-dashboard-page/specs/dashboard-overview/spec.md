## ADDED Requirements

### Requirement: Dashboard displays current month financial summary
The system SHALL display a summary of the authenticated user's income, expenses, net savings, and savings rate for the current calendar month.

#### Scenario: User with data sees summary cards
- **WHEN** an authenticated user navigates to the dashboard
- **THEN** four summary cards are displayed: Total Income, Total Expenses, Net Savings, and Savings Rate, all scoped to the current calendar month

#### Scenario: Net savings is computed correctly
- **WHEN** the dashboard loads
- **THEN** Net Savings SHALL equal Total Income minus Total Expenses

#### Scenario: Savings rate is computed correctly
- **WHEN** Total Income is greater than zero
- **THEN** Savings Rate SHALL equal (Net Savings / Total Income) × 100, formatted as a percentage with one decimal place

#### Scenario: Savings rate with zero income
- **WHEN** Total Income is zero
- **THEN** Savings Rate SHALL display as "0.0%" without a division error

---

### Requirement: Dashboard displays monthly trend chart for the past 6 months
The system SHALL render an area chart showing income and expense totals grouped by calendar month for the previous 6 months.

#### Scenario: Chart renders with historical data
- **WHEN** the user has transactions spanning multiple months
- **THEN** the chart SHALL display up to 6 months of data, sorted oldest to newest on the X axis, with income in green and expenses in red

#### Scenario: Chart renders with no historical data
- **WHEN** the user has no transactions
- **THEN** the chart SHALL render empty axes without errors

---

### Requirement: Dashboard displays spending by category for the current month
The system SHALL show a breakdown of expenses by category for the current calendar month, ordered by total amount descending, limited to the top 6 categories.

#### Scenario: Category breakdown with data
- **WHEN** the user has expenses in the current month
- **THEN** each category SHALL display its name, a progress bar representing its percentage of total expenses, its total amount in INR, and its percentage value

#### Scenario: Category breakdown overflow
- **WHEN** the user has more than 6 expense categories in the current month
- **THEN** only the top 6 categories SHALL be shown, and a label SHALL indicate how many categories are hidden (e.g., "and 3 more")

#### Scenario: Category breakdown empty state
- **WHEN** the user has no expenses in the current month
- **THEN** the category breakdown card SHALL display an empty state message: "No expenses this month"

---

### Requirement: Dashboard displays current month income and expense summary card
The system SHALL show a dedicated "This Month" card with the current month's income, expenses, and net balance.

#### Scenario: This month card positive balance
- **WHEN** income exceeds expenses
- **THEN** the balance row SHALL display in green

#### Scenario: This month card negative balance
- **WHEN** expenses exceed income
- **THEN** the balance row SHALL display in red

---

### Requirement: Dashboard displays recent transactions list
The system SHALL display the 8 most recent transactions (combined expenses and incomes) sorted by date descending.

#### Scenario: Recent transactions with data
- **WHEN** the user has transactions
- **THEN** each row SHALL show the transaction title, category or source (muted), formatted amount with sign (+ for income, − for expense), and date

#### Scenario: Recent transactions empty state
- **WHEN** the user has no transactions
- **THEN** the list SHALL display an empty state message: "No recent transactions"

#### Scenario: Recent transactions link
- **WHEN** the user clicks "View all"
- **THEN** the user SHALL be navigated to /expenses

---

### Requirement: Dashboard shows welcome state for new users
The system SHALL display a welcome card when the authenticated user has no income and no expense data.

#### Scenario: New user welcome card visible
- **WHEN** both Total Income and Total Expenses are zero
- **THEN** a WelcomeCard SHALL be displayed above the summary cards with the message "Welcome to Expense Tracker" and two CTA buttons: "Add Income" linking to /income and "Add Expense" linking to /expenses

#### Scenario: Welcome card hidden after first transaction
- **WHEN** the user has at least one income or expense record
- **THEN** the WelcomeCard SHALL NOT be displayed

---

### Requirement: Dashboard loading skeleton matches page layout
The system SHALL display a skeleton placeholder while dashboard data is being fetched.

#### Scenario: Skeleton structure matches dashboard
- **WHEN** the dashboard page is loading
- **THEN** the skeleton SHALL include placeholders for 4 stat cards, a large chart area, a category breakdown panel, and two medium cards in the bottom row

---

### Requirement: All monetary values display in INR format
The system SHALL format all currency amounts using the Indian Rupee (INR) locale format.

#### Scenario: Currency formatting
- **WHEN** any monetary value is displayed on the dashboard
- **THEN** it SHALL be formatted using `Intl.NumberFormat("en-IN", { style: "currency", currency: "INR" })`

---

### Requirement: Dashboard is accessible only to authenticated users
The system SHALL redirect unauthenticated users away from the dashboard.

#### Scenario: Unauthenticated access
- **WHEN** a user without a valid session attempts to access the dashboard
- **THEN** the system SHALL throw an "Unauthorized" error, which the layout's redirect handles

---

### Requirement: Dashboard data is fetched server-side with no client-side data fetching
The system SHALL fetch all dashboard data in a single async Server Component using parallel queries.

#### Scenario: No client-side data fetching
- **WHEN** the dashboard page renders
- **THEN** no `useEffect`, `fetch()`, TanStack Query, or SWR calls SHALL be present in any dashboard component

#### Scenario: Parallel data fetching
- **WHEN** the dashboard service fetches data
- **THEN** all four queries (summary, monthly trends, category breakdown, recent transactions) SHALL be initiated concurrently via `Promise.all`
