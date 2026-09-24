from datetime import datetime, timedelta
from fastapi import APIRouter, HTTPException
from app.models.schemas import BookingRequest, BookingResponse
from app.services import google_service
from app.config import settings

router = APIRouter(prefix="/api/booking", tags=["booking"])


@router.post("", response_model=BookingResponse)
def book_appointment(req: BookingRequest):
    try:
        start = datetime.fromisoformat(req.preferred_datetime)
    except ValueError:
        raise HTTPException(400, "preferred_datetime must be ISO 8601, e.g. 2026-09-05T10:00:00")

    end = start + timedelta(minutes=req.duration_minutes)

    attendees = [req.email]
    if settings.owner_notification_email:
        attendees.append(settings.owner_notification_email)

    event = google_service.create_calendar_event(
        summary=f"Aporum Sales Call — {req.name}",
        description=(
            f"Sales appointment booked via website.\n"
            f"Customer: {req.name}\nPhone: {req.phone}\nEmail: {req.email}\n"
            f"Notes: {req.notes or '-'}"
        ),
        start_iso=start.isoformat(),
        end_iso=end.isoformat(),
        attendee_emails=attendees,
    )

    # Explicit confirmation emails in addition to the calendar invite (belt & braces).
    google_service.send_email(
        to=req.email,
        subject="Your Aporum Energy appointment is booked",
        body=(
            f"Hi {req.name},\n\nYour appointment with a Aporum sales specialist is confirmed for "
            f"{start.strftime('%A %d %B %Y, %I:%M %p')} ({req.duration_minutes} minutes).\n\n"
            f"We'll call you on {req.phone}. You'll also receive a calendar invite.\n\n"
            f"Thanks,\nThe Aporum Team"
        ),
    )
    if settings.owner_notification_email:
        google_service.send_email(
            to=settings.owner_notification_email,
            subject=f"New sales appointment booked — {req.name}",
            body=(
                f"New appointment booked via website.\n\n"
                f"Customer: {req.name}\nPhone: {req.phone}\nEmail: {req.email}\n"
                f"Time: {start.isoformat()}\nNotes: {req.notes or '-'}"
            ),
        )

    return BookingResponse(status="confirmed", event_link=event.get("html_link"))
