# Domain Schema (Current)

## `users`
- `id` (PK)
- `email` (unique, indexed)
- `password_hash`
- `role` (`user` | `admin`)
- `created_at`

## `expense_reports`
- `id` (PK)
- `user_id` (FK -> `users.id`, cascade delete)
- `title`
- `description` (nullable)
- `status` (`DRAFT` | `SUBMITTED` | `APPROVED` | `REJECTED`)
- `created_at`
- `updated_at`

### Derived fields (not persisted columns)
- `total_amount`: computed from sum of linked expense item amounts.
- `currency`: derived from first expense item currency (if any), used by API/UI for consistent money formatting.

## `expense_items`
- `id` (PK)
- `report_id` (FK -> `expense_reports.id`, cascade delete)
- `amount` (numeric)
- `currency` (enum-constrained at API layer: `VND`, `USD`, `EUR`, `JPY`)
- `category`
- `merchant_name` (nullable)
- `transaction_date`
- `receipt_url` (nullable)
- `created_at`
- `updated_at`

## Relationship rules
- One `User` has many `ExpenseReport`.
- One `ExpenseReport` has many `ExpenseItem`.
- Deleting a report deletes all of its items.

## Business constraints (service layer)
- Only report owner can mutate own report/items.
- Item mutations allowed only when report is editable (`DRAFT`).
- Currency lock: first item currency locks report currency for subsequent item operations.
- Status transitions enforced by state machine service, not in route/controller handlers.

## Authorization model (permission-based RBAC)
- `report.create`, `report.read`, `report.update`, `report.delete`
- `expense_item.create`, `expense_item.read`, `expense_item.update`, `expense_item.delete`
- `report.approve`, `report.reject`

Scope semantics:
- `own`: permission applies only to resources owned by current user.
- `all`: permission applies across all reports.

Role mapping:
- `user`: report CRUD + expense item CRUD on `own`.
- `admin`: `report.read`, `report.approve`, `report.reject` on `all`.
