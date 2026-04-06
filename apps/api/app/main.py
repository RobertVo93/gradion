from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.api.routes import api_router
from app.db.base import Base
from app.db.session import engine


@asynccontextmanager
async def lifespan(_: FastAPI):
    # Bootstrap tables for local dev; switch to Alembic migrations afterward.
    Base.metadata.create_all(bind=engine)
    yield


app = FastAPI(title="Gradion Expense API", version="0.2.0", lifespan=lifespan)
app.include_router(api_router)


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
