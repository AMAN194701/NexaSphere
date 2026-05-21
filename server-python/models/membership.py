from pydantic import BaseModel, EmailStr, Field


class MembershipRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    phone: str = Field(..., pattern=r'^\\d{10}$')
    message: str = Field(..., min_length=5, max_length=500)