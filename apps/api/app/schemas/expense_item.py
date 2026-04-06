from datetime import date, datetime
from decimal import Decimal
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class CurrencyCode(str, Enum):
    VND = "VND"
    USD = "USD"
    EUR = "EUR"
    JPY = "JPY"


class ExpenseItemCreateRequest(BaseModel):
    amount: Decimal = Field(gt=0)
    currency: CurrencyCode = CurrencyCode.VND
    category: str = Field(min_length=1, max_length=100)
    merchant_name: str | None = Field(default=None, max_length=255)
    transaction_date: date
    receipt_url: str | None = Field(default=None, max_length=500)


class ExpenseItemUpdateRequest(BaseModel):
    amount: Decimal | None = Field(default=None, gt=0)
    currency: CurrencyCode | None = None
    category: str | None = Field(default=None, min_length=1, max_length=100)
    merchant_name: str | None = Field(default=None, max_length=255)
    transaction_date: date | None = None
    receipt_url: str | None = Field(default=None, max_length=500)


class ExpenseItemResponse(BaseModel):
    id: int
    report_id: int
    amount: Decimal
    currency: CurrencyCode
    category: str
    merchant_name: str | None
    transaction_date: date
    receipt_url: str | None
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
