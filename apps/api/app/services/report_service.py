from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.expense_report import ExpenseReport, ReportStatus
from app.models.user import User
from app.repositories.report_repository import ReportRepository
from app.services.report_state_machine import ReportStateMachine


class ReportService:
    def __init__(self, db: Session):
        self.report_repo = ReportRepository(db)

    def create_report(self, user_id: int, title: str, description: str | None) -> ExpenseReport:
        return self.report_repo.create(user_id=user_id, title=title, description=description)

    def list_reports(self, user_id: int, status_filter: ReportStatus | None = None) -> list[ExpenseReport]:
        return self.report_repo.list_by_user(user_id=user_id, status=status_filter)

    def list_all_reports(self, status_filter: ReportStatus | None = None) -> list[ExpenseReport]:
        return self.report_repo.list_all(status=status_filter)

    def get_owned_report(self, report_id: int, current_user: User) -> ExpenseReport:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        if report.user_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Forbidden")
        return report

    def update_report(self, report_id: int, current_user: User, title: str | None, description: str | None) -> ExpenseReport:
        report = self.get_owned_report(report_id, current_user)
        if not ReportStateMachine.is_editable(report.status):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Report is locked")

        if title is not None:
            report.title = title
        if description is not None:
            report.description = description
        return self.report_repo.update(report)

    def submit_report(self, report_id: int, current_user: User) -> ExpenseReport:
        report = self.get_owned_report(report_id, current_user)
        self._set_status(report, ReportStatus.SUBMITTED)
        return self.report_repo.update(report)

    def delete_report(self, report_id: int, current_user: User) -> None:
        report = self.get_owned_report(report_id, current_user)
        if report.status != ReportStatus.DRAFT:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Only DRAFT reports can be deleted")
        self.report_repo.delete(report)

    def approve_report(self, report_id: int) -> ExpenseReport:
        report = self._get_report_or_404(report_id)
        self._set_status(report, ReportStatus.APPROVED)
        return self.report_repo.update(report)

    def reject_report(self, report_id: int) -> ExpenseReport:
        report = self._get_report_or_404(report_id)
        self._set_status(report, ReportStatus.REJECTED)
        return self.report_repo.update(report)

    def _get_report_or_404(self, report_id: int) -> ExpenseReport:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report not found")
        return report

    @staticmethod
    def _set_status(report: ExpenseReport, new_status: ReportStatus) -> None:
        try:
            ReportStateMachine.ensure_transition(report.status, new_status)
        except ValueError as exc:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
        report.status = new_status
