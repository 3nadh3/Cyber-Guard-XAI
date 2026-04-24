# ⬡ CyberGuard XAI — Adversarial ML Phishing Detector

> An Explainable AI (XAI) tool for detecting phishing emails and studying adversarial evasion techniques.  
> Built with **FastAPI + Logistic Regression + LIME** (backend) and **React + Vite** (frontend).

---

## 📸 Overview

CyberGuard XAI lets you paste any email and instantly see:

- **Phishing / Legitimate** verdict from a Logistic Regression + TF-IDF classifier
- **LIME word-level explanations** — red words push toward phishing, green words push toward safe
- **Adversarial Evasion Guide** — AI-suggested word swaps that lower the phishing score
- **Scan History** — all scans stored in-session

---

## 📁 Project Structure

```
cyber-guard-XAI/
├── backend/
│   ├── main.py                  # FastAPI server (analyze, suggest, history endpoints)
│   ├── train.py                 # Model retraining script (only needed if retraining)
│   ├── generate_keywords.py     # SHAP-based keyword list generator (run after train.py)
│   ├── requirements.txt         # Python dependencies
│   ├── keywords.js              # Auto-generated keyword list (copied to frontend/src/)
│   ├── keywords.json            # SHAP keyword scores (loaded by main.py)
│   ├── model.pkl                # Trained Logistic Regression model (already included)
│   └── vectorizer.pkl           # TF-IDF vectorizer (already included)
│
├── frontend/
│   ├── src/
│   │   ├── main.jsx             # React entry point
│   │   ├── App.jsx              # Root component + navigation
│   │   ├── Scanner.jsx          # Main scanner page (editor, results, evasion guide)
│   │   ├── History.jsx          # Scan history page
│   │   ├── keywords.js          # Phishing keyword list for live highlighting
│   │   └── index.css            # Full dark-theme stylesheet
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
└── README.md
```

---

## ⚙️ Prerequisites

### Common (both OS)
- **Python 3.10+**
- **Node.js 18+** and **npm 9+**
- **Git**

> ✅ **The trained model is already included in the repo.**  
> `model.pkl` and `vectorizer.pkl` are committed alongside the code — you can run the full app immediately after cloning with no dataset download or training step needed.  
>  
> Only use `train.py` if you want to **retrain on new data**, **modify the classifier**, or if you see a `model.pkl not found` error. See the [Retraining](#-retraining-the-model-optional) section for instructions.

---

## 🐧 Setup — Linux (Ubuntu / Debian)

### 1. Clone the repository

```bash
git clone https://github.com/trinadhmusunuri12-pixel/backend.git cyber-guard-XAI
cd cyber-guard-XAI
```

### 2. Backend setup

```bash
cd backend

# Create and activate a virtual environment
python3 -m venv venv
source venv/bin/activate

# Install Python dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install spaCy English model
python3 -m spacy download en_core_web_sm

# Start the backend server (model.pkl is already present)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at: **http://localhost:8000**  
Swagger docs at: **http://localhost:8000/docs**

### 3. Frontend setup

Open a **new terminal tab**:

```bash
cd cyber-guard-XAI/frontend

# Install Node dependencies
npm install

# Start the dev server
npm run dev
```

Frontend will be live at: **http://localhost:5173**

> **Note:** If your backend is running on a different host or port, create a `.env` file in `frontend/`:
> ```
> VITE_API_URL=http://localhost:8000
> ```

---

## 🪟 Setup — Windows 10/11

### 1. Install prerequisites

- **Python 3.10+**: https://www.python.org/downloads/ — ✅ check "Add Python to PATH" during install
- **Node.js 18+**: https://nodejs.org/en/download
- **Git for Windows**: https://git-scm.com/download/win

### 2. Clone the repository

Open **Git Bash**, **PowerShell**, or **Command Prompt**:

```powershell
git clone https://github.com/trinadhmusunuri12-pixel/backend.git cyber-guard-XAI
cd cyber-guard-XAI
```

### 3. Backend setup

In **PowerShell** or **Command Prompt**:

```powershell
cd backend

# Create virtual environment
python -m venv venv

# Activate it (PowerShell)
venv\Scripts\Activate.ps1

# If you get an execution policy error, run this first:
# Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# Activate it (Command Prompt alternative)
# venv\Scripts\activate.bat

# Install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# Install spaCy English model
python -m spacy download en_core_web_sm

# Start the server (model.pkl is already present)
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

Backend will be live at: **http://localhost:8000**

### 4. Frontend setup

Open a **new PowerShell window**:

```powershell
cd cyber-guard-XAI\frontend

npm install
npm run dev
```

Frontend will be live at: **http://localhost:5173**

---

## 🔁 Retraining the Model (Optional)

Only follow these steps if you want to train a new model — for example, to use a different dataset, tune hyperparameters, or experiment with a different classifier.

### 1. Get the dataset

Download `Phishing_Email.csv` from Kaggle and place it inside `backend/`:  
https://www.kaggle.com/datasets/subhajournal/phishingemails  

Required columns: `Email Text`, `Email Type` (`"Safe Email"` / `"Phishing Email"`)

### 2. Retrain

```bash
# Linux
cd backend
source venv/bin/activate
python3 train.py

# Windows
cd backend
venv\Scripts\Activate.ps1
python train.py
```

This overwrites `model.pkl` and `vectorizer.pkl` with the newly trained versions.

### 3. (Optional) Regenerate SHAP keywords

```bash
# Linux
python3 generate_keywords.py

# Windows
python generate_keywords.py
```

This regenerates `keywords.json` based on the new model's SHAP scores.

---

## 🔌 API Endpoints

| Method | Endpoint    | Description                                          |
|--------|-------------|------------------------------------------------------|
| GET    | `/`         | Health check                                         |
| GET    | `/health`   | Model + MLM load status                              |
| POST   | `/analyze`  | Analyze email — returns prediction, LIME scores      |
| POST   | `/suggest`  | Get word substitution suggestions                    |
| GET    | `/history`  | Retrieve all scans from the current session          |
| DELETE | `/history`  | Clear session scan history                           |

### POST `/analyze` — Request

```json
{
  "email_text": "Dear customer, your account has been suspended. Click here to verify..."
}
```

### POST `/analyze` — Response

```json
{
  "id": "uuid",
  "timestamp": "2026-04-24T10:30:00",
  "email_preview": "Dear customer, your account has been suspended...",
  "prediction": 1,
  "confidence": 0.9341,
  "risk_score": 0.8712,
  "lime_words": [
    { "word": "verify",    "score": 0.0451 },
    { "word": "suspended", "score": 0.0382 },
    { "word": "click",     "score": 0.0210 }
  ],
  "recommendations": [
    "⚠ 'verify' detected: Requests to verify identity are a classic phishing tactic.",
    "🚨 Strong phishing signal. Do NOT click links or share personal info."
  ],
  "cleaned_text": "dear customer your account has been suspended click here to verify"
}
```

### POST `/suggest` — Request

```json
{
  "email_text": "Your account has been suspended. Please verify your identity.",
  "lime_words": [{ "word": "verify", "score": 0.045 }],
  "skip_words": []
}
```

### POST `/suggest` — Response

```json
[
  {
    "original": "verify",
    "lime_score": 0.0451,
    "base_risk": 0.8712,
    "occurrences": 1,
    "suggestions": [
      { "word": "check",   "new_risk": 0.6930, "delta": 0.1782 },
      { "word": "review",  "new_risk": 0.7340, "delta": 0.1372 },
      { "word": "inspect", "new_risk": 0.7510, "delta": 0.1202 }
    ]
  }
]
```

---

## 🧠 How It Works

```
User pastes email
       │
       ▼
Live keyword highlighting (client-side, keywords.js)
       │
       ▼
POST /analyze
  ├── clean_text()           — lowercase, expand URLs, strip non-alpha
  ├── TF-IDF vectorizer      — transform text to feature vector
  ├── Logistic Regression    — predict Phishing (1) or Safe (0) + probability
  └── LIME explainer         — per-word influence scores (1000 perturbation samples)
       │
       ▼
Frontend renders colored tokens
  Red   = phishing signal (LIME score > 0, pushes toward Phishing)
  Green = safe signal     (LIME score < 0, pushes toward Safe)
       │
       ▼  (if phishing detected)
POST /suggest
  ├── DistilBERT MLM         — fill-mask to find contextually natural candidates
  ├── Filter candidates      — exclude known phishing keywords + stopwords
  └── Score each candidate   — re-run Logistic Regression, return risk delta
       │
       ▼
Adversarial Evasion Guide — user swaps flagged words, watches % Phishing drop
```

> **Note on architecture:** The primary phishing classifier is **Logistic Regression + TF-IDF** (`model.pkl` + `vectorizer.pkl`). DistilBERT is only used as a secondary tool in the `/suggest` endpoint to generate contextually appropriate word replacement candidates — it is not the classifier.

---

## 📦 Python Dependencies

| Package           | Version   | Purpose                                         |
|-------------------|-----------|-------------------------------------------------|
| fastapi           | 0.111.0   | REST API framework                              |
| uvicorn           | 0.29.0    | ASGI server                                     |
| scikit-learn      | 1.4.2     | Logistic Regression classifier + TF-IDF         |
| pandas            | 2.2.2     | Dataset loading (only needed for retraining)    |
| lime              | 0.2.0.1   | Local Interpretable Model-agnostic Explanations |
| transformers      | latest    | DistilBERT MLM for word substitution candidates |
| spacy             | 3.8.14    | NLP utilities                                   |
| pydantic          | 2.7.1     | Request/response validation                     |
| python-multipart  | 0.0.9     | Form data support                               |
| shap              | latest    | SHAP keyword generation (only needed for retraining) |

---

## 🌐 Frontend Dependencies

| Package | Version | Purpose                 |
|---------|---------|-------------------------|
| react   | 18+     | UI framework            |
| vite    | 5+      | Build tool / dev server |

Fonts loaded via Google Fonts: `Space Mono`, `DM Mono`, `Syne`

---

## 🔧 Troubleshooting

**`model.pkl` not found**
> The model file should already be in the repo. If it is missing, it means it was not committed. Run `python3 train.py` (Linux) or `python train.py` (Windows) with `Phishing_Email.csv` present to regenerate it. See the [Retraining](#-retraining-the-model-optional) section.

**`vectorizer.pkl` not found or tokenizer error**
> Same as above — retrain using `train.py` to regenerate both `model.pkl` and `vectorizer.pkl` together. Never replace one without the other as they must match.

**PowerShell execution policy error (Windows)**
> Run: `Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser`

**CORS errors in browser**
> Ensure `VITE_API_URL` in `frontend/.env` matches the host:port where your backend is running.

**Port already in use**
> Change the port: `uvicorn main:app --reload --port 8001`  
> Then update `VITE_API_URL=http://localhost:8001` in `frontend/.env`

**`spacy` model not found**
> Run: `python3 -m spacy download en_core_web_sm`

---

## 👥 Authors

- **Trinadh Musunuri** — Backend, ML pipeline, Adversarial Evasion
- **Himasri** — Frontend components
- **Jeetender** — Dataset preprocessing & LIME integration

Central Michigan University — CPS Research Project, Spring 2026  
Advisor: **Professor Qi Liao**

---

## 📄 License

This project is intended for **academic and research purposes only**.  
Please contact the authors before reusing any part of this codebase.

---

## 🔗 Links

- **Dataset:** https://www.kaggle.com/datasets/subhajournal/phishingemails
- **GitHub Repo:** https://github.com/trinadhmusunuri12-pixel/backend
