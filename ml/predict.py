"""
Flask microservice — exposes POST /predict for the Node backend.

Usage:
    python predict.py          # runs on port 5001

Request:  multipart/form-data  { image: <file> }
Response: {
    "class": "Tomato___Late_blight",
    "confidence": 0.9732,
    "top5": [
        { "class": "Tomato___Late_blight",   "confidence": 0.9732 },
        { "class": "Tomato___Early_blight",  "confidence": 0.0201 },
        ...
    ],
    "crop": "Tomato",
    "condition": "Late blight",
    "isHealthy": false
}
"""

import os
import json
import numpy as np
import tensorflow as tf
from PIL import Image
from io import BytesIO
from flask import Flask, request, jsonify
from flask_cors import CORS

from config import MODEL_PATH, LABELS_PATH, IMG_SIZE

app = Flask(__name__)
CORS(app)

# Load once at startup
print("Loading model...")
model = tf.keras.models.load_model(MODEL_PATH)

with open(LABELS_PATH) as f:
    raw = json.load(f)
label_map = {int(k): v for k, v in raw.items()}
print(f"Model ready. {len(label_map)} classes.")


def preprocess(image_bytes: bytes) -> np.ndarray:
    """Resize, normalize, add batch dim."""
    img = Image.open(BytesIO(image_bytes)).convert("RGB")
    img = img.resize(IMG_SIZE, Image.LANCZOS)
    arr = np.array(img, dtype=np.float32) / 255.0
    return np.expand_dims(arr, axis=0)


def parse_label(label: str) -> tuple[str, str, bool]:
    """
    PlantVillage labels are formatted as:
        CropName___Condition   e.g. 'Tomato___Late_blight'
    Returns (crop, condition, isHealthy)
    """
    parts = label.split("___", 1)
    crop = parts[0].replace("_", " ") if parts else label
    condition = parts[1].replace("_", " ") if len(parts) > 1 else "Unknown"
    is_healthy = "healthy" in condition.lower()
    return crop, condition, is_healthy


@app.route("/predict", methods=["POST"])
def predict():
    if "image" not in request.files:
        return jsonify({"error": "No image provided."}), 400

    image_bytes = request.files["image"].read()
    if not image_bytes:
        return jsonify({"error": "Empty image."}), 400

    try:
        tensor = preprocess(image_bytes)
        probs = model.predict(tensor, verbose=0)[0]

        # Top-5 predictions
        top5_idx = np.argsort(probs)[::-1][:5]
        top5 = [
            {"class": label_map[i], "confidence": round(float(probs[i]), 4)}
            for i in top5_idx
        ]

        best = top5[0]
        crop, condition, is_healthy = parse_label(best["class"])

        return jsonify({
            "class": best["class"],
            "confidence": best["confidence"],
            "top5": top5,
            "crop": crop,
            "condition": condition,
            "isHealthy": is_healthy,
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok", "classes": len(label_map)})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5001, debug=False)
