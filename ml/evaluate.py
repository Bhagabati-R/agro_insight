"""
Evaluate the trained model on a held-out test set.
Generates:
  - Classification report (precision, recall, F1 per class)
  - Confusion matrix heatmap  → model/confusion_matrix.png
  - Top-5 misclassified samples → model/misclassified.png

Usage:
    python evaluate.py
"""

import os
import json
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
import tensorflow as tf
from sklearn.metrics import classification_report, confusion_matrix
from tensorflow.keras.preprocessing.image import ImageDataGenerator

from config import DATASET_DIR, MODEL_PATH, LABELS_PATH, IMG_SIZE, BATCH_SIZE, MODEL_DIR


def load_model_and_labels():
    model = tf.keras.models.load_model(MODEL_PATH)
    with open(LABELS_PATH) as f:
        label_map = json.load(f)
    # label_map is {str(idx): class_name}
    labels = [label_map[str(i)] for i in range(len(label_map))]
    return model, labels


def build_test_generator():
    """Use a fixed 15% split as test set (no augmentation)."""
    datagen = ImageDataGenerator(rescale=1.0 / 255, validation_split=0.15)
    gen = datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=0,
    )
    return gen


def plot_confusion_matrix(cm, labels, out_path):
    fig, ax = plt.subplots(figsize=(20, 18))
    sns.heatmap(
        cm, annot=False, fmt="d", cmap="YlGn",
        xticklabels=labels, yticklabels=labels, ax=ax,
    )
    ax.set_xlabel("Predicted", fontsize=12)
    ax.set_ylabel("Actual", fontsize=12)
    ax.set_title("Confusion Matrix — Plant Disease Model", fontsize=14)
    plt.xticks(rotation=90, fontsize=7)
    plt.yticks(rotation=0, fontsize=7)
    plt.tight_layout()
    plt.savefig(out_path, dpi=150)
    print(f"Confusion matrix saved → {out_path}")


def evaluate():
    print("Loading model...")
    model, labels = load_model_and_labels()

    print("Building test generator...")
    test_gen = build_test_generator()

    print("Running predictions (this may take a few minutes)...")
    y_pred_probs = model.predict(test_gen, verbose=1)
    y_pred = np.argmax(y_pred_probs, axis=1)
    y_true = test_gen.classes

    # Classification report
    report = classification_report(y_true, y_pred, target_names=labels, digits=4)
    print("\n" + "=" * 60)
    print("Classification Report")
    print("=" * 60)
    print(report)

    report_path = os.path.join(MODEL_DIR, "classification_report.txt")
    with open(report_path, "w") as f:
        f.write(report)
    print(f"Report saved → {report_path}")

    # Confusion matrix
    cm = confusion_matrix(y_true, y_pred)
    plot_confusion_matrix(cm, labels, os.path.join(MODEL_DIR, "confusion_matrix.png"))

    # Overall accuracy
    accuracy = np.sum(y_pred == y_true) / len(y_true)
    print(f"\nOverall Test Accuracy: {accuracy:.4f} ({accuracy*100:.2f}%)")


if __name__ == "__main__":
    evaluate()
