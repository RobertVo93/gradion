import asyncio
from datetime import date
from decimal import Decimal
from io import BytesIO

import pytest
from fastapi import HTTPException, UploadFile
from starlette.datastructures import Headers
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.expense_item import ExpenseItem
from app.models.expense_report import ExpenseReport, ReportStatus
from app.models.user import User, UserRole
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


def _create_item(db: Session, report_id: int) -> ExpenseItem:
    item = ExpenseItem(
        report_id=report_id,
        amount=Decimal("10.00"),
        currency="USD",
        category="Food",
        merchant_name="Store",
        transaction_date=date(2026, 4, 1),
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def _upload_file(filename: str, content_type: str, content: bytes = b"dummy") -> UploadFile:
    return UploadFile(
        file=BytesIO(content),
        filename=filename,
        headers=Headers({"content-type": content_type}),
    )


def test_upload_receipt_success_updates_item(db_session: Session, tmp_path) -> None:
    original_upload_dir = settings.upload_dir
    settings.upload_dir = str(tmp_path)

    try:
        user = _create_user(db_session, "receipt1@example.com")
        report = _create_report(db_session, user.id, status=ReportStatus.DRAFT)
        item = _create_item(db_session, report.id)

        service = ExpenseItemService(db_session)
        response = asyncio.run(
            service.upload_receipt(
                report_id=report.id,
                item_id=item.id,
                file=_upload_file("receipt.png", "image/png"),
                current_user=user,
            )
        )

        db_session.refresh(item)
        assert item.receipt_url is not None
        assert item.receipt_url.startswith("/uploads/receipts/")
        assert response.extraction_status == "completed"
        assert response.receipt_url == item.receipt_url
    finally:
        settings.upload_dir = original_upload_dir


def test_upload_receipt_fails_when_report_locked(db_session: Session, tmp_path) -> None:
    original_upload_dir = settings.upload_dir
    settings.upload_dir = str(tmp_path)

    try:
        user = _create_user(db_session, "receipt2@example.com")
        report = _create_report(db_session, user.id, status=ReportStatus.SUBMITTED)
        item = _create_item(db_session, report.id)

        service = ExpenseItemService(db_session)
        with pytest.raises(HTTPException) as exc:
            asyncio.run(
                service.upload_receipt(
                    report_id=report.id,
                    item_id=item.id,
                    file=_upload_file("receipt.png", "image/png"),
                    current_user=user,
                )
            )

        assert exc.value.status_code == 400
    finally:
        settings.upload_dir = original_upload_dir


def test_upload_receipt_rejects_unsupported_file_type(db_session: Session, tmp_path) -> None:
    original_upload_dir = settings.upload_dir
    settings.upload_dir = str(tmp_path)

    try:
        user = _create_user(db_session, "receipt3@example.com")
        report = _create_report(db_session, user.id, status=ReportStatus.DRAFT)
        item = _create_item(db_session, report.id)

        service = ExpenseItemService(db_session)
        with pytest.raises(HTTPException) as exc:
            asyncio.run(
                service.upload_receipt(
                    report_id=report.id,
                    item_id=item.id,
                    file=_upload_file("receipt.txt", "text/plain"),
                    current_user=user,
                )
            )

        assert exc.value.status_code == 400
    finally:
        settings.upload_dir = original_upload_dir
