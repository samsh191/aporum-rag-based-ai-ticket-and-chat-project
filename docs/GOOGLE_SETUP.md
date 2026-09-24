# Google Setup — Gmail + Calendar (one-time)

The backend sends email and creates calendar events **unattended** (no browser
popup on the server), using an OAuth2 **refresh token** tied to one real Google
account (e.g. your business Gmail). You generate that refresh token once, on your
own laptop, and then paste it into Render's environment variables.

## 1. Create a Google Cloud project + OAuth credentials

1. Go to https://console.cloud.google.com/ and create a new project (e.g. "Aporum Energy").
2. Enable these two APIs (APIs & Services → Library):
   - **Gmail API**
   - **Google Calendar API**
3. Go to **APIs & Services → OAuth consent screen**.
   - User type: External (unless you have a Google Workspace).
   - Fill in app name, support email, developer email.
   - Add your own Google account as a **test user** (this is enough — you don't
     need to publish the app since only you use it).
   - Scopes: you can leave defaults; the ones we need are requested at auth time.
4. Go to **APIs & Services → Credentials → Create Credentials → OAuth client ID**.
   - Application type: **Desktop app**.
   - Name it "Aporum backend".
   - Download the JSON — note the `client_id` and `client_secret`.

## 2. Generate a refresh token (run once, locally)

On your own machine (not on Render), with Python installed:

```bash
pip install google-auth-oauthlib
```

Save this as `get_refresh_token.py` and run it:

```python
from google_auth_oauthlib.flow import InstalledAppFlow

SCOPES = [
    "https://www.googleapis.com/auth/gmail.send",
    "https://www.googleapis.com/auth/calendar",
]

flow = InstalledAppFlow.from_client_config(
    {
        "installed": {
            "client_id": "YOUR_CLIENT_ID",
            "client_secret": "YOUR_CLIENT_SECRET",
            "auth_uri": "https://accounts.google.com/o/oauth2/auth",
            "token_uri": "https://oauth2.googleapis.com/token",
            "redirect_uris": ["http://localhost"],
        }
    },
    SCOPES,
)

creds = flow.run_local_server(port=0)
print("REFRESH TOKEN:", creds.refresh_token)
```

This opens a browser, asks you to log in with the Google account Aporum should
send email from, and prints a refresh token in your terminal. Copy it.

> Tip: this account should be the mailbox you want emails to come **from** — e.g.
> a Gmail address like `aporum.demo@gmail.com`, or a Google Workspace address
> if you have a real domain.

## 3. Set environment variables

In Render (backend service) and locally (`backend/.env`), set:

```
GOOGLE_CLIENT_ID=...          # from step 1
GOOGLE_CLIENT_SECRET=...      # from step 1
GOOGLE_REFRESH_TOKEN=...      # from step 2
COMPANY_SENDER_EMAIL=you@yourdomain.com   # must match the account used in step 2
OWNER_NOTIFICATION_EMAIL=you@yourdomain.com  # where escalations/booking notices go
GOOGLE_CALENDAR_ID=primary    # or a specific calendar ID
```

## 4. Test it

With those variables set, run the backend locally and hit:

```bash
curl -X POST http://localhost:8000/api/booking \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"samsh191@hotmail.com","phone":"0400000000","preferred_datetime":"2026-09-05T10:00:00"}'
```

You should receive a calendar invite and a confirmation email. If `GOOGLE_REFRESH_TOKEN`
is not set, the backend logs what it *would* send instead of erroring out — useful for
local development without Google fully wired up yet.

## Notes on going to production

- A refresh token from an OAuth **consent screen in "Testing" mode** expires after
  ~7 days of the app being unverified and unused by non-test users. Since only your
  own test-user account uses it here, it's generally fine for an ongoing internal
  tool, but if you see auth errors after a while, just re-run step 2.
- For a fully "production" setup with your own domain email (e.g. `support@yourco.com`),
  use Google Workspace and enable **domain-wide delegation** with a service account
  instead of a personal refresh token — that avoids the token expiry consideration
  above. That's a larger setup than this guide covers.
