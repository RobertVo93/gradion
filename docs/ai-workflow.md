# AI Workflow Evidence

This project was developed with **vibe-kanban** and the **Codex agent**.  
This file exists to satisfy two evaluation needs from the assignment:
- clear **AI usage note** (how AI was used in real implementation),
- clear **committed AI artifacts** (what evidence exists in this repo).

## AI Usage by Phase

| Phase | How AI was used | Human review/override |
|---|---|---|
| 1. Schema + project setup | Scaffolded initial structure for API/Web, Docker Compose baseline, schema draft notes | Refined service/repository boundaries and local-dev setup details |
| 2. Auth/JWT/RBAC | Drafted signup/login route skeletons, dependency wiring, token plumbing | Strengthened authorization to permission-based RBAC with scoped checks (`own` vs `all`) |
| 3. Report domain/state machine | Generated first-pass state transition helpers and tests | Enforced service-layer transition validation and explicit re-edit path |
| 4. Expense item CRUD + locking | Drafted CRUD flows and route/service glue code | Tightened lock rules to parent report status and currency-lock consistency |
| 5. Receipt upload + extraction | Scaffolded upload/extraction flow and extraction service interface | Added handling for extraction mismatch behavior and UI-safe interaction model |
| 6. Admin endpoints | Generated list/approve/reject endpoint skeletons | Added confirmation/risk controls and stronger permission boundaries |
| 7. Frontend UI | Generated initial pages/components/forms quickly | Refined UX behavior for loading, confirmations, currency and receipt constraints |
| 8. Docs and polish | Drafted first-pass README/architecture/plan text | Rewrote sections for reviewer clarity and deliverable alignment |

## Where AI Output Was Corrected

These are concrete examples where generated output was deliberately changed:
- Rejected report flow changed from implicit edit transition to explicit `REJECTED -> DRAFT` action.
- Submit flow hardened to reject empty reports.
- Permission model upgraded from role-only checks to granular permissions:
  - `report.create|read|update|delete`
  - `expense_item.create|read|update|delete`
  - `report.approve|reject`
- Added permission-boundary tests for common access-control failure cases.
- Refined frontend behavior for destructive/admin actions and extraction-related UX states.

## Committed AI Artifacts

| Artifact | Location | Evidence type |
|---|---|---|
| Codex project context | `CODEX.md` | Session rules and implementation focus |
| Prompt patterns | `.codex/commands.md` | Representative implementation prompts |
| AI corrections log | `.codex/memory.md` | Cases where AI output was overridden |
| Prompt history samples | `docs/prompts/codex-prompts.md` | Additional phase-specific prompts |
| Architecture notes | `docs/architecture.md` | AI-assisted system design documentation |
| Plan and sequencing | `docs/plan.md` | AI-assisted implementation roadmap |

## How to Review AI Usage Quickly

1. Read `README.md` sections: **AI Usage Note** and **Committed AI Artifacts**.
2. Open `.codex/commands.md` and `docs/prompts/codex-prompts.md` for prompt evidence.
3. Open `.codex/memory.md` for concrete override decisions.
4. Compare `docs/plan.md` with final implementation to see adaptation from initial AI plan to reviewed output.
