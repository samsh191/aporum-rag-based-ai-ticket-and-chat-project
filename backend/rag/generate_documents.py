"""
Generates the company knowledge-base PDFs that the RAG agent indexes.
Run once: python generate_documents.py
Output: ./documents/*.pdf
"""
import os
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, ListFlowable, ListItem
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.units import inch

OUT_DIR = os.path.join(os.path.dirname(__file__), "documents")
os.makedirs(OUT_DIR, exist_ok=True)

styles = getSampleStyleSheet()
h1 = ParagraphStyle("h1", parent=styles["Heading1"], textColor=colors.HexColor("#0B3D91"))
h2 = ParagraphStyle("h2", parent=styles["Heading2"], textColor=colors.HexColor("#0B3D91"))
body = ParagraphStyle("body", parent=styles["Normal"], fontSize=10.5, leading=15)


def build(filename, title, blocks):
    doc = SimpleDocTemplate(os.path.join(OUT_DIR, filename), pagesize=letter,
                             topMargin=0.8 * inch, bottomMargin=0.8 * inch)
    story = [Paragraph(title, h1), Spacer(1, 14)]
    for block in blocks:
        kind = block[0]
        if kind == "h2":
            story.append(Spacer(1, 10))
            story.append(Paragraph(block[1], h2))
        elif kind == "p":
            story.append(Paragraph(block[1], body))
            story.append(Spacer(1, 6))
        elif kind == "bullets":
            items = [ListItem(Paragraph(b, body)) for b in block[1]]
            story.append(ListFlowable(items, bulletType="bullet", leftIndent=18))
            story.append(Spacer(1, 6))
        elif kind == "table":
            t = Table(block[1], colWidths=block[2] if len(block) > 2 else None)
            t.setStyle(TableStyle([
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#0B3D91")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
                ("FONTSIZE", (0, 0), (-1, -1), 9.5),
                ("GRID", (0, 0), (-1, -1), 0.5, colors.grey),
                ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F2F5FA")]),
                ("TOPPADDING", (0, 0), (-1, -1), 6),
                ("BOTTOMPADDING", (0, 0), (-1, -1), 6),
            ]))
            story.append(t)
            story.append(Spacer(1, 10))
    doc.build(story)
    print(f"Created {filename}")


# ---------------------------------------------------------------------------
# 1. PLANS & PRICING
# ---------------------------------------------------------------------------
build(
    "plans_and_pricing.pdf",
    "Aporum Energy — Plans & Pricing Guide",
    [
        ("p", "Aporum Energy offers three residential electricity plans. All plans include no lock-in "
               "contracts, 24/7 outage support, and access to the Aporum mobile app for usage tracking."),
        ("h2", "Plan Comparison"),
        ("table", [
            ["Feature", "Basic Saver", "Family Flex", "Solar Advantage"],
            ["Best for", "Small households, renters", "Families, medium-large homes", "Homes with solar panels"],
            ["Daily supply charge", "$1.10/day", "$1.25/day", "$1.35/day"],
            ["Peak usage rate", "28.5c/kWh", "26.9c/kWh", "27.4c/kWh"],
            ["Off-peak usage rate", "N/A", "18.2c/kWh (10pm-7am)", "18.9c/kWh (10pm-7am)"],
            ["Solar feed-in tariff", "N/A", "N/A", "6.5c/kWh"],
            ["Contract length", "No lock-in", "No lock-in", "No lock-in"],
            ["Sign-up bonus", "$50 credit", "$100 credit", "$120 credit"],
            ["Pay-on-time discount", "None", "3% off usage charges", "5% off usage charges"],
        ], [1.6 * inch, 1.4 * inch, 1.6 * inch, 1.6 * inch]),
        ("h2", "Basic Saver"),
        ("p", "A simple, flat-rate plan with no time-of-use pricing. Ideal for customers who want predictable "
              "bills and don't want to think about when they use power."),
        ("h2", "Family Flex"),
        ("p", "Time-of-use pricing with cheaper off-peak rates between 10pm and 7am, making it well suited to "
              "households that run appliances like dishwashers, EV chargers, or washing machines overnight. "
              "Includes a 3% discount on usage charges when bills are paid within 14 days of the due date."),
        ("h2", "Solar Advantage"),
        ("p", "Designed for homes with rooftop solar. Includes a competitive solar feed-in tariff of 6.5c/kWh "
              "and the highest pay-on-time discount of the three plans."),
        ("h2", "General Terms"),
        ("bullets", [
            "All plans are billed monthly based on actual meter reads or estimated reads where a read is unavailable.",
            "Prices shown are indicative for Victoria, Australia and may vary by distribution zone.",
            "Customers can switch between Aporum plans at any time at no cost, effective from the next billing cycle.",
            "Concession card holders may be eligible for government rebates; contact support for details.",
        ]),
    ],
)

# ---------------------------------------------------------------------------
# 2. BILLING & PAYMENTS FAQ
# ---------------------------------------------------------------------------
build(
    "billing_and_payments_faq.pdf",
    "Aporum Energy — Billing & Payments FAQ",
    [
        ("h2", "How often will I be billed?"),
        ("p", "Bills are issued monthly. You will receive an email and app notification when a new bill is ready, "
              "usually 3-5 business days after your meter read date."),
        ("h2", "What payment methods are accepted?"),
        ("bullets", [
            "Direct debit from a bank account or credit card (recommended, avoids late fees)",
            "BPAY",
            "Credit or debit card via the Aporum app or website",
            "Centrepay for eligible concession customers",
        ]),
        ("h2", "What happens if I pay late?"),
        ("p", "A reminder notice is sent 5 days after the due date. If a bill remains unpaid 15 days after the "
              "due date, a late payment reminder is issued and any pay-on-time discount for that billing cycle is "
              "forfeited. Aporum does not disconnect supply without first offering a payment plan and, where "
              "applicable, referring the customer to hardship support."),
        ("h2", "Can I set up a payment plan?"),
        ("p", "Yes. Customers experiencing financial difficulty can request a payment plan at any time by "
              "contacting support or through the app. Payment plans spread the balance over instalments with no "
              "additional interest or fees."),
        ("h2", "I think my bill is too high — what should I do?"),
        ("bullets", [
            "Check the app for your daily usage graph to see if usage patterns changed (e.g. new appliance, weather).",
            "Confirm whether the bill was based on an actual or estimated meter read.",
            "If you still believe there is an error, raise a billing dispute ticket; a support agent will review your "
              "meter data and respond within 2 business days.",
        ]),
        ("h2", "How do refunds work?"),
        ("p", "If your account is in credit when you close it, or after a resolved billing dispute, refunds are "
              "processed to your original payment method within 5-7 business days."),
        ("h2", "How do I update my billing details?"),
        ("p", "Billing name, address, and payment method can be updated any time via the Aporum app or by "
              "contacting support. Photo ID may be requested for account name changes."),
    ],
)

# ---------------------------------------------------------------------------
# 3. TERMS & CONDITIONS (SUMMARY)
# ---------------------------------------------------------------------------
build(
    "terms_and_conditions_summary.pdf",
    "Aporum Energy — Terms & Conditions (Customer Summary)",
    [
        ("p", "This is a plain-language summary of the Aporum Energy Customer Retail Contract. The full legal "
              "contract is available on request and takes precedence over this summary."),
        ("h2", "No lock-in contracts"),
        ("p", "All Aporum residential plans are no lock-in. Customers may switch retailers or plans at any "
              "time without exit fees."),
        ("h2", "Cooling-off period"),
        ("p", "New customers have a 10 business day cooling-off period from the date the contract is confirmed, "
              "during which they may cancel without penalty."),
        ("h2", "Moving house"),
        ("p", "Customers relocating can transfer their Aporum plan to a new address at no cost, provided at "
              "least 3 business days' notice is given before the move date."),
        ("h2", "Disconnection policy"),
        ("bullets", [
            "Aporum will never disconnect supply for non-payment without prior written notice and an offer of "
              "a payment plan or hardship assistance.",
            "Life support customers registered with Aporum cannot be disconnected for non-payment.",
            "Disconnection for non-payment requires at least two reminder notices and a minimum 20 business day "
              "notice period after the original due date.",
        ]),
        ("h2", "Complaints and dispute resolution"),
        ("p", "Customers unhappy with the resolution of a complaint may escalate to the Energy and Water Ombudsman "
              "in their state at no cost. Aporum aims to resolve all complaints within 10 business days."),
        ("h2", "Privacy"),
        ("p", "Customer data, including usage data, is handled in accordance with the Aporum Privacy Policy and "
              "the Australian Privacy Principles. Data is not sold to third parties."),
    ],
)

# ---------------------------------------------------------------------------
# 4. SUPPORT & COMPLAINTS PROCESS
# ---------------------------------------------------------------------------
build(
    "support_and_complaints_process.pdf",
    "Aporum Energy — Support & Complaints Handling Guide",
    [
        ("p", "This guide describes how Aporum support requests and complaints are categorised, prioritised, "
              "and resolved. It is used by both customer-facing staff and the Aporum AI support assistant."),
        ("h2", "Inquiry categories"),
        ("table", [
            ["Category", "Typical examples", "Default priority"],
            ["Billing", "Bill too high, payment plan request, refund", "Medium"],
            ["Complaint", "Service dissatisfaction, disconnection dispute", "High"],
            ["Support", "App issues, meter reads, general questions", "Low"],
            ["Sales", "New sign-up, plan change, moving house", "Medium"],
        ], [1.1 * inch, 3.2 * inch, 1.2 * inch]),
        ("h2", "What the AI assistant can resolve automatically"),
        ("bullets", [
            "General questions answered directly from the Plans & Pricing guide, Billing FAQ, and Terms summary.",
            "Straightforward billing questions such as due dates, accepted payment methods, and how pay-on-time "
              "discounts work.",
            "Requests to explain a plan, compare plans, or explain the sign-up process.",
            "Low-complexity complaints where a clear, documented policy answer exists (e.g. explaining the "
              "disconnection notice process).",
        ]),
        ("h2", "What must be escalated for manual review"),
        ("bullets", [
            "Any request involving a specific account balance, meter read, or payment history the AI cannot verify "
              "from the ticket alone.",
            "Complaints alleging harm, financial hardship, threats of disconnection, or life-support status.",
            "Requests for refunds, compensation, or goodwill credits above $0 (require human approval).",
            "Any inquiry where the customer explicitly asks to speak to a human, or where the AI's confidence in "
              "its answer is below 70%.",
            "Legal, regulatory, or Ombudsman-related correspondence.",
        ]),
        ("h2", "Escalation handling"),
        ("p", "When a ticket is escalated, its status is set to 'manual_review_required' and a notification email "
              "is sent to the support team inbox with the ticket ID, customer details, and a summary of why it was "
              "escalated. The customer receives an acknowledgement email confirming a specialist will respond "
              "within 1 business day."),
        ("h2", "Tone guidance for automated replies"),
        ("bullets", [
            "Always polite, warm, and concise.",
            "Acknowledge the customer's issue before providing the answer.",
            "Never guess at account-specific figures (balances, exact usage) that are not present in the ticket.",
            "Sign off as 'The Aporum Support Team'.",
        ]),
    ],
)

print("All documents generated in", OUT_DIR)
