# Codex Memory: Corrections and Overrides

This file records where AI output was adjusted by product/engineering decisions.

## Lifecycle correction
- Initial behavior auto-transitioned `REJECTED -> DRAFT` on edit.
- Corrected to explicit user-triggered action (`Re-edit` button).
- Implemented `POST /reports/{report_id}/reedit`.

## UX correction
- Added admin confirmation popup for approve/reject to prevent accidental actions.
- Added reusable modal component and wired both admin list/detail pages.

## Receipt/item correction
- Added true item edit flow (not add/delete only).
- Added item-level receipt attach/replace flow in UI for existing items.

## Test correction
- Added API-level happy path integration test for report lifecycle.
- Updated README to include integration test run commands.
