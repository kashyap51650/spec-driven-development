# Add Expense and Income Modules

## What

Implement complete Expense and Income feature modules for the Expense Tracker app. This change adds types, validation schemas, database repositories, business services, server-side data functions, server actions for mutations, UI pages and components (table + mobile cards), create/edit dialogs, and delete confirmations for both Expenses and Income. Expenses will be implemented first and the same architecture will be replicated for Income.

## Why

The app currently has shell, sidebar, and authentication completed. To make the app functional for tracking finances we need Expense and Income modules that follow the project's established architecture rules (services own business logic, repositories access Prisma, server-only data functions, no client fetch for server reads, and revalidatePath on mutations). This will enable users to create, read, update, and delete expenses and income, filter/search records, and view data on dashboard pages.

## Scope

- Server: types, validations, repositories, services, data functions, server actions
- UI: pages under `app/(dashboard)/expenses` and `app/(dashboard)/income`, responsive table + card views, filters, create/edit/delete dialogs
- Utilities: currency & date formatting, EmptyState component

## Acceptance Criteria

- CRUD flows for Expenses work end-to-end on the Expenses page
- Income module mirrors Expenses and works end-to-end
- Filters (category/source, date range, search) operate server-side and update URL
- Dialog-based create/edit and alert confirmation delete flows function and revalidate the listing
- Amounts formatted in INR and dates in `MMM dd, yyyy`
- Typecheck and lint pass: `npx tsc --noEmit` and `npm run lint`
