# Gradion Expense Report Assignment

## Current Status
Step 1 is completed:
- Project structure scaffolded
- Domain schema defined
- `docker-compose` configured for db/api/web

## Stack
- Frontend: Next.js + TypeScript
- Backend: FastAPI + SQLAlchemy
- Database: PostgreSQL
- File Storage: local mounted folder
- Auth: JWT/RBAC (next step)
- Testing: pytest

## Run (Step 1)
```bash
docker compose up --build
```

Services:
- API: http://localhost:8000/health
- Web: http://localhost:3000
- Postgres: localhost:5432

## Notes
- Business logic and state transitions will be implemented in service layer in Step 3.
- AI extraction and upload endpoint will be added in Step 5.
