
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from app.core.security import get_current_user
from app.db.session import get_db
from app.models.customer import Customer
from app.models.loan_application import LoanApplication
from app.models.user import User
from app.schemas.loan_application import (
    LoanApplicationCreate,
    LoanApplicationResponse,
    LoanDecisionRequest,
)
router = APIRouter(prefix="/loans", tags=["Loans"])


def require_loan_officer(current_user: User) -> None:
    if current_user.role != "LOAN_OFFICER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Loan officer access required",
        )


@router.post(
    "",
    response_model=LoanApplicationResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_loan(
    loan_data: LoanApplicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role != "CUSTOMER":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only customers can submit loan applications",
        )

    customer = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer profile not found",
        )

    loan = LoanApplication(
        customer_id=customer.id,
        loan_amount=loan_data.loan_amount,
        purpose=loan_data.purpose,
    )

    db.add(loan)

    try:
        db.commit()
        db.refresh(loan)
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid loan data",
        )

    return loan


@router.get("", response_model=list[LoanApplicationResponse])
def get_loans(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if current_user.role == "LOAN_OFFICER":
        return (
            db.query(LoanApplication)
            .order_by(LoanApplication.id)
            .all()
        )

    customer = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer profile not found",
        )

    return (
        db.query(LoanApplication)
        .filter(LoanApplication.customer_id == customer.id)
        .order_by(LoanApplication.id)
        .all()
    )


@router.get("/filter", response_model=list[LoanApplicationResponse])
def filter_loans(
    status_filter: str = Query(
        alias="status",
        pattern="^(PENDING_REVIEW|APPROVED|REJECTED)$",
    ),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_loan_officer(current_user)

    return (
        db.query(LoanApplication)
        .filter(LoanApplication.status == status_filter)
        .order_by(LoanApplication.created_at.desc())
        .all()
    )


@router.get("/{loan_id}", response_model=LoanApplicationResponse)
def get_loan(
    loan_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    loan = db.get(LoanApplication, loan_id)

    if loan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found",
        )

    if current_user.role == "LOAN_OFFICER":
        return loan

    customer = (
        db.query(Customer)
        .filter(Customer.user_id == current_user.id)
        .first()
    )

    if customer is None:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Customer profile not found",
        )

    if loan.customer_id != customer.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You cannot access another customer's loan",
        )

    return loan


@router.patch(
    "/{loan_id}/decision",
    response_model=LoanApplicationResponse,
)
def decide_loan(
    loan_id: int,
    decision: LoanDecisionRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    require_loan_officer(current_user)

    loan = db.get(LoanApplication, loan_id)

    if loan is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Loan application not found",
        )

    if loan.status != "PENDING_REVIEW":
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Only pending applications can be decided",
        )

    if decision.status == "REJECTED" and not (
        decision.decision_reason
        and decision.decision_reason.strip()
    ):
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail="A reason is required when rejecting an application",
        )

    loan.status = decision.status
    loan.decision_reason = (
        decision.decision_reason.strip()
        if decision.decision_reason
        else None
    )
    loan.decided_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(loan)

    return loan
