# Implementation Plan (Executed)

This file records what was actually delivered against the suggested 8-step approach.

## Step 1: Schema + project structure + docker-compose
- Delivered SQLAlchemy models for `User`, `ExpenseReport`, `ExpenseItem`.
- Added repository/service layers and route modules.
- Added `docker-compose.yml` with PostgreSQL, API, Web, and MinIO.
- Added `setup.sh` for one-command local bootstrap + seed flow.

## Step 2: Auth (signup/login/JWT/RBAC)
- Implemented `/auth/signup` and `/auth/login`.
- Added JWT token creation/validation and role checks.
- Enforced RBAC via dependency layer for user/admin endpoints.

## Step 3: Expense Report domain + state machine + unit tests
- Implemented state machine transitions in service layer:
  - `DRAFT -> SUBMITTED`
  - `SUBMITTED -> APPROVED | REJECTED`
  - `REJECTED -> DRAFT`
- Added unit tests for state machine and report service behavior.

## Step 4: Expense Item CRUD + locking logic
- Implemented item CRUD for report owner.
- Enforced draft-only edit/delete/create rules at service layer.
- Added currency locking based on first item currency at service and UI layers.

## Step 5: Receipt upload + extraction
- Added receipt upload endpoint and storage service.
- Added extraction service (LLM-backed with fallback heuristics).
- Added preview extraction endpoint to prefill form fields before saving.

## Step 6: Admin endpoints
- Implemented admin report list and report detail APIs.
- Implemented approve/reject endpoints with transition validation.
- Added admin item listing for review detail page.

## Step 7: Frontend UI
- Implemented auth screens, report list/detail, item create/edit/delete, and submit/re-edit.
- Implemented receipt upload and extraction states.
- Implemented admin list/detail with approve/reject actions and confirmations.
- Added currency-aware total rendering in user/admin views.

## Step 8: Documentation + AI artifacts
- Added and refined `README.md`, `DECISIONS.md`, `docs/architecture.md`.
- Added AI workflow evidence files:
  - `CODEX.md`
  - `.codex/commands.md`
  - `.codex/memory.md`
  - `docs/ai-workflow.md`
  - `docs/prompts/codex-prompts.md`

## Scope Notes / Deviations
- Storage implementation uses MinIO (S3-compatible local mock) for realistic upload flow.
- Extraction is synchronous request-response for assignment speed and UX simplicity.
- Rejected reports require explicit re-edit action before becoming editable again.
