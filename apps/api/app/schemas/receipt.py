from datetime import date
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel


class ReceiptExtractedFields(BaseModel):
    merchant_name: str | None = None
    amount: Decimal | None = None
    currency: str | None = None
    transaction_date: date | None = None


class ReceiptUploadResponse(BaseModel):
    receipt_url: str
    extraction_status: Literal["completed", "failed"]
    extracted: ReceiptExtractedFields


class ReceiptPreviewResponse(BaseModel):
    extraction_status: Literal["completed", "failed"]
    extracted: ReceiptExtractedFields
