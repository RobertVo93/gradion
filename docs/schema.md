# Domain Schema (Step 1)

## users
- `id` (PK)
- `email` (unique, indexed)
- `password_hash`
- `role` (`user` | `admin`)
- `created_at`

## expense_reports
- `id` (PK)
- `user_id` (FK -> users.id, on delete cascade)
- `title`
- `description` (nullable)
- `status` (`DRAFT` | `SUBMITTED` | `APPROVED` | `REJECTED`)
- `total_amount` (numeric 12,2)
- `created_at`
- `updated_at`

## expense_items
- `id` (PK)
- `report_id` (FK -> expense_reports.id, on delete cascade)
- `amount` (numeric 12,2)
- `currency` (3-char)
- `category`
- `merchant_name` (nullable)
- `transaction_date`
- `receipt_url` (nullable)
- `created_at`
- `updated_at`

## Relationship Rules
- One `User` has many `ExpenseReport`.
- One `ExpenseReport` has many `ExpenseItem`.
- Deleting a report deletes its items.
