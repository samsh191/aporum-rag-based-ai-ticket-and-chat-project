"""
Gmail + Google Calendar integration using an OAuth2 refresh token (not a service
account), because Gmail "send as a real mailbox" requires a real Google account's
consent. See docs/GOOGLE_SETUP.md for the one-time steps to obtain
GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET / GOOGLE_REFRESH_TOKEN.

Once those three env vars are set to real values, this module sends email and
creates calendar events unattended (no browser popup) — which is what you need
running on Render.

Design note: every public function here fails SOFT. A customer submitting a
form should never see a 500 error just because Gmail/Calendar credentials are
missing, wrong, or Google is temporarily unreachable — the ticket or booking
itself should still be created. Failures are logged to the console instead.
"""
import base64
import traceback
from email.mime.text import MIMEText
from google.oauth2.credentials import Credentials
from googleapiclient.discovery import build
from app.config import settings

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

# Values like the ones in .env.example (xxxx, sk-your-openai-key, etc.) count as
# "not really configured" — treat them the same as blank so a copy-pasted
# example file doesn't cause real API calls with garbage credentials.
_PLACEHOLDER_VALUES = {"", "xxxx", "xxx", "your-value-here", "changeme", "change-me"}


def _google_configured() -> bool:
    values = [settings.google_refresh_token, settings.google_client_id, settings.google_client_secret]
    return all(v and v.strip().lower() not in _PLACEHOLDER_VALUES for v in values)


def _get_credentials() -> Credentials:
    return Credentials(
        token=None,
        refresh_token=settings.google_refresh_token,
        token_uri="https://oauth2.googleapis.com/token",
        client_id=settings.google_client_id,
        client_secret=settings.google_client_secret,
        scopes=SCOPES,
    )


def _gmail_client():
    return build("gmail", "v1", credentials=_get_credentials())


def _calendar_client():
    return build("calendar", "v3", credentials=_get_credentials())


def send_email(to: str, subject: str, body: str, cc: str | None = None) -> dict:
    """Sends a plain-text email via Gmail API, from settings.company_sender_email.
    Never raises — returns a status dict either way so callers can proceed regardless."""
    if not _google_configured():
        print(f"[DEV MODE - Gmail not configured] Would send email to={to} subject={subject}\n{body}")
        return {"status": "skipped_no_google_config"}

    try:
        message = MIMEText(body)
        message["to"] = to
        message["from"] = settings.company_sender_email
        message["subject"] = subject
        if cc:
            message["cc"] = cc

        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        service = _gmail_client()
        sent = service.users().messages().send(userId="me", body={"raw": raw}).execute()
        return {"status": "sent", "message_id": sent.get("id")}
    except Exception as e:
        print(f"[Gmail ERROR] Failed to send email to={to} subject={subject}: {e}")
        traceback.print_exc()
        return {"status": "failed", "error": str(e)}


def create_calendar_event(summary: str, description: str, start_iso: str, end_iso: str,
                           attendee_emails: list[str], timezone: str = "Australia/Melbourne") -> dict:
    """Creates a Google Calendar event and invites attendees (customer + sales owner).
    Never raises — returns a status dict either way so callers can proceed regardless."""
    if not _google_configured():
        print(f"[DEV MODE - Calendar not configured] Would create event '{summary}' at {start_iso}")
        return {"status": "skipped_no_google_config"}

    try:
        service = _calendar_client()
        event = {
            "summary": summary,
            "description": description,
            "start": {"dateTime": start_iso, "timeZone": timezone},
            "end": {"dateTime": end_iso, "timeZone": timezone},
            "attendees": [{"email": e} for e in attendee_emails],
            "reminders": {"useDefault": True},
        }
        created = service.events().insert(
            calendarId=settings.calendar_id, body=event, sendUpdates="all"
        ).execute()
        return {"status": "created", "event_id": created.get("id"), "html_link": created.get("htmlLink")}
    except Exception as e:
        print(f"[Calendar ERROR] Failed to create event '{summary}' at {start_iso}: {e}")
        traceback.print_exc()
        return {"status": "failed", "error": str(e)}
