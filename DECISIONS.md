# Implementation Decisions

## Stack Choices and Why

### Backend: FastAPI + SQLAlchemy + PostgreSQL
- FastAPI was chosen for speed of delivery, type-safe request/response contracts, and straightforward dependency injection for auth and role checks.
- SQLAlchemy was chosen to keep domain logic explicit and maintainable while still allowing precise control over queries and relationships.
- PostgreSQL was chosen for transactional consistency and strong relational modeling for `users`, `reports`, and `items`.

### Frontend: Next.js + TypeScript
- Next.js was chosen to move quickly on route-based UI while keeping a clean project structure for separate user/admin views.
- TypeScript helps reduce integration errors between UI forms and backend contracts, especially around report statuses and item schema fields.

### File Storage: MinIO local S3 mock
- MinIO was selected as a local object storage mock to keep file handling closer to production patterns (object key, URL generation, storage abstraction) without cloud dependency.

## Key Product/Engineering Decisions

### Report lifecycle enforcement in service layer
- Decision: all status transitions are validated in services, not controllers.
- Rationale: avoids duplicated logic across routes and guarantees one source of truth for business rules.

### Rejected report editing behavior
- Decision: `REJECTED -> DRAFT` is **explicit** via user-triggered **Re-edit** action (`POST /reports/{id}/reedit`), not implicit on first edit.
- Rationale: clearer audit trail and more predictable UX/state behavior.

### Receipt extraction mode
- Decision: immediate request-response extraction flow for this assignment.
- Rationale: simpler implementation and fast feedback loop for users, while still allowing manual override before final save.

### RBAC model
- Decision: move from pure role checks to permission-based checks with explicit scope (`own`, `all`).
- Rationale: this is easier to evolve as endpoints/actions grow, and it makes authorization intent explicit per action (`report.approve`, `expense_item.update`, etc.) instead of coupling behavior directly to role names.

## Key Trade-offs

### Simplicity vs production-hardening
- We prioritized a clear, readable architecture and assignment completeness over deeper production concerns (async job queue, distributed tracing, hard multi-tenant boundaries, etc.).

### Fast iteration vs broad test matrix
- We implemented unit tests for core business logic and one API-level happy path integration test. This gives confidence on critical flows while keeping delivery velocity high.

### MinIO local mock vs cloud object storage
- MinIO keeps local setup simple while preserving S3-style integration patterns. Production would likely add signed URLs, lifecycle rules, and malware/mime scanning.

## If You Had One More Day, What Would You Build Next and Why?

If I had one more day, I would focus on three areas that would create the biggest jump in production readiness without destabilizing the current architecture.

First, I would add asynchronous receipt processing with job tracking. Right now extraction is immediate request-response, which is fine for small files and demo scope, but it can block requests and degrade UX under load. I would introduce a lightweight queue (for example Redis + worker), persist extraction jobs, and expose a status endpoint for polling. This would make uploads resilient, prevent timeouts, and let us retry failed extraction jobs safely. It also prepares the system for heavier OCR/LLM pipelines later.

Second, I would expand integration coverage around role/permission boundaries and rejection loops. The current test set validates core logic and a happy path, but reviewers and operators gain much more confidence when the “danger zones” are covered: user cannot approve/reject, admin cannot mutate user-owned items, rejected report must re-edit before mutation, and approved reports are terminally locked. These tests would be API-level and close to real user behavior.

Third, I would improve observability and operational diagnostics. I would add structured logging with request IDs, clear error categories, and basic metrics around extraction success rate, state transition failures, and API latency per route. For a workflow system with approvals and status transitions, this is high-value because many support/debug scenarios depend on reconstructing who did what and when.

If time remained, I would also add minor UX polish for reviewer confidence: clearer audit timeline on report detail (submitted/rejected/approved timestamps), inline validation hints on item forms, and better empty/error states around extraction failures. These are small changes with disproportionate impact on perceived reliability.

In short, the next day would be spent making the system more robust under realistic usage: async extraction, stronger integration tests, and better observability. That combination gives the highest return while preserving the clean service-layer architecture already in place.
