
from fastapi import APIRouter, Depends, HTTPException
from google.auth.transport import requests
from google.oauth2 import id_token
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from pydantic import BaseModel, EmailStr, Field

from app.db.session import get_db, settings
from app.models.user import User
from app.models.customer import Customer
from app.core.security import create_access_token, get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


class GoogleLoginRequest(BaseModel):
    credential: str


class ProfileUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=100)
    phone: str | None = Field(default=None, min_length=7, max_length=20)


@router.get("/me")
def get_my_profile(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    if current_user.role == "CUSTOMER":
        profile = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        return {
            "id": current_user.id,
            "full_name": profile.full_name if profile else current_user.full_name,
            "email": current_user.email,
            "phone": profile.phone if profile else None,
            "role": current_user.role,
        }

    return {
        "id": current_user.id,
        "full_name": current_user.full_name,
        "email": current_user.email,
        "phone": current_user.phone,
        "role": current_user.role,
    }


@router.patch("/me")
def update_my_profile(
    payload: ProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    updates = payload.model_dump(exclude_unset=True)

    if not updates:
        raise HTTPException(status_code=400, detail="No profile changes provided")

    if "full_name" in updates:
        if updates["full_name"] is None or not updates["full_name"].strip():
            raise HTTPException(status_code=400, detail="Name cannot be empty")
        updates["full_name"] = updates["full_name"].strip()

    if "phone" in updates:
        if updates["phone"] is None or not updates["phone"].strip():
            raise HTTPException(status_code=400, detail="Phone cannot be empty")
        updates["phone"] = updates["phone"].strip()

    if current_user.role == "CUSTOMER":
        profile = db.query(Customer).filter(
            Customer.user_id == current_user.id
        ).first()

        if not profile:
            raise HTTPException(status_code=404, detail="Customer profile not found")

        for field, value in updates.items():
            setattr(profile, field, value)

    else:
        for field, value in updates.items():
            setattr(current_user, field, value)

    try:
        db.commit()
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="Unable to update profile")

    db.refresh(current_user)

    if current_user.role == "CUSTOMER":
        db.refresh(profile)
        full_name = profile.full_name
        phone = profile.phone
    else:
        full_name = current_user.full_name
        phone = current_user.phone

    return {
        "message": "Profile updated successfully",
        "id": current_user.id,
        "full_name": full_name,
        "email": current_user.email,
        "phone": phone,
        "role": current_user.role,
    }


@router.post("/google")
def google_login(
    payload: GoogleLoginRequest,
    db: Session = Depends(get_db),
):
    try:
        google_user = id_token.verify_oauth2_token(
            payload.credential,
            requests.Request(),
            settings.google_client_id,
        )
    except ValueError:
        raise HTTPException(
            status_code=401,
            detail="Invalid Google identity token",
        )

    google_sub = google_user.get("sub")
    email = google_user.get("email")
    email_verified = google_user.get("email_verified", False)
    if not google_sub or not email or not email_verified:
        raise HTTPException(
            status_code=401,
            detail="Google account email must be verified",
        )
    google_name = google_user.get("name") or email.split("@")[0]
    user = db.query(User).filter(User.google_sub == google_sub).first()

    if user is None:
        existing_email = db.query(User).filter(User.email == email).first()

        if existing_email:
            raise HTTPException(
                status_code=409,
                detail="Email already belongs to another account",
            )

        user = User(
            google_sub=google_sub,
            email=email,
            full_name=google_name,
            role="CUSTOMER",
            is_active=True,
        )

        db.add(user)

        try:
            db.commit()
            db.refresh(user)
        except IntegrityError:
            db.rollback()
            raise HTTPException(
                status_code=409,
                detail="Account already exists; please sign in again",
            )

    if not user.is_active:
        raise HTTPException(
            status_code=403,
            detail="Account is disabled",
        )

    # Populate missing names for existing users.
    if not user.full_name:
        user.full_name = google_name
        db.commit()
        db.refresh(user)

    if user.role == "CUSTOMER":
        customer = db.query(Customer).filter(
            Customer.user_id == user.id
        ).first()

        if customer is None:
            customer = Customer(
                user_id=user.id,
                full_name=google_name,
                email=email,
                phone="0000000",
            )

            db.add(customer)

            try:
                db.commit()
                db.refresh(customer)
            except IntegrityError:
                db.rollback()
                raise HTTPException(
                    status_code=409,
                    detail="Could not create customer profile",
                )

    access_token = create_access_token(
        user_id=user.id,
        role=user.role,
    )

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": {
            "id": user.id,
            "full_name": user.full_name,
            "email": user.email,
            "role": user.role,
        },
    }
