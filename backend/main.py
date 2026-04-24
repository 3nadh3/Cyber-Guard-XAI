from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import pickle
import re
import os
import uuid
from datetime import datetime
from lime.lime_text import LimeTextExplainer
from typing import List, Optional

app = FastAPI(title="XAI Phishing Detector API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ---- Load model & vectorizer ----
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

try:
    model = pickle.load(open(os.path.join(BASE_DIR, "model.pkl"), "rb"))
    vectorizer = pickle.load(open(os.path.join(BASE_DIR, "vectorizer.pkl"), "rb"))
    print("Model loaded successfully")
except Exception as e:
    print(f"Warning: Model not found. Run train.py first. Error: {e}")
    model = None
    vectorizer = None

# ---- Load BERT MLM for contextual word suggestions ----
mlm_pipeline = None
try:
    from transformers import pipeline as hf_pipeline
    mlm_pipeline = hf_pipeline("fill-mask", model="distilbert-base-uncased", top_k=30)
    print("DistilBERT MLM loaded successfully for word suggestions")
except Exception as e:
    print(f"Warning: BERT MLM not loaded. /suggest will be unavailable. Error: {e}")

# ---- In-memory scan history ----
scan_history: List[dict] = []

# ---- Schemas ----
class EmailRequest(BaseModel):
    email_text: str

class SuggestRequest(BaseModel):
    email_text: str
    lime_words: List[dict]        # [{"word": str, "score": float}, ...]
    skip_words: List[str] = []    # words already shown — skip these

class ScanResult(BaseModel):
    id: str
    timestamp: str
    email_preview: str
    prediction: int
    confidence: float
    risk_score: float
    lime_words: List[dict]
    recommendations: List[str]

# ---- Helpers ----
def clean_text(text: str) -> str:
    text = text.lower()
    def expand_url(match):
        url = match.group(0)
        prefix = "httplink " if url.startswith("http://") else ""
        url = re.sub(r"https?://", "", url)
        parts = re.split(r"[^a-z0-9]+", url)
        words = " ".join(p for p in parts if p and len(p) > 1)
        return prefix + words
    text = re.sub(r"https?://\S+", expand_url, text)
    text = re.sub(r"[^a-z\s]", "", text)
    return text

def get_risk_score(text: str) -> float:
    """Return phishing probability for a piece of text."""
    vec = vectorizer.transform([clean_text(text)])
    return float(model.predict_proba(vec)[0][1])

PHISHING_KEYWORDS = {
    "verify": "Do not ask users to verify sensitive info via email.",
    "password": "Never request passwords through email.",
    "login": "Avoid embedding login links — direct to official site.",
    "bank": "Avoid impersonating banks or financial institutions.",
    "urgent": "Creating urgency is a classic phishing tactic.",
    "click": "Avoid forcing users to click suspicious links.",
    "account": "Avoid threatening account suspension.",
    "update": "Avoid forcing users to perform updates via email.",
    "security": "Avoid fake security warnings.",
    "confirm": "Avoid asking users to confirm personal details.",
    "suspended": "Account suspension threats are common in phishing.",
    "winner": "Prize/winner announcements are common phishing tactics.",
    "free": "Unsolicited free offers are a phishing red flag.",
    "prize": "Lottery/prize claims are common phishing tactics.",
}

def generate_recommendations(exp_list, email_text: str, pred: int) -> List[str]:
    rec = set()
    for word, score in exp_list:
        w = word.lower()
        if score > 0 and w in PHISHING_KEYWORDS:
            rec.add(f"⚠ '{word}' detected: {PHISHING_KEYWORDS[w]}")
    for key, msg in PHISHING_KEYWORDS.items():
        if key in email_text.lower():
            rec.add(f"⚠ '{key}' detected: {msg}")
    if pred == 1:
        rec.add("🚨 Strong phishing signal. Do NOT click links or share personal info.")
    return list(rec)

def predict_proba_fn(texts):
    cleaned = [clean_text(t) for t in texts]
    vec = vectorizer.transform(cleaned)
    return model.predict_proba(vec)

# ---- /suggest logic ----
# Words to never suggest as replacements — they'd look obviously wrong in an email
STOPWORDS = {
    "the", "a", "an", "is", "are", "was", "were", "be", "been", "being",
    "have", "has", "had", "do", "does", "did", "will", "would", "could",
    "should", "may", "might", "shall", "can", "need", "dare", "ought",
    "used", "to", "of", "in", "on", "at", "by", "for", "with", "about",
    "as", "into", "through", "during", "before", "after", "above", "below",
    "from", "up", "down", "out", "off", "over", "under", "again", "then",
    "once", "here", "there", "when", "where", "why", "how", "all", "both",
    "each", "few", "more", "most", "other", "some", "such", "no", "not",
    "only", "own", "same", "so", "than", "too", "very", "just", "but",
    "and", "or", "nor", "yet", "also", "this", "that", "these", "those",
    "i", "me", "my", "we", "our", "you", "your", "he", "she", "it", "its",
    "they", "them", "their", "what", "which", "who", "whom", "any", "if",
}

def get_mlm_candidates(email_text: str, target_word: str, topn: int = 30) -> List[str]:
    """
    Use BERT masked language modeling to find contextually appropriate
    replacements for target_word in the email text.
    Returns up to topn candidate words.
    """
    if mlm_pipeline is None:
        return []

    # Find first occurrence and mask it
    pattern = re.compile(r'\b' + re.escape(target_word) + r'\b', re.IGNORECASE)
    match = pattern.search(email_text)
    if not match:
        return []

    # Replace first occurrence with [MASK]
    masked_text = email_text[:match.start()] + "[MASK]" + email_text[match.end():]

    # Truncate to 512 tokens worth of text (BERT's limit) — keep context around mask
    # Simple truncation: keep first ~400 words
    words = masked_text.split()
    if len(words) > 400:
        mask_pos = next((i for i, w in enumerate(words) if "[MASK]" in w), 0)
        start = max(0, mask_pos - 200)
        end = min(len(words), mask_pos + 200)
        masked_text = " ".join(words[start:end])

    try:
        predictions = mlm_pipeline(masked_text)
        candidates = []
        for pred in predictions:
            token = pred["token_str"].strip().lower()
            if (token.isalpha()
                    and len(token) > 2
                    and token != target_word.lower()
                    and token not in STOPWORDS):
                candidates.append(token)
        return candidates[:topn]
    except Exception:
        return []

def find_suggestions(email_text: str, original_word: str, base_risk: float) -> List[dict]:
    """
    For a single phishing word, find up to 3 substitutions using BERT MLM that:
      - fit the sentence context naturally
      - are NOT themselves known phishing keywords
      - actually lower or maintain the model's risk score when swapped in
    Returns list of {word, new_risk, delta} sorted by delta (biggest drop first).
    """
    candidates = get_mlm_candidates(email_text, original_word, topn=30)
    results = []

    # Words to exclude as candidates — known phishing terms
    phishing_blocklist = set(PHISHING_KEYWORDS.keys()) | {
        "verify", "validate", "confirm", "click", "login", "account", "bank",
        "password", "suspended", "urgent", "security", "winner", "free", "prize",
        "expire", "update", "credit", "payment", "invoice", "authorize", "alert",
        "ssn", "transfer", "wire", "reward", "claim", "restore", "access",
        "immediately", "locked", "blocked", "notification", "dear",
    }

    # Build regex that matches the whole word (case-insensitive)
    pattern = re.compile(r'\b' + re.escape(original_word) + r'\b', re.IGNORECASE)

    for candidate in candidates:
        # Skip if candidate is a phishing keyword itself
        if candidate.lower() in phishing_blocklist:
            continue
        # Replace all occurrences in the raw email text
        modified = pattern.sub(candidate, email_text)
        new_risk = get_risk_score(modified)
        delta = base_risk - new_risk   # positive = risk dropped
        # Only include if it doesn't increase risk
        if delta >= 0:
            results.append({
                "word": candidate,
                "new_risk": round(new_risk, 4),
                "delta": round(delta, 4),
            })

    # Sort by biggest risk drop, return top 3
    results.sort(key=lambda x: -x["delta"])
    return results[:3]

# ---- Routes ----
@app.get("/")
def root():
    return {"status": "XAI Phishing Detector API is running"}

@app.get("/health")
def health():
    return {
        "status": "ok",
        "model_loaded": model is not None,
        "vectorizer_loaded": vectorizer is not None,
        "mlm_loaded": mlm_pipeline is not None,
    }

@app.post("/analyze", response_model=ScanResult)
def analyze_email(request: EmailRequest):
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded. Run train.py first.")

    email_text = request.email_text.strip()
    if not email_text:
        raise HTTPException(status_code=400, detail="Email text cannot be empty.")

    cleaned = clean_text(email_text)
    vec = vectorizer.transform([cleaned])

    pred = int(model.predict(vec)[0])
    proba = model.predict_proba(vec)[0]
    confidence = float(proba[pred])
    risk_score = float(proba[1])

    explainer = LimeTextExplainer(class_names=["Safe", "Phishing"])
    tokens = [t for t in cleaned.split() if len(t) > 1]
    num_features = max(20, min(len(tokens), 60))

    exp = explainer.explain_instance(
        cleaned,
        predict_proba_fn,
        num_features=num_features,
        num_samples=1000,
    )
    exp_list = exp.as_list()

    lime_words = [
        {"word": word, "score": float(score)}
        for word, score in exp_list
    ]

    recommendations = generate_recommendations(exp_list, email_text, pred)

    result = {
        "id": str(uuid.uuid4()),
        "timestamp": datetime.now().isoformat(),
        "email_preview": email_text[:120] + ("..." if len(email_text) > 120 else ""),
        "prediction": pred,
        "confidence": round(confidence, 4),
        "risk_score": round(risk_score, 4),
        "lime_words": lime_words,
        "recommendations": recommendations,
    }

    scan_history.insert(0, result)
    if len(scan_history) > 50:
        scan_history.pop()

    return result

@app.post("/suggest")
def suggest_evasions(request: SuggestRequest):
    """
    Given an analyzed email and its LIME word scores, return substitution
    suggestions for the top 4 phishing-signal words.

    Response shape:
    [
      {
        "original": "verify",
        "lime_score": 0.045,
        "suggestions": [
          { "word": "check", "new_risk": 0.41, "delta": 0.18 },
          ...
        ]
      },
      ...
    ]
    """
    if model is None or vectorizer is None:
        raise HTTPException(status_code=503, detail="Model not loaded.")
    if mlm_pipeline is None:
        raise HTTPException(status_code=503, detail="BERT MLM not loaded.")

    email_text = request.email_text.strip()
    if not email_text:
        raise HTTPException(status_code=400, detail="Email text cannot be empty.")

    # Current risk score (ground truth from the raw email text)
    base_risk = get_risk_score(email_text)

    # Pick positive LIME words that appear in the email, skip already-shown words
    skip_set = set(w.lower() for w in request.skip_words)
    top_phish_words = [
        w for w in sorted(request.lime_words, key=lambda x: -x["score"])
        if w["score"] > 0
        and w["word"].lower() not in skip_set
        and re.search(r'\b' + re.escape(w["word"]) + r'\b', email_text, re.IGNORECASE)
    ][:6]

    if not top_phish_words:
        return []

    output = []
    for entry in top_phish_words:
        word = entry["word"]
        suggestions = find_suggestions(email_text, word, base_risk)
        pattern = re.compile(r"\b" + re.escape(word) + r"\b", re.IGNORECASE)
        occurrences = len(pattern.findall(email_text))
        output.append({
            "original": word,
            "lime_score": round(entry["score"], 4),
            "base_risk": round(base_risk, 4),
            "occurrences": occurrences,
            "suggestions": suggestions,
        })

    return output

@app.get("/history")
def get_history():
    return scan_history

@app.delete("/history")
def clear_history():
    scan_history.clear()
    return {"status": "cleared"}
