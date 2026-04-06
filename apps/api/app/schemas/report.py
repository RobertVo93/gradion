from datetime import datetime
from decimal import Decimal

from pydantic import BaseModel, ConfigDict, Field

from app.models.expense_report import ReportStatus


class ReportCreateRequest(BaseModel):
    title: str = Field(min_length=1, max_length=255)
    description: str | None = None


class ReportUpdateRequest(BaseModel):
    title: str | None = Field(default=None, min_length=1, max_length=255)
    description: str | None = None


class ReportResponse(BaseModel):
    id: int
    user_id: int
    title: str
    description: str | None
    status: ReportStatus
    total_amount: Decimal
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)
