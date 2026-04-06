from fastapi import APIRouter

from app.api.routes.admin_reports import router as admin_reports_router
from app.api.routes.auth import router as auth_router
from app.api.routes.items import router as items_router
from app.api.routes.receipts import router as receipts_router
from app.api.routes.reports import router as reports_router

api_router = APIRouter()
api_router.include_router(auth_router)
api_router.include_router(reports_router)
api_router.include_router(items_router)
api_router.include_router(receipts_router)
api_router.include_router(admin_reports_router)
