
from sqlalchemy import (
    String,
    DateTime,
    ForeignKey,
    Numeric,
    CheckConstraint,
)
from sqlalchemy.orm import Mapped, mapped_column
from sqlalchemy.sql import func

from app.db.base import Base


class LoanApplication(Base):
    __tablename__ = "loan_applications"

    __table_args__ = (
        CheckConstraint(
            "loan_amount > 0",
            name="ck_loan_amount_positive",
        ),
    )

    id: Mapped[int] = mapped_column(
        primary_key=True,
        index=True,
    )

    customer_id: Mapped[int] = mapped_column(
        ForeignKey("customers.id"),
        nullable=False,
        index=True,
    )

    loan_amount: Mapped[float] = mapped_column(
        Numeric(12, 2),
        nullable=False,
    )

    purpose: Mapped[str] = mapped_column(
        String(255),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
        default="PENDING_REVIEW",
        server_default="PENDING_REVIEW",
    )

    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    decision_reason: Mapped[str | None] = mapped_column(
        String(500),
        nullable=True,
    )

    decided_at: Mapped[DateTime | None] = mapped_column(
        DateTime(timezone=True),
        nullable=True,
    )
