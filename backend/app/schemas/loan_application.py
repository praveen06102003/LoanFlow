
from datetime import datetime
from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, ConfigDict, Field


class LoanApplicationCreate(BaseModel):
    loan_amount: Decimal = Field(
        gt=0,
        max_digits=12,
        decimal_places=2,
    )
    purpose: str = Field(
        min_length=3,
        max_length=255,
    )


class LoanApplicationResponse(BaseModel):
    id: int
    customer_id: int
    loan_amount: Decimal
    purpose: str
    status: str
    created_at: datetime
    decision_reason: str | None = None
    decided_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)


class LoanDecisionRequest(BaseModel):
    status: Literal["APPROVED", "REJECTED"]
    decision_reason: str | None = Field(
        default=None,
        max_length=500,
    )
