from decimal import Decimal

from sqlalchemy import func, select
from sqlalchemy.orm import Session

from app.models.expense_item import ExpenseItem


class ExpenseItemRepository:
    def __init__(self, db: Session):
        self.db = db

    def list_by_report(self, report_id: int) -> list[ExpenseItem]:
        statement = select(ExpenseItem).where(ExpenseItem.report_id == report_id).order_by(ExpenseItem.transaction_date.desc())
        return list(self.db.execute(statement).scalars().all())

    def get_by_id(self, item_id: int) -> ExpenseItem | None:
        return self.db.get(ExpenseItem, item_id)

    def create(
        self,
        report_id: int,
        amount: Decimal,
        currency: str,
        category: str,
        merchant_name: str | None,
        transaction_date,
        receipt_url: str | None,
    ) -> ExpenseItem:
        item = ExpenseItem(
            report_id=report_id,
            amount=amount,
            currency=currency,
            category=category,
            merchant_name=merchant_name,
            transaction_date=transaction_date,
            receipt_url=receipt_url,
        )
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def update(self, item: ExpenseItem) -> ExpenseItem:
        self.db.add(item)
        self.db.commit()
        self.db.refresh(item)
        return item

    def delete(self, item: ExpenseItem) -> None:
        self.db.delete(item)
        self.db.commit()

    def sum_amounts_by_report(self, report_id: int) -> Decimal:
        statement = select(func.coalesce(func.sum(ExpenseItem.amount), 0)).where(ExpenseItem.report_id == report_id)
        total = self.db.execute(statement).scalar_one()
        return Decimal(str(total))
