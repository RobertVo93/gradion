# Architecture Notes (Initial)

## Monorepo
- `apps/api`: FastAPI backend
- `apps/web`: Next.js frontend
- `docs`: planning and decisions
- `storage/uploads`: local receipt storage

## Backend Layering Target
- `api/routes`: HTTP request/response only
- `services`: business rules (state machine, permission checks)
- `repositories`: data access
- `models/schemas`: persistence and API contract models

## Runtime
- `docker-compose.yml` brings up `db`, `api`, and `web`.
- Web calls API via `NEXT_PUBLIC_API_URL`.
- API persists files to mounted local volume.
