from fastapi import HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.expense_item import ExpenseItem
from app.models.user import User
from app.repositories.expense_item_repository import ExpenseItemRepository
from app.repositories.report_repository import ReportRepository
from app.schemas.expense_item import ExpenseItemCreateRequest, ExpenseItemUpdateRequest
from app.schemas.receipt import ReceiptUploadResponse
from app.services.receipt_extraction_service import ReceiptExtractionService
from app.services.receipt_storage_service import ReceiptStorageService
from app.services.report_service import ReportService


class ExpenseItemService:
    def __init__(self, db: Session):
        self.item_repo = ExpenseItemRepository(db)
        self.report_repo = ReportRepository(db)
        self.report_service = ReportService(db)
        self.storage_service = ReceiptStorageService(settings)
        self.extraction_service = ReceiptExtractionService()

    def list_items(self, report_id: int, current_user: User) -> list[ExpenseItem]:
        self.report_service.get_owned_report(report_id=report_id, current_user=current_user)
        return self.item_repo.list_by_report(report_id=report_id)

    def create_item(self, report_id: int, payload: ExpenseItemCreateRequest, current_user: User) -> ExpenseItem:
        report = self.report_service.get_owned_report(report_id=report_id, current_user=current_user)
        report = self.report_service.ensure_draft_for_edit(report)

        item = self.item_repo.create(
            report_id=report.id,
            amount=payload.amount,
            currency=payload.currency.upper(),
            category=payload.category,
            merchant_name=payload.merchant_name,
            transaction_date=payload.transaction_date,
            receipt_url=payload.receipt_url,
        )
        self._recalculate_report_total(report.id)
        return item

    def update_item(
        self,
        report_id: int,
        item_id: int,
        payload: ExpenseItemUpdateRequest,
        current_user: User,
    ) -> ExpenseItem:
        report = self.report_service.get_owned_report(report_id=report_id, current_user=current_user)
        report = self.report_service.ensure_draft_for_edit(report)

        item = self._get_report_item(report_id=report.id, item_id=item_id)

        if payload.amount is not None:
            item.amount = payload.amount
        if payload.currency is not None:
            item.currency = payload.currency.upper()
        if payload.category is not None:
            item.category = payload.category
        if payload.merchant_name is not None:
            item.merchant_name = payload.merchant_name
        if payload.transaction_date is not None:
            item.transaction_date = payload.transaction_date
        if payload.receipt_url is not None:
            item.receipt_url = payload.receipt_url

        item = self.item_repo.update(item)
        self._recalculate_report_total(report.id)
        return item

    def delete_item(self, report_id: int, item_id: int, current_user: User) -> None:
        report = self.report_service.get_owned_report(report_id=report_id, current_user=current_user)
        report = self.report_service.ensure_draft_for_edit(report)

        item = self._get_report_item(report_id=report.id, item_id=item_id)
        self.item_repo.delete(item)
        self._recalculate_report_total(report.id)

    async def upload_receipt(
        self,
        report_id: int,
        item_id: int,
        file: UploadFile,
        current_user: User,
    ) -> ReceiptUploadResponse:
        report = self.report_service.get_owned_report(report_id=report_id, current_user=current_user)
        report = self.report_service.ensure_draft_for_edit(report)
        item = self._get_report_item(report_id=report.id, item_id=item_id)

        receipt_url, file_path = await self.storage_service.save(file)
        item.receipt_url = receipt_url
        self.item_repo.update(item)

        extraction_status, extracted = self.extraction_service.extract(file_path=file_path, content_type=file.content_type)
        return ReceiptUploadResponse(
            receipt_url=receipt_url,
            extraction_status=extraction_status,
            extracted=extracted,
        )

    def _recalculate_report_total(self, report_id: int) -> None:
        report = self.report_repo.get_by_id(report_id)
        if not report:
            return
        report.total_amount = self.item_repo.sum_amounts_by_report(report_id)
        self.report_repo.update(report)

    def _get_report_item(self, report_id: int, item_id: int) -> ExpenseItem:
        item = self.item_repo.get_by_id(item_id)
        if not item:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Expense item not found")
        if item.report_id != report_id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Item does not belong to report")
        return item
