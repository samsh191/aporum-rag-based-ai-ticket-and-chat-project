from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.routers import chat, tickets, booking
from app.scheduler import start_scheduler

app = FastAPI(title="Aporum Energy API", version="1.0.0")

origins = [settings.frontend_origin, "http://localhost:5173", "http://localhost:3000"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(chat.router)
app.include_router(tickets.router)
app.include_router(booking.router)


@app.get("/")
def root():
    return {"status": "ok", "service": "Aporum Energy API"}


@app.get("/health")
def health():
    return {"status": "healthy"}


@app.on_event("startup")
def on_startup():
    start_scheduler()
