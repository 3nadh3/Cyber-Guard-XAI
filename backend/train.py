"""
Run this once to train the DistilBERT model:
    python3 train.py
"""

import pandas as pd
import re
import torch
from sklearn.model_selection import train_test_split
from sklearn.utils import resample
from datasets import Dataset
from transformers import AutoTokenizer, AutoModelForSequenceClassification, Trainer, TrainingArguments

# ---- 1. Clean Text (Same as your original) ----
def clean_text(text):
    text = str(text).lower()
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

print("Loading and preprocessing data...")
data = pd.read_csv("Phishing_Email.csv")
data = data[["Email Text", "Email Type"]].dropna()
data["Email Type"] = data["Email Type"].map({"Safe Email": 0, "Phishing Email": 1})
data["Email Text"] = data["Email Text"].apply(clean_text)

# ---- 2. Balance Data ----
safe = data[data["Email Type"] == 0]
phish = data[data["Email Type"] == 1]
phish = resample(phish, replace=True, n_samples=len(safe), random_state=42)
data = pd.concat([safe, phish])

# ---- 3. Tokenization ----
model_name = "distilbert-base-uncased"
print(f"Loading Tokenizer for {model_name}...")
tokenizer = AutoTokenizer.from_pretrained(model_name)

def tokenize_function(examples):
    # Truncate to 512 tokens (BERT's max length)
    return tokenizer(examples["text"], padding="max_length", truncation=True, max_length=512)

# Convert pandas to HuggingFace Dataset
df = pd.DataFrame({"text": data["Email Text"].tolist(), "label": data["Email Type"].tolist()})
dataset = Dataset.from_pandas(df)
dataset = dataset.train_test_split(test_size=0.2, seed=42)

print("Tokenizing dataset...")
tokenized_datasets = dataset.map(tokenize_function, batched=True)

# ---- 4. Model Setup ----
print("Initializing DistilBERT...")
model = AutoModelForSequenceClassification.from_pretrained(model_name, num_labels=2)

training_args = TrainingArguments(
    output_dir="./results",
    eval_strategy="epoch",       # <--- FIXED LINE HERE
    learning_rate=2e-5,
    per_device_train_batch_size=16,
    num_train_epochs=3,          # 3 epochs is usually enough for BERT
    weight_decay=0.01,
    save_strategy="no",          # Keep disk space low during training
)

trainer = Trainer(
    model=model,
    args=training_args,
    train_dataset=tokenized_datasets["train"],
    eval_dataset=tokenized_datasets["test"],
)

# ---- 5. Train & Save ----
print("Starting training...")
trainer.train()

print("Saving fine-tuned model...")
# Save the model and tokenizer to a directory (replaces model.pkl/vectorizer.pkl)
model.save_pretrained("./bert_phishing_model")
tokenizer.save_pretrained("./bert_phishing_model")
print("Training complete! Model saved to ./bert_phishing_model")
