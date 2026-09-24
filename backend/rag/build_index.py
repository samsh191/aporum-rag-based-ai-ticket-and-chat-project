"""
Builds a lightweight vector index from the PDFs in ./documents using OpenAI embeddings.
No external vector DB required — stores a single JSON file with text chunks + embeddings,
loaded into memory (numpy) at backend startup. Fine for a handful of PDFs; swap for a
real vector DB (pgvector, Pinecone, etc.) if the document set grows large.

Run:
    OPENAI_API_KEY=sk-... python build_index.py
Output:
    ./vector_store/index.json
"""
import os
import json
import glob
from pathlib import Path
from dotenv import load_dotenv
from pypdf import PdfReader
from openai import OpenAI

# Load OPENAI_API_KEY (and anything else) from backend/.env, so this script
# works the same way whether you run it standalone or via the app.
load_dotenv(Path(__file__).resolve().parent.parent / ".env")

EMBED_MODEL = "text-embedding-3-small"
CHUNK_SIZE = 900          # characters per chunk
CHUNK_OVERLAP = 150
DOCS_DIR = os.path.join(os.path.dirname(__file__), "documents")
OUT_DIR = os.path.join(os.path.dirname(__file__), "vector_store")
os.makedirs(OUT_DIR, exist_ok=True)


def extract_text(pdf_path: str) -> str:
    reader = PdfReader(pdf_path)
    return "\n".join(page.extract_text() or "" for page in reader.pages)


def chunk_text(text: str, size=CHUNK_SIZE, overlap=CHUNK_OVERLAP):
    text = " ".join(text.split())  # normalise whitespace
    chunks = []
    start = 0
    while start < len(text):
        end = start + size
        chunks.append(text[start:end])
        start = end - overlap
    return [c for c in chunks if c.strip()]


def main():
    client = OpenAI()  # reads OPENAI_API_KEY from env
    pdf_files = sorted(glob.glob(os.path.join(DOCS_DIR, "*.pdf")))
    if not pdf_files:
        raise SystemExit(f"No PDFs found in {DOCS_DIR}. Run generate_documents.py first.")

    records = []
    for pdf_path in pdf_files:
        source = os.path.basename(pdf_path)
        text = extract_text(pdf_path)
        chunks = chunk_text(text)
        print(f"{source}: {len(chunks)} chunks")
        for i, chunk in enumerate(chunks):
            records.append({"source": source, "chunk_id": i, "text": chunk})

    # Embed in batches
    batch_size = 64
    for i in range(0, len(records), batch_size):
        batch = records[i:i + batch_size]
        resp = client.embeddings.create(model=EMBED_MODEL, input=[r["text"] for r in batch])
        for r, e in zip(batch, resp.data):
            r["embedding"] = e.embedding

    out_path = os.path.join(OUT_DIR, "index.json")
    with open(out_path, "w") as f:
        json.dump({"model": EMBED_MODEL, "records": records}, f)

    print(f"Wrote {len(records)} chunks to {out_path}")


if __name__ == "__main__":
    main()
