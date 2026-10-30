from pydantic import BaseModel, ConfigDict, EmailStr, Field


class CustomerCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(min_length=7, max_length=20)


class CustomerResponse(BaseModel):
    id: int
    full_name: str
    email: EmailStr
    phone: str

    model_config = ConfigDict(from_attributes=True)