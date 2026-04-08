# Gradion Expense Report Assignment

Expense report system with:
- JWT auth + permission-based RBAC (`user`, `admin`)
- Report state machine (`DRAFT -> SUBMITTED -> APPROVED/REJECTED`)
- Item CRUD with report lock rules
- Receipt upload and AI extraction
- Admin review (list/detail/approve/reject)

## Quick Start (Under 5 Minutes)
### Prerequisite
- add file .env in apps/api. Follow the .env.example to provide requirement variables

### Recommended: one command
```bash
./setup.sh
```

This script:
- starts `db`, `api`, and `web` via Docker
- waits for API health check
- seeds default users

### Manual
```bash
docker compose up -d --build
docker compose exec -T api python -m app.scripts.seed_users
```

## Default Accounts
- Admin: `admin@example.com` / `Admin123!`
- User: `user@example.com` / `User123!`

## Service URLs
- Web: http://localhost:3000
- API docs: http://localhost:8000/docs
- API health: http://localhost:8000/health
- PostgreSQL: `localhost:5432`
- MinIO API: `http://localhost:9000`
- MinIO Console: `http://localhost:9001`

## Running Tests

### API unit/integration tests (inside Docker)
```bash
docker compose exec -T api pytest -q
```

### Run only integration happy path
```bash
docker compose exec -T api pytest -q tests/test_report_happy_path_integration.py
```

### Local (without Docker)
```bash
cd apps/api
python3.12 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
pytest -q
```

## Architecture Overview

The codebase is organized as a monorepo with clear backend/frontend separation:

- `apps/api` (FastAPI): API routes, service-layer business rules, repositories, models, and schemas.
- `apps/web` (Next.js): user/admin UI flows for auth, reports, items, and review actions.
- `docs`: planning, architecture, AI workflow notes, and prompts.
- `storage/uploads`: local fallback storage path.

Backend follows layered responsibilities:

- `api/routes`: HTTP concerns only (request/response, auth dependencies).
- `services`: core business rules (status transitions, ownership, lock checks, extraction orchestration).
- `repositories`: persistence access with SQLAlchemy.
- `models`/`schemas`: database entities and API contracts.

Runtime integration:

- Web calls API via `NEXT_PUBLIC_API_URL`.
- API stores metadata in PostgreSQL and receipt objects in MinIO (S3-compatible local mock via Docker).
- State machine validation is enforced in service layer, not controllers.

## RBAC Permission Model

Authorization is permission-based with scoped checks (`own` vs `all`):

- `report.create`, `report.read`, `report.update`, `report.delete`
- `expense_item.create`, `expense_item.read`, `expense_item.update`, `expense_item.delete`
- `report.approve`, `report.reject`

Role mapping:

- `user`:
  - report CRUD on **own** reports
  - expense item CRUD on **own** reports/items
- `admin`:
  - `report.read`, `report.approve`, `report.reject` on **all** reports

## Stack
- Frontend: Next.js + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- File/Object storage: MinIO S3-compatible local mock (`http://localhost:9000`)
- Testing: `pytest`

## Project Notes
- State transition decisions and extraction mode are documented in `DECISIONS.md`.
- AI-assisted planning/architecture artifacts are in `docs/plan.md` and `docs/architecture.md`.
- Codex workflow evidence is in `CODEX.md`, `.codex/`, `docs/ai-workflow.md`, and `docs/prompts/codex-prompts.md`.

## AI Usage Note
This assignment was implemented with AI-assisted development using Codex in a vibe-kanban workflow. AI was used for fast scaffolding of API routes, services, React components, test skeletons, and documentation drafts. Human review then validated architecture boundaries and production behavior, especially for state transitions, permission boundaries, report/item locking, and receipt-currency constraints.

AI output was not accepted blindly. I overrode generated behavior where product rules required stricter logic, including explicit `REJECTED -> DRAFT` re-edit action, submit validation for empty reports, stronger permission-boundary coverage, and frontend confirmation/loading patterns for risky operations. Detailed examples are in `docs/ai-workflow.md` and `.codex/memory.md`.

## Committed AI Artifacts
The repository includes committed artifacts that demonstrate practical AI usage:

| Artifact | Purpose |
|---|---|
| `CODEX.md` | Session context and implementation constraints given to Codex |
| `.codex/commands.md` | Real prompt patterns used while implementing backend/frontend/test tasks |
| `.codex/memory.md` | Corrections/overrides where AI output was adjusted by engineering judgment |
| `docs/prompts/codex-prompts.md` | Prompt samples grouped by implementation phase |
| `docs/plan.md` | AI-assisted implementation plan and phase breakdown |
| `docs/architecture.md` | AI-assisted architecture notes and responsibility boundaries |
| `docs/ai-workflow.md` | End-to-end record of how AI was used, what was overridden, and why |
