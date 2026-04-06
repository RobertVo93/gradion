from fastapi import APIRouter, Depends, Query, Response, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.models.expense_report import ReportStatus
from app.models.user import User
from app.schemas.report import ReportCreateRequest, ReportResponse, ReportUpdateRequest
from app.services.report_service import ReportService

router = APIRouter(prefix="/reports", tags=["reports"])


@router.get("", response_model=list[ReportResponse])
def list_reports(
    status_filter: ReportStatus | None = Query(default=None, alias="status"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> list[ReportResponse]:
    reports = ReportService(db).list_reports(user_id=current_user.id, status_filter=status_filter)
    return [ReportResponse.model_validate(report) for report in reports]


@router.post("", response_model=ReportResponse, status_code=status.HTTP_201_CREATED)
def create_report(
    payload: ReportCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).create_report(
        user_id=current_user.id,
        title=payload.title,
        description=payload.description,
    )
    return ReportResponse.model_validate(report)


@router.get("/{report_id}", response_model=ReportResponse)
def get_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).get_owned_report(report_id=report_id, current_user=current_user)
    return ReportResponse.model_validate(report)


@router.patch("/{report_id}", response_model=ReportResponse)
def update_report(
    report_id: int,
    payload: ReportUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).update_report(
        report_id=report_id,
        current_user=current_user,
        title=payload.title,
        description=payload.description,
    )
    return ReportResponse.model_validate(report)


@router.post("/{report_id}/submit", response_model=ReportResponse)
def submit_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> ReportResponse:
    report = ReportService(db).submit_report(report_id=report_id, current_user=current_user)
    return ReportResponse.model_validate(report)


@router.delete("/{report_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_report(
    report_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> Response:
    ReportService(db).delete_report(report_id=report_id, current_user=current_user)
    return Response(status_code=status.HTTP_204_NO_CONTENT)
