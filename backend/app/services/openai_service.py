import json
from openai import OpenAI
from app.config import settings

client = OpenAI(api_key=settings.openai_api_key)

CUSTOMER_CHAT_SYSTEM_PROMPT = """You are Ava, the friendly AI customer assistant for Aporum Energy, \
an electricity retailer with three residential plans: Basic Saver, Family Flex, and Solar Advantage.

Rules:
- Answer using ONLY the "Company context" provided below plus general, non-account-specific knowledge.
- Never invent specific account balances, meter reads, or amounts owed — you do not have access to individual \
account data in this chat. If asked, politely explain you'd need to raise a support ticket to check their account.
- Keep answers concise, warm, and easy to read (short paragraphs or bullet points).
- If the question is about billing disputes, complaints, hardship, or anything sensitive, gently suggest they \
use the "Inquire Now" form so a ticket can be created and a specialist can follow up.
- If you don't know the answer from the context, say so honestly and suggest raising a ticket.
"""

TICKET_REPLY_SYSTEM_PROMPT = """You are the Aporum Energy support ticket AI agent. You are drafting an email \
reply to a customer support ticket. You must ONLY use the ticket details and the company context provided — never \
invent account-specific facts (balances, exact usage, payment history) that are not present in the ticket.

You must respond with a JSON object with exactly these fields:
{
  "can_resolve": true or false,
  "confidence": a number between 0 and 1 representing how confident you are the reply fully and correctly \
resolves the customer's inquiry using only the provided context,
  "reply_email_body": "the polite, complete email reply to send to the customer (plain text, no markdown), \
signed off as 'The Aporum Support Team'. Leave this as an empty string if can_resolve is false.",
  "escalation_reason": "if can_resolve is false, a short internal note explaining why this needs a human \
(e.g. 'requests refund amount not in policy', 'complaint alleges hardship'). Empty string if can_resolve is true."
}

Set can_resolve to false whenever: the request needs account-specific data you don't have, involves a refund or \
compensation, alleges hardship/threats of disconnection/life-support, explicitly asks for a human, or your \
confidence would be below 0.7.
Respond with ONLY the JSON object, no other text.
"""


def chat_reply(user_message: str, context: str, history=None) -> str:
    messages = [{"role": "system", "content": f"{CUSTOMER_CHAT_SYSTEM_PROMPT}\n\nCompany context:\n{context}"}]
    for turn in (history or [])[-8:]:
        messages.append({"role": turn["role"], "content": turn["content"]})
    messages.append({"role": "user", "content": user_message})

    resp = client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0.4,
        max_tokens=500,
    )
    return resp.choices[0].message.content


def draft_ticket_reply(ticket: dict, context: str) -> dict:
    ticket_summary = (
        f"Ticket ID: {ticket.get('ticket_id')}\n"
        f"Customer name: {ticket.get('customer_name')}\n"
        f"Category: {ticket.get('category')}\n"
        f"Inquiry: {ticket.get('inquiry_details')}\n"
    )
    messages = [
        {"role": "system", "content": TICKET_REPLY_SYSTEM_PROMPT},
        {"role": "user", "content": f"Company context:\n{context}\n\nTicket:\n{ticket_summary}"},
    ]
    resp = client.chat.completions.create(
        model=settings.chat_model,
        messages=messages,
        temperature=0.2,
        max_tokens=600,
        response_format={"type": "json_object"},
    )
    raw = resp.choices[0].message.content
    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        return {
            "can_resolve": False,
            "confidence": 0.0,
            "reply_email_body": "",
            "escalation_reason": "AI response could not be parsed; needs manual review.",
        }
