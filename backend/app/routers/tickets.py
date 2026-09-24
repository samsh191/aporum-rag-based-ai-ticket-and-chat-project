from fastapi import APIRouter, HTTPException, Header
from app.models.schemas import TicketCreateRequest, TicketResponse
from app.services import excel_service, rag_service, openai_service, google_service
from app.config import settings

router = APIRouter(prefix="/api/tickets", tags=["tickets"])


def _require_admin(x_automation_secret: str):
    """Ticket data includes customer PII (name, phone, email, inquiry text),
    so listing/reading tickets is gated behind the same shared secret used to
    protect /process — reused here as a simple admin key, not full user auth."""
    if x_automation_secret != settings.automation_secret:
        raise HTTPException(401, "Invalid admin key")


@router.post("", response_model=TicketResponse)
def create_ticket(req: TicketCreateRequest):
    """Called by the 'Inquire Now' form on the website. Writes a new row to the Excel ticket store.
    Intentionally NOT gated — this is the public-facing submission endpoint."""
    ticket = excel_service.create_ticket(
        customer_name=req.name,
        phone=req.phone,
        email=req.email,
        category=req.category,
        inquiry_details=req.inquiry,
    )
    # Acknowledge receipt to the customer immediately.
    google_service.send_email(
        to=ticket["email"],
        subject=f"We received your inquiry — Ticket {ticket['ticket_id']}",
        body=(
            f"Hi {ticket['customer_name']},\n\n"
            f"Thanks for reaching out to Aporum Energy. We've logged your inquiry as ticket "
            f"{ticket['ticket_id']} and our team (or our AI assistant, for simple requests) will "
            f"get back to you shortly, usually within 1 business day.\n\n"
            f"Your message:\n\"{ticket['inquiry_details']}\"\n\n"
            f"Thanks,\nThe Aporum Support Team"
        ),
    )
    return TicketResponse(ticket_id=ticket["ticket_id"], status=ticket["status"], priority=ticket["priority"])


@router.get("")
def list_tickets(status: str | None = None, x_automation_secret: str = Header(default="")):
    _require_admin(x_automation_secret)
    return excel_service.list_tickets(status=status)


@router.get("/{ticket_id}")
def get_ticket(ticket_id: str, x_automation_secret: str = Header(default="")):
    _require_admin(x_automation_secret)
    ticket = excel_service.get_ticket(ticket_id)
    if not ticket:
        raise HTTPException(404, "Ticket not found")
    return ticket


@router.post("/process")
def process_open_tickets(x_automation_secret: str = Header(default="")):
    """
    The AI ticketing agent. For every 'open' ticket:
      1. Reads the ticket details.
      2. Retrieves relevant chunks from the company PDFs (RAG).
      3. Asks the model to draft a reply + a confidence score.
      4. If confident enough -> emails the customer the AI's reply, marks ticket 'closed'.
         Otherwise -> marks 'manual_review_required', emails the customer a holding message
         letting them know a specialist will follow up, and emails the owner inbox so a
         human actually sees it.

    Protect this endpoint with a shared secret and call it on a schedule
    (cron on Render, or the included APScheduler job — see app/scheduler.py).
    """
    if x_automation_secret != settings.automation_secret:
        raise HTTPException(401, "Invalid automation secret")

    open_tickets = excel_service.list_tickets(status="open")
    results = []

    for ticket in open_tickets:
        query = f"{ticket['category']}: {ticket['inquiry_details']}"
        chunks = rag_service.retrieve(query, k=4)
        context = rag_service.format_context(chunks)

        ai_result = openai_service.draft_ticket_reply(ticket, context)
        confidence = float(ai_result.get("confidence", 0))

        if ai_result.get("can_resolve") and confidence >= settings.auto_reply_confidence_threshold:
            google_service.send_email(
                to=ticket["email"],
                subject=f"Re: Your Aporum inquiry — Ticket {ticket['ticket_id']}",
                body=ai_result["reply_email_body"],
            )
            excel_service.update_ticket(
                ticket["ticket_id"],
                status="closed",
                ai_confidence=confidence,
                ai_reply=ai_result["reply_email_body"],
            )
            results.append({"ticket_id": ticket["ticket_id"], "outcome": "closed_auto_replied"})
        else:
            reason = ai_result.get("escalation_reason") or "AI confidence below threshold"
            excel_service.update_ticket(
                ticket["ticket_id"],
                status="manual_review_required",
                ai_confidence=confidence,
                escalation_reason=reason,
            )

            # Let the customer know a human will follow up — don't leave them hearing nothing.
            google_service.send_email(
                to=ticket["email"],
                subject=f"We're looking into your inquiry — Ticket {ticket['ticket_id']}",
                body=(
                    f"Hi {ticket['customer_name']},\n\n"
                    f"Thanks for your patience. Your inquiry (ticket {ticket['ticket_id']}) needs a closer "
                    f"look from one of our specialists rather than an automated reply, so we want to make "
                    f"sure we get it right.\n\n"
                    f"Someone from our team will be in touch within 1 business day.\n\n"
                    f"Your message:\n\"{ticket['inquiry_details']}\"\n\n"
                    f"Thanks,\nThe Aporum Support Team"
                ),
            )

            # Notify the internal owner inbox so a human actually picks it up.
            if settings.owner_notification_email:
                google_service.send_email(
                    to=settings.owner_notification_email,
                    subject=f"[Manual review needed] Ticket {ticket['ticket_id']} ({ticket['category']})",
                    body=(
                        f"Ticket {ticket['ticket_id']} needs manual review.\n\n"
                        f"Customer: {ticket['customer_name']} <{ticket['email']}>\n"
                        f"Category: {ticket['category']}\n"
                        f"Inquiry: {ticket['inquiry_details']}\n\n"
                        f"Reason for escalation: {reason}\n"
                        f"AI confidence: {confidence:.2f}"
                    ),
                )
            else:
                print(f"[WARN] Ticket {ticket['ticket_id']} escalated but OWNER_NOTIFICATION_EMAIL is not set "
                      f"— no internal notification was sent. Set it in .env so escalations reach a human.")

            results.append({"ticket_id": ticket["ticket_id"], "outcome": "escalated", "reason": reason})

    return {"processed": len(results), "results": results}
