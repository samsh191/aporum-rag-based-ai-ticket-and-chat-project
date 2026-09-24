import os
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    # OpenAI
    openai_api_key: str = os.getenv("OPENAI_API_KEY", "")
    chat_model: str = os.getenv("CHAT_MODEL", "gpt-4o-mini")
    embed_model: str = os.getenv("EMBED_MODEL", "text-embedding-3-small")

    # CORS
    frontend_origin: str = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

    # Excel ticket store
    tickets_path: str = os.getenv("TICKETS_PATH", "data/tickets.xlsx")

    # Google (Gmail + Calendar) — OAuth2 "installed app" refresh-token flow.
    # See docs/GOOGLE_SETUP.md for how to obtain these.
    google_client_id: str = os.getenv("GOOGLE_CLIENT_ID", "")
    google_client_secret: str = os.getenv("GOOGLE_CLIENT_SECRET", "")
    google_refresh_token: str = os.getenv("GOOGLE_REFRESH_TOKEN", "")

    # Mailbox that sends on behalf of the company + the internal owner inbox
    company_sender_email: str = os.getenv("COMPANY_SENDER_EMAIL", "")
    owner_notification_email: str = os.getenv("OWNER_NOTIFICATION_EMAIL", "")

    # Google Calendar
    calendar_id: str = os.getenv("GOOGLE_CALENDAR_ID", "primary")

    # Simple shared-secret to protect the /api/tickets/process endpoint
    # (called by a cron job / scheduler, not the public frontend)
    automation_secret: str = os.getenv("AUTOMATION_SECRET", "change-me")

    # AI confidence threshold below which a ticket is escalated to a human
    auto_reply_confidence_threshold: float = float(os.getenv("AUTO_REPLY_CONFIDENCE_THRESHOLD", "0.7"))

    class Config:
        env_file = ".env"
        extra = "ignore"  # .env may contain vars (GOOGLE_CALENDAR_ID, etc.) not
                           # mapped 1:1 to field names below — that's fine, we
                           # read those manually via os.getenv() above.


settings = Settings()
