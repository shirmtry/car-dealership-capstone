"""Standalone Flask sentiment microservice using NLTK's VADER lexicon."""

import os
from pathlib import Path

from flask import Flask, jsonify
import nltk
from nltk.sentiment import SentimentIntensityAnalyzer

# The course template bundles this lexicon; no runtime download is needed.
nltk.data.path.insert(0, str(Path(__file__).resolve().parent))
analyzer = SentimentIntensityAnalyzer()
app = Flask(__name__)


@app.get("/")
def home():
    return jsonify({
        "service": "NLTK VADER Sentiment Analyzer",
        "endpoint": "/analyze/<text>",
    })


@app.get("/health")
def health():
    return jsonify({"status": "ok", "analyzer": "NLTK VADER"})


@app.get("/analyze/<path:input_txt>")
def analyze_sentiment(input_txt):
    if not input_txt.strip() or len(input_txt) > 5000:
        return jsonify({"error": "Provide between 1 and 5000 characters"}), 400
    compound = analyzer.polarity_scores(input_txt)["compound"]
    sentiment = (
        "positive" if compound >= 0.05 else
        "negative" if compound <= -0.05 else "neutral"
    )
    return jsonify({"sentiment": sentiment})


if __name__ == "__main__":
    app.run(
        host=os.getenv("SENTIMENT_HOST", "127.0.0.1"),
        port=int(os.getenv("SENTIMENT_PORT", "5050")),
        debug=False,
    )
