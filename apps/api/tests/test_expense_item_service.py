from datetime import date
from decimal import Decimal

import pytest
from fastapi import HTTPException
from sqlalchemy.orm import Session

from app.models.expense_item import ExpenseItem
from app.models.expense_report import ExpenseReport, ReportStatus
from app.models.user import User, UserRole
from app.schemas.expense_item import ExpenseItemCreateRequest, ExpenseItemUpdateRequest
from app.services.expense_item_service import ExpenseItemService


def _create_user(db: Session, email: str, role: UserRole = UserRole.USER) -> User:
    user = User(email=email, password_hash="hash", role=role)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def _create_report(db: Session, user_id: int, status: ReportStatus = ReportStatus.DRAFT) -> ExpenseReport:
    report = ExpenseReport(user_id=user_id, title="Report", description="desc", status=status)
    db.add(report)
    db.commit()
    db.refresh(report)
    return report


def _create_item(db: Session, report_id: int, amount: Decimal = Decimal("10.00")) -> ExpenseItem:
    item = ExpenseItem(
        report_id=report_id,
        amount=amount,
        currency="USD",
        category="Food",
        merchant_name="Store",
        transaction_date=date(2026, 4, 1),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def test_create_item_updates_report_total(db_session: Session) -> None:
    user = _create_user(db_session, "item1@example.com")
    report = _create_report(db_session, user.id)

    payload = ExpenseItemCreateRequest(
        amount=Decimal("12.50"),
        category="Travel",
        merchant_name="Grab",
        transaction_date=date(2026, 4, 1),
    )

    item = ExpenseItemService(db_session).create_item(report.id, payload, user)
    db_session.refresh(report)

    assert item.currency == "VND"
    assert report.total_amount == Decimal("12.50")


def test_cannot_create_item_when_report_locked(db_session: Session) -> None:
    user = _create_user(db_session, "item2@example.com")
    report = _create_report(db_session, user.id, status=ReportStatus.SUBMITTED)

    payload = ExpenseItemCreateRequest(
        amount=Decimal("8.00"),
        currency="USD",
        category="Meal",
        transaction_date=date(2026, 4, 1),
    )

    with pytest.raises(HTTPException) as exc:
        ExpenseItemService(db_session).create_item(report.id, payload, user)

    assert exc.value.status_code == 400


def test_create_item_from_rejected_is_blocked_until_reedit(db_session: Session) -> None:
    user = _create_user(db_session, "item2b@example.com")
    report = _create_report(db_session, user.id, status=ReportStatus.REJECTED)

    payload = ExpenseItemCreateRequest(
        amount=Decimal("8.00"),
        currency="USD",
        category="Meal",
        transaction_date=date(2026, 4, 1),
    )

    with pytest.raises(HTTPException) as exc:
        ExpenseItemService(db_session).create_item(report.id, payload, user)

    assert exc.value.status_code == 400


def test_update_item_recalculates_total(db_session: Session) -> None:
    user = _create_user(db_session, "item3@example.com")
    report = _create_report(db_session, user.id)
    item = _create_item(db_session, report.id, amount=Decimal("10.00"))

    payload = ExpenseItemUpdateRequest(amount=Decimal("17.25"))
    ExpenseItemService(db_session).update_item(report.id, item.id, payload, user)
    db_session.refresh(report)

    assert report.total_amount == Decimal("17.25")


def test_delete_item_recalculates_total(db_session: Session) -> None:
    user = _create_user(db_session, "item4@example.com")
    report = _create_report(db_session, user.id)
    item1 = _create_item(db_session, report.id, amount=Decimal("5.00"))
    item2 = _create_item(db_session, report.id, amount=Decimal("7.00"))

    service = ExpenseItemService(db_session)
    db_session.refresh(report)
    assert report.total_amount == Decimal("12.00")

    service.delete_item(report.id, item1.id, user)
    db_session.refresh(report)
    assert report.total_amount == Decimal("7.00")

    service.delete_item(report.id, item2.id, user)
    db_session.refresh(report)
    assert report.total_amount == Decimal("0")


def test_cannot_modify_item_from_another_report(db_session: Session) -> None:
    user = _create_user(db_session, "item5@example.com")
    report_a = _create_report(db_session, user.id)
    report_b = _create_report(db_session, user.id)
    item = _create_item(db_session, report_a.id)

    with pytest.raises(HTTPException) as exc:
        ExpenseItemService(db_session).update_item(
            report_id=report_b.id,
            item_id=item.id,
            payload=ExpenseItemUpdateRequest(category="Taxi"),
            current_user=user,
        )

    assert exc.value.status_code == 400
