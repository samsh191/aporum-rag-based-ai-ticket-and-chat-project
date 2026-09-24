"""
Optional convenience: runs the ticket-processing agent automatically every N minutes
inside the same process, so you don't have to wire up an external cron job.

On Render's free tier the web service can sleep when idle, in which case this won't
fire — for guaranteed processing, instead use Render's "Cron Job" service to call
POST /api/tickets/process on a schedule (see docs/DEPLOYMENT.md). Both approaches can
coexist safely since processing only acts on tickets with status == 'open'.
"""
import os
import requests
from apscheduler.schedulers.background import BackgroundScheduler
from app.config import settings

INTERVAL_MINUTES = int(os.getenv("TICKET_PROCESS_INTERVAL_MINUTES", "10"))


def _run_ticket_processing():
    try:
        resp = requests.post(
            "http://127.0.0.1:8000/api/tickets/process",
            headers={"x-automation-secret": settings.automation_secret},
            timeout=60,
        )
        print(f"[scheduler] ticket processing run: {resp.status_code} {resp.text[:200]}")
    except Exception as e:
        print(f"[scheduler] ticket processing failed: {e}")


def start_scheduler():
    if os.getenv("ENABLE_IN_PROCESS_SCHEDULER", "true").lower() != "true":
        return None
    scheduler = BackgroundScheduler()
    scheduler.add_job(_run_ticket_processing, "interval", minutes=INTERVAL_MINUTES)
    scheduler.start()
    return scheduler
