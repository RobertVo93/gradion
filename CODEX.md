# CODEX Project Context

This repository was implemented with AI-assisted development using **vibe-kanban** with the **Codex agent**.

## Project Scope
- JWT auth + RBAC
- Expense report lifecycle and state machine
- Expense item CRUD with lock rules by report status
- Receipt upload + AI extraction + user override
- Admin review workflow (list/detail/approve/reject)
- Dockerized local setup and automated tests

## Engineering Rules Used During AI Sessions
- Keep business rules in service layer.
- Keep routes thin (HTTP handling only).
- Preserve strict ownership checks for user resources.
- Block item mutation unless parent report is editable (`DRAFT`).
- Document non-obvious product decisions in `DECISIONS.md`.

## Agent Operating Style
- Small incremental patches with frequent test runs.
- Prefer explicit status transitions over implicit mutations.
- Prioritize reviewer clarity in docs and setup scripts.
