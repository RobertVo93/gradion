# Architecture Overview

## Monorepo layout
- `apps/api`: FastAPI backend (routes, services, repositories, models, schemas).
- `apps/web`: Next.js frontend (user/admin flows, hooks, reusable UI components).
- `docs`: architecture/plan/decision/AI usage artifacts.
- `storage`: local mount point used by API runtime (including upload fallback).

## Backend layering

### 1) API routes (`app/api/routes`)
- Handle HTTP concerns only: request parsing, response models, dependency wiring.
- No core business transition logic in routes.

### 2) Services (`app/services`)
- Own business rules:
  - state transitions (`ReportStateMachine`)
  - ownership/authorization checks at domain operation level
  - draft-only mutation enforcement
  - receipt extraction/storage orchestration
  - currency lock behavior by report

### 3) Repositories (`app/repositories`)
- Encapsulate persistence queries and data mutation primitives.
- Keep query details out of services/routes.

### 4) Models/Schemas (`app/models`, `app/schemas`)
- SQLAlchemy entities model persistence.
- Pydantic schemas model API contracts and validation.

## Frontend structure
- App Router pages under `src/app`:
  - user auth/report pages
  - admin review pages
- Feature hooks/components under `src/components/...`:
  - `report-detail/*` for user report detail orchestration
  - `admin/*` for admin list/detail workflows
- Shared client helpers in `src/lib`:
  - API wrapper/auth storage/types/util formatting

## Core domain flows

### Auth + RBAC
- JWT issued on login/signup.
- Permission checks enforced via backend dependency layer (`require_permission`).
- Scoped authorization is explicit:
  - `own`: user can access only owned resources
  - `all`: admin can access all reports for read/review actions
- Permission set:
  - `report.create`, `report.read`, `report.update`, `report.delete`
  - `expense_item.create`, `expense_item.read`, `expense_item.update`, `expense_item.delete`
  - `report.approve`, `report.reject`
- Frontend redirects unauthorized users from protected routes.

### Report lifecycle
- Transitions enforced in state machine/service layer:
  - `DRAFT -> SUBMITTED`
  - `SUBMITTED -> APPROVED | REJECTED`
  - `REJECTED -> DRAFT` (explicit re-edit action)
- Editable statuses: `DRAFT` only.

### Expense items + totals
- Item CRUD restricted by report ownership and editability.
- Report total amount computed from linked item amounts.
- Report currency derived from first item and used for UI money formatting.

### Receipt processing
- Upload endpoint stores file via storage service (MinIO in compose).
- Extraction service returns structured receipt fields.
- Frontend uses preview extraction for prefill and mismatch checks before item save/upload.

## Runtime / local environment
- `docker-compose.yml` starts:
  - PostgreSQL
  - API container
  - Web container
  - MinIO (S3-compatible local object storage)
- `setup.sh` bootstraps stack and seeds default users.

## Testing strategy
- Unit tests for state machine and core services.
- Integration happy path for `DRAFT -> SUBMITTED -> APPROVED`.
- Additional service-level tests for report/item lock and permission behavior.

## Design trade-offs
- Prioritized clear, testable service-layer logic over heavy infrastructure complexity.
- Kept extraction synchronous for assignment velocity and straightforward UX.
- Used MinIO to keep storage behavior realistic without cloud dependency.
