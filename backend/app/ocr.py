from __future__ import annotations

import io

from PIL import Image
from pypdf import PdfReader
import pytesseract

from .data import SAMPLE_RECORDS


def fallback_text(filename: str) -> str:
    lowered = filename.lower()
    for record in SAMPLE_RECORDS:
        if record["id"] in lowered or record["filename"].lower() in lowered:
            return record["text"]
    return SAMPLE_RECORDS[0]["text"]


def extract_text(filename: str, content: bytes) -> dict[str, str | bool]:
    try:
        if filename.lower().endswith(".txt"):
            return {"text": content.decode("utf-8", errors="ignore"), "engine": "plain-text demo upload", "fallback_used": False}
        if filename.lower().endswith(".pdf"):
            reader = PdfReader(io.BytesIO(content))
            text = "\n".join(page.extract_text() or "" for page in reader.pages).strip()
            return {"text": text or fallback_text(filename), "engine": "pypdf text extraction", "fallback_used": not bool(text)}
        image = Image.open(io.BytesIO(content))
        text = pytesseract.image_to_string(image, lang="eng+ben").strip()
        return {"text": text or fallback_text(filename), "engine": "Tesseract OCR eng+ben", "fallback_used": not bool(text)}
    except Exception:
        return {"text": fallback_text(filename), "engine": "seeded OCR fallback", "fallback_used": True}
