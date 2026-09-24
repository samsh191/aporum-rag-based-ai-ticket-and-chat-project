from typing import Optional, Literal
from pydantic import BaseModel, EmailStr, Field


class ChatTurn(BaseModel):
    role: Literal["user", "assistant"]
    content: str


class ChatRequest(BaseModel):
    message: str
    history: list[ChatTurn] = Field(default_factory=list)


class ChatResponse(BaseModel):
    reply: str
    sources: list[str] = Field(default_factory=list)


class TicketCreateRequest(BaseModel):
    name: str
    phone: str
    email: EmailStr
    category: Literal["Billing", "Complaint", "Support", "Sales"]
    inquiry: str


class TicketResponse(BaseModel):
    ticket_id: str
    status: str
    priority: str


class BookingRequest(BaseModel):
    name: str
    email: EmailStr
    phone: str
    preferred_datetime: str  # ISO 8601, e.g. "2026-09-05T10:00:00"
    duration_minutes: int = 30
    notes: Optional[str] = ""


class BookingResponse(BaseModel):
    status: str
    event_link: Optional[str] = None
