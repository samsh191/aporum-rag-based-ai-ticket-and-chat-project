# Aporum Energy — Website + AI Support Agents

A demo electricity-retailer website with three plans, plus a set of AI agents:

1. **Ava** — a text-chat AI assistant with a custom avatar, grounded in the
   company's own PDF documents (RAG).
2. **Voice mode** — the same assistant, but you talk to it out loud (browser
   speech-to-text) and it replies out loud (browser text-to-speech). Tap the
   mic, speak, and Ava answers automatically when you stop talking.
3. **Booking** — a "Book a call" button that creates a Google Calendar event
   and emails a confirmation to both the customer and you.
4. **Inquiry ticketing** — an "Inquire now" form that logs a ticket to an
   Excel file with a ticket ID, priority, status, and AI confidence score. A
   backend agent periodically reads open tickets, checks them against the
   company's policy PDFs, and either replies by email and closes the ticket,
   or escalates it to a human inbox if it's not confident.

## Folder structure

```
energy-co/
├── frontend/           React + Vite + Tailwind site (deploy to Vercel)
│   └── src/
│       ├── components/ UI components (chat widget, modals, sections)
│       ├── hooks/       useVoiceAssistant (Web Speech API wrapper)
│       └── api/         Backend API client
├── backend/             FastAPI app (deploy to Render)
│   ├── app/
│   │   ├── routers/     /api/chat, /api/tickets, /api/booking
│   │   ├── services/    OpenAI, RAG retrieval, Excel store, Gmail/Calendar
│   │   └── models/      Pydantic request/response schemas
│   ├── rag/
│   │   ├── documents/   Company PDFs (plans, billing FAQ, terms, support policy)
│   │   ├── generate_documents.py   Regenerates the PDFs
│   │   ├── build_index.py          Embeds PDFs into a vector index
│   │   └── vector_store/index.json Prebuilt embeddings (loaded at runtime)
│   └── data/tickets.xlsx           The Excel "database" of tickets
└── docs/
    ├── DEPLOYMENT.md    GitHub → Vercel → Render, step by step
    └── GOOGLE_SETUP.md  One-time Gmail/Calendar OAuth setup
```

## Stack

- **Frontend:** React (Vite), Tailwind CSS, browser Web Speech API for voice
- **Backend:** Python, FastAPI, OpenAI API (chat + embeddings), openpyxl,
  Google API client (Gmail + Calendar)
- **"Database":** Excel file for tickets (by design, for simplicity — swap for
  Zendesk/Salesforce later without changing the frontend, since the ticket
  logic is isolated in `app/services/excel_service.py`)
- **RAG:** OpenAI embeddings + a lightweight in-memory numpy vector search
  over 4 generated company PDFs — no external vector DB needed at this scale

## Quick start (local)

See "Local development" at the bottom of `docs/DEPLOYMENT.md`.

## Deploying

See `docs/DEPLOYMENT.md` for GitHub → Vercel → Render, and
`docs/GOOGLE_SETUP.md` for the one-time Gmail/Calendar credential setup.

## What you'll need to supply

- An **OpenAI API key** (used for chat + embeddings; `gpt-4o-mini` and
  `text-embedding-3-small` by default — cheap models, easy to swap in
  `backend/app/config.py`).
- A **Google account** to send email/calendar invites from (see
  `docs/GOOGLE_SETUP.md` — takes ~10 minutes, one time).

## Known limitations / things to know before you rely on this

- The Excel file is a single file with a lock during writes — fine for a
  small business's ticket volume, not built for high concurrency. That's why
  the README calls out Zendesk/Salesforce as a natural next step.
- Voice mode uses each browser's built-in speech engine, so voice quality and
  available "female" voices vary by browser/OS (Chrome and Edge have the
  widest support).
- Render's free tier sleeps when idle; see the note in `docs/DEPLOYMENT.md`
  about the cron job that keeps automated ticket replies running anyway.
- The AI ticket agent is deliberately conservative: anything involving
  specific account balances, refunds, hardship, or a direct request for a
  human is escalated rather than answered, per the rules in
  `rag/documents/support_and_complaints_process.pdf`. Tune the confidence
  threshold via `AUTO_REPLY_CONFIDENCE_THRESHOLD`.
