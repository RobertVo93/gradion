from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.expense_report import ExpenseReport, ReportStatus


class ReportRepository:
    def __init__(self, db: Session):
        self.db = db

    def create(self, user_id: int, title: str, description: str | None) -> ExpenseReport:
        report = ExpenseReport(user_id=user_id, title=title, description=description)
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def get_by_id(self, report_id: int) -> ExpenseReport | None:
        return self.db.get(ExpenseReport, report_id)

    def list_by_user(self, user_id: int, status: ReportStatus | None = None) -> list[ExpenseReport]:
        statement = select(ExpenseReport).where(ExpenseReport.user_id == user_id)
        if status:
            statement = statement.where(ExpenseReport.status == status)
        statement = statement.order_by(ExpenseReport.created_at.desc())
        return list(self.db.execute(statement).scalars().all())

    def update(self, report: ExpenseReport) -> ExpenseReport:
        self.db.add(report)
        self.db.commit()
        self.db.refresh(report)
        return report

    def delete(self, report: ExpenseReport) -> None:
        self.db.delete(report)
        self.db.commit()
