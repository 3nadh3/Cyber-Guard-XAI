# XAI Phishing Email Detector

A full-stack web app with a **FastAPI backend** and **React frontend** for detecting phishing emails using Explainable AI (LIME).

---

## Project Structure

```
phishing-detector/
├── backend/
│   ├── main.py           # FastAPI server
│   ├── train.py          # Model training script
│   ├── requirements.txt
│   ├── model.pkl         # Generated after training
│   ├── vectorizer.pkl    # Generated after training
│   └── Phishing_Email.csv  ← place your dataset here
│
└── frontend/
    ├── src/
    │   ├── App.jsx
    │   ├── Scanner.jsx
    │   ├── ResultCard.jsx
    │   ├── History.jsx
    │   ├── index.css
    │   └── main.jsx
    ├── index.html
    ├── vite.config.js
    └── package.json
```

---

## Setup

### 1. Backend

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Place Phishing_Email.csv in the backend/ folder, then train:
python train.py

# Start the server
uvicorn main:app --reload --port 8000
```

Backend runs at: http://localhost:8000  
API docs at: http://localhost:8000/docs

---

### 2. Frontend

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Frontend runs at: http://localhost:3000

---

## API Endpoints

| Method | Endpoint   | Description                       |
|--------|------------|-----------------------------------|
| GET    | /health    | Check server + model status       |
| POST   | /analyze   | Analyze email text                |
| GET    | /history   | Get all past scans (this session) |
| DELETE | /history   | Clear scan history                |

### POST /analyze — Request body:
```json
{ "email_text": "Your email content here..." }
```

### POST /analyze — Response:
```json
{
  "id": "uuid",
  "timestamp": "ISO datetime",
  "email_preview": "First 120 chars...",
  "prediction": 1,
  "confidence": 0.92,
  "risk_score": 0.87,
  "lime_words": [{ "word": "verify", "score": 0.34 }, ...],
  "recommendations": ["⚠ 'verify' detected: ..."]
}
```

---

## Features

- **Email scan + prediction** — Logistic Regression on TF-IDF features
- **Risk meter** — Visual 0–100% risk bar with color gradient
- **LIME word highlighting** — Red = phishing signal, Green = safe signal
- **Word influence chart** — Canvas-drawn bar chart of top LIME features
- **Scan history** — All scans stored in-session, viewable in History tab
- **Security recommendations** — Keyword-matched actionable advice

---

## Dataset

Uses `Phishing_Email.csv` with columns:
- `Email Text` — raw email content
- `Email Type` — `"Safe Email"` or `"Phishing Email"`

Available on Kaggle: https://www.kaggle.com/datasets/subhajournal/phishingemails
