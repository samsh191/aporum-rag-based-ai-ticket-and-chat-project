"""
Loads the prebuilt embeddings index (rag/vector_store/index.json, produced by
rag/build_index.py) into memory and exposes a simple `retrieve(query, k)` function
using cosine similarity. Good enough for a handful of company PDFs; swap for
pgvector/Pinecone/etc. if the document set grows large.
"""
import os
import json
import numpy as np
from openai import OpenAI
from app.config import settings

_INDEX_PATH = os.path.join(os.path.dirname(__file__), "..", "..", "rag", "vector_store", "index.json")

_client = OpenAI(api_key=settings.openai_api_key)

_records = []
_matrix = None


def _load_index():
    global _records, _matrix
    if not os.path.exists(_INDEX_PATH):
        _records, _matrix = [], None
        return
    with open(_INDEX_PATH) as f:
        data = json.load(f)
    _records = data["records"]
    _matrix = np.array([r["embedding"] for r in _records], dtype=np.float32)
    # normalise for cosine similarity via dot product
    norms = np.linalg.norm(_matrix, axis=1, keepdims=True)
    norms[norms == 0] = 1e-8
    _matrix = _matrix / norms


_load_index()


def index_is_ready() -> bool:
    return _matrix is not None and len(_records) > 0


def retrieve(query: str, k: int = 4):
    """Returns top-k {source, text, score} chunks most relevant to `query`."""
    if not index_is_ready():
        return []
    q_emb = _client.embeddings.create(model=settings.embed_model, input=[query]).data[0].embedding
    q = np.array(q_emb, dtype=np.float32)
    q = q / (np.linalg.norm(q) or 1e-8)
    scores = _matrix @ q
    top_idx = np.argsort(-scores)[:k]
    return [
        {"source": _records[i]["source"], "text": _records[i]["text"], "score": float(scores[i])}
        for i in top_idx
    ]


def format_context(chunks) -> str:
    if not chunks:
        return "No matching company documents were found."
    parts = []
    for c in chunks:
        parts.append(f"[Source: {c['source']}]\n{c['text']}")
    return "\n\n---\n\n".join(parts)
