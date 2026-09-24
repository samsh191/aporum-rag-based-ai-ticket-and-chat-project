# Deployment Guide — GitHub, Vercel, Render

This repo has two deployable pieces:
- `frontend/` (React + Vite) → deploy to **Vercel**
- `backend/` (FastAPI) → deploy to **Render**

## 1. Push to GitHub

```bash
cd energy-co
git init
git add .
git commit -m "Initial commit: Aporum Energy site + AI agents"
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo>.git
git push -u origin main
```

The included `.gitignore` already excludes `node_modules`, `.env` files, the
generated `backend/data/tickets.xlsx`, and the RAG vector store (which you'll
rebuild from your own OpenAI key — see step 3).

## 2. Deploy the backend to Render

1. Go to https://dashboard.render.com/ → **New → Blueprint**, and point it at
   your GitHub repo. Render will detect `backend/render.yaml` and propose two
   services: the web API and a cron job for automated ticket processing.
   - Alternatively, create the web service manually: **New → Web Service**,
     root directory `backend`, build command
     `pip install -r requirements.txt && cd rag && python build_index.py && cd ..`,
     start command `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
2. In the service's **Environment** tab, set all the variables listed in
   `backend/.env.example`:
   - `OPENAI_API_KEY` — your OpenAI key. This is required at **build time**
     now too (not just runtime), since the build step re-embeds the company
     PDFs into a fresh RAG index on every deploy — see the note below.
   - `FRONTEND_ORIGIN` — your Vercel URL once you have it (step 4), e.g.
     `https://your-frontend.vercel.app`. You can update this after deploying
     the frontend.
   - `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `GOOGLE_REFRESH_TOKEN`,
     `COMPANY_SENDER_EMAIL`, `OWNER_NOTIFICATION_EMAIL` — see
     `docs/GOOGLE_SETUP.md`.
   - `AUTOMATION_SECRET` — any long random string; protects the
     `/api/tickets/process` endpoint (and the admin dashboard) from being
     called by outsiders.
3. Deploy. Render will give you a URL like `https://aporum-backend.onrender.com`.
4. Visit `https://<your-backend>.onrender.com/health` to confirm it's live, and
   `/docs` for the interactive API docs (FastAPI's built-in Swagger UI).

**Note on the free tier:** Render's free web services sleep after inactivity
and the first request after sleeping takes 30-60s to wake up. That's fine for
demoing but means the "ticket auto-reply" scheduler only runs while the
service is awake — that's exactly why `render.yaml` also sets up a separate
**Cron Job** service that pings `/api/tickets/process` every 15 minutes even
if the web service was asleep (waking it up).

## The RAG index rebuilds itself automatically — no manual step

You do **not** need to manually run `build_index.py` and commit the result
before deploying. Render's build command (in `backend/render.yaml`) runs it
automatically as part of every deploy:

```
pip install -r requirements.txt && cd rag && python build_index.py && cd ..
```

This re-reads whatever PDFs are currently in `backend/rag/documents/` and
regenerates the embeddings fresh each time — so if you edit the PDFs (say,
updating pricing or policy) and push, the next deploy automatically picks up
the change with no extra step. `rag/vector_store/` is in `.gitignore` for
exactly this reason — it's a build artifact, not something to track in git.

The one thing to keep in mind: this adds a small number of OpenAI embedding
API calls (a few cents at most for 4 PDFs) to every deploy's build step, and
a bit to build time. If you ever have a much larger document set where that
becomes noticeable, you could switch to only rebuilding when the PDFs
actually changed (e.g. a GitHub Action that diffs the `documents/` folder) —
not necessary at this scale.

## 3. Deploy the frontend to Vercel

1. Go to https://vercel.com/ → **Add New → Project**, import your GitHub repo.
2. Set **Root Directory** to `frontend`.
3. Framework preset: Vite (should auto-detect).
4. Add an environment variable:
   - `VITE_API_BASE_URL` = your Render backend URL, e.g.
     `https://aporum-backend.onrender.com`
5. Deploy. Vercel gives you a URL like `https://aporum-energy.vercel.app`.
6. Go back to Render and update `FRONTEND_ORIGIN` to that exact Vercel URL
   (needed for CORS to allow the frontend to call the backend), then redeploy
   the backend.

## 4. Test the full flow end to end

- Open the Vercel URL, click **Inquire now**, submit a ticket → check
  `backend/data/tickets.xlsx` gets a new row (or query `GET /api/tickets` on
  the live backend) and that a confirmation email arrives.
- Click **Chat with Ava**, ask a question about a plan.
- Click **Talk to Ava**, allow microphone access, tap the mic and speak — Ava
  should reply out loud when you stop talking.
- Click **Book a call**, submit a booking → check your Google Calendar and
  inbox for the invite/confirmation.
- Manually trigger the ticket agent to confirm auto-replies work:
  ```bash
  curl -X POST https://<your-backend>.onrender.com/api/tickets/process \
    -H "x-automation-secret: <your AUTOMATION_SECRET>"
  ```

## Local development

Backend:
```bash
cd backend
python -m venv venv && source venv/bin/activate  # or venv\Scripts\activate on Windows
pip install -r requirements.txt
cp .env.example .env   # fill in your keys
cd rag && python build_index.py && cd ..   # build the RAG index locally (Render does this automatically on deploy — see above — but locally you run it yourself once, and again any time you edit the PDFs)
uvicorn app.main:app --reload
```

Frontend:
```bash
cd frontend
npm install
cp .env.example .env   # VITE_API_BASE_URL=http://localhost:8000
npm run dev
```
