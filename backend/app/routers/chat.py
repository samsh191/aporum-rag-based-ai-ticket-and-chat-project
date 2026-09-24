from fastapi import APIRouter
from app.models.schemas import ChatRequest, ChatResponse
from app.services import rag_service, openai_service

router = APIRouter(prefix="/api/chat", tags=["chat"])


@router.post("", response_model=ChatResponse)
def chat(req: ChatRequest):
    chunks = rag_service.retrieve(req.message, k=4)
    context = rag_service.format_context(chunks)
    history = [t.model_dump() for t in req.history]
    reply = openai_service.chat_reply(req.message, context, history)
    sources = sorted({c["source"] for c in chunks})
    return ChatResponse(reply=reply, sources=sources)
