"""
One-time script to generate a Google OAuth refresh token for Gmail + Calendar.
Run this locally (not on Render). It reads GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET
from backend/.env, so this file itself never contains real secrets and is safe
to commit to git.

Usage:
    1. Make sure backend/.env already has GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET
       set (from Google Cloud Console — see docs/GOOGLE_SETUP.md).
    2. Run: python get_refresh_token.py
    3. A browser window opens — log in with the Google account BrightVolt/Aporum
       should send email from, and approve access.
    4. The refresh token prints in your terminal. Copy it into .env as
       GOOGLE_REFRESH_TOKEN=...
"""
import os
import sys
from pathlib import Path
from dotenv import load_dotenv
from google_auth_oauthlib.flow import InstalledAppFlow

load_dotenv(Path(__file__).resolve().parent / ".env")

CLIENT_ID = os.environ.get("GOOGLE_CLIENT_ID")
CLIENT_SECRET = os.environ.get("GOOGLE_CLIENT_SECRET")

if not CLIENT_ID or not CLIENT_SECRET or "xxxx" in CLIENT_ID.lower():
    sys.exit(
        "GOOGLE_CLIENT_ID / GOOGLE_CLIENT_SECRET are missing or still placeholders "
        "in backend/.env. Set them first (see docs/GOOGLE_SETUP.md step 1), then "
        "rerun this script."
    )

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

flow = InstalledAppFlow.from_client_config(
    {
        "installed": {
            "client_id": CLIENT_ID,
            "client_secret": CLIENT_SECRET,
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    },
    SCOPES,
)

creds = flow.run_local_server(port=0)
print("\nREFRESH TOKEN (copy this into backend/.env as GOOGLE_REFRESH_TOKEN):\n")
print(creds.refresh_token)