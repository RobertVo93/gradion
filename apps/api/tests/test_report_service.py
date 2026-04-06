import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.expense_report import ExpenseReport, ReportStatus
from app.models.user import User, UserRole
from app.services.report_service import ReportService


def _create_user(db: Session, email: str, role: UserRole = UserRole.USER) -> User:
    user = User(email=email, password_hash="hash", role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_report(
    db: Session,
    user_id: int,
    status: ReportStatus = ReportStatus.DRAFT,
    title: str = "March Expenses",
) -> ExpenseReport:
    report = ExpenseReport(user_id=user_id, title=title, description="Desc", status=status)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def test_submit_report_changes_status_to_submitted(db_session: Session) -> None:
    user = _create_user(db_session, "u1@example.com")
    report = _create_report(db_session, user.id, ReportStatus.DRAFT)

    result = ReportService(db_session).submit_report(report.id, user)

    assert result.status == ReportStatus.SUBMITTED


def test_submit_report_from_approved_is_invalid(db_session: Session) -> None:
    user = _create_user(db_session, "u2@example.com")
    report = _create_report(db_session, user.id, ReportStatus.APPROVED)

    with pytest.raises(HTTPException) as exc:
        ReportService(db_session).submit_report(report.id, user)

    assert exc.value.status_code == 400


def test_update_report_fails_when_submitted(db_session: Session) -> None:
    user = _create_user(db_session, "u3@example.com")
    report = _create_report(db_session, user.id, ReportStatus.SUBMITTED)

    with pytest.raises(HTTPException) as exc:
        ReportService(db_session).update_report(report.id, user, title="New", description=None)

    assert exc.value.status_code == 400


def test_delete_report_only_allowed_in_draft(db_session: Session) -> None:
    user = _create_user(db_session, "u4@example.com")
    draft_report = _create_report(db_session, user.id, ReportStatus.DRAFT, title="Draft")
    submitted_report = _create_report(db_session, user.id, ReportStatus.SUBMITTED, title="Submitted")

    ReportService(db_session).delete_report(draft_report.id, user)

    with pytest.raises(HTTPException) as exc:
        ReportService(db_session).delete_report(submitted_report.id, user)

    assert exc.value.status_code == 400


def test_user_cannot_access_other_users_report(db_session: Session) -> None:
    owner = _create_user(db_session, "owner@example.com")
    another_user = _create_user(db_session, "another@example.com")
    report = _create_report(db_session, owner.id, ReportStatus.DRAFT)

    with pytest.raises(HTTPException) as exc:
        ReportService(db_session).get_owned_report(report.id, another_user)

    assert exc.value.status_code == 403


def test_admin_can_approve_submitted_report(db_session: Session) -> None:
    user = _create_user(db_session, "submitter@example.com")
    report = _create_report(db_session, user.id, ReportStatus.SUBMITTED)

    result = ReportService(db_session).approve_report(report.id)

    assert result.status == ReportStatus.APPROVED


def test_admin_reject_requires_submitted_state(db_session: Session) -> None:
    user = _create_user(db_session, "submitter2@example.com")
    report = _create_report(db_session, user.id, ReportStatus.DRAFT)

    with pytest.raises(HTTPException) as exc:
        ReportService(db_session).reject_report(report.id)

    assert exc.value.status_code == 400


def test_admin_can_list_reports_with_status_filter(db_session: Session) -> None:
    user = _create_user(db_session, "submitter3@example.com")
    _create_report(db_session, user.id, ReportStatus.DRAFT, title="Draft")
    _create_report(db_session, user.id, ReportStatus.SUBMITTED, title="Submitted")

    reports = ReportService(db_session).list_all_reports(status_filter=ReportStatus.SUBMITTED)

    assert len(reports) == 1
    assert reports[0].status == ReportStatus.SUBMITTED
