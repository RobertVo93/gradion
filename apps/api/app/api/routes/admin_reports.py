from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import require_roles
from app.db.session import get_db
from app.models.expense_report import ReportStatus
from app.models.user import User, UserRole
from app.repositories.expense_item_repository import ExpenseItemRepository
from app.schemas.expense_item import ExpenseItemResponse
from app.schemas.report import ReportResponse
from app.services.report_service import ReportService

router = APIRouter(prefix="/admin/reports", tags=["admin-reports"])


@router.get("", response_model=list[ReportResponse])
def list_all_reports(
    status_filter: ReportStatus | None = Query(default=None, alias="status"),
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[ReportResponse]:
    reports = ReportService(db).list_all_reports(status_filter=status_filter)
    return [ReportResponse.model_validate(report) for report in reports]


@router.get("/{report_id}", response_model=ReportResponse)
def get_report_detail(
    report_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).get_report_or_404(report_id)
    return ReportResponse.model_validate(report)


@router.get("/{report_id}/items", response_model=list[ExpenseItemResponse])
def list_report_items(
    report_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> list[ExpenseItemResponse]:
    ReportService(db).get_report_or_404(report_id)
    items = ExpenseItemRepository(db).list_by_report(report_id=report_id)
    return [ExpenseItemResponse.model_validate(item) for item in items]


@router.post("/{report_id}/approve", response_model=ReportResponse)
def approve_report(
    report_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).approve_report(report_id)
    return ReportResponse.model_validate(report)


@router.post("/{report_id}/reject", response_model=ReportResponse)
def reject_report(
    report_id: int,
    _: User = Depends(require_roles(UserRole.ADMIN)),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).reject_report(report_id)
    return ReportResponse.model_validate(report)
