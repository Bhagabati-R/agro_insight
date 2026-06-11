"""
Two-phase transfer learning on PlantVillage using MobileNetV2.

Phase 1 — Frozen base:
    Only the custom classification head is trained.
    Fast convergence, prevents destroying pretrained weights.

Phase 2 — Fine-tuning:
    Top UNFREEZE_LAYERS of MobileNetV2 are unfrozen and trained
    at a very low learning rate for better feature specialization.

Usage:
    python train.py
"""

import os
import json
import tensorflow as tf
from tensorflow.keras import layers, models, optimizers, callbacks
from preprocess import build_generators, get_class_labels, save_labels, download_dataset
from config import (
    IMG_SIZE, MODEL_PATH, LABELS_PATH,
    EPOCHS_FROZEN, EPOCHS_FINETUNE,
    LEARNING_RATE, FINETUNE_LR,
    UNFREEZE_LAYERS, MODEL_DIR,
)


def build_model(num_classes: int) -> tf.keras.Model:
    """
    MobileNetV2 base + custom classification head.
    Input: (224, 224, 3) normalized [0, 1]
    Output: softmax over num_classes
    """
    base = tf.keras.applications.MobileNetV2(
        input_shape=(*IMG_SIZE, 3),
        include_top=False,
        weights="imagenet",
    )
    base.trainable = False  # freeze for phase 1

    inputs = tf.keras.Input(shape=(*IMG_SIZE, 3))
    x = base(inputs, training=False)
    x = layers.GlobalAveragePooling2D()(x)
    x = layers.BatchNormalization()(x)
    x = layers.Dense(256, activation="relu")(x)
    x = layers.Dropout(0.4)(x)
    x = layers.Dense(128, activation="relu")(x)
    x = layers.Dropout(0.3)(x)
    outputs = layers.Dense(num_classes, activation="softmax")(x)

    return tf.keras.Model(inputs, outputs), base


def get_callbacks(phase: str) -> list:
    return [
        callbacks.ModelCheckpoint(
            filepath=os.path.join(MODEL_DIR, f"best_{phase}.keras"),
            monitor="val_accuracy",
            save_best_only=True,
            verbose=1,
        ),
        callbacks.EarlyStopping(
            monitor="val_accuracy",
            patience=4,
            restore_best_weights=True,
            verbose=1,
        ),
        callbacks.ReduceLROnPlateau(
            monitor="val_loss",
            factor=0.5,
            patience=2,
            min_lr=1e-7,
            verbose=1,
        ),
        callbacks.TensorBoard(
            log_dir=os.path.join(MODEL_DIR, "logs", phase),
            histogram_freq=1,
        ),
    ]


def train():
    print("=" * 60)
    print("AgroInsight — Plant Disease Model Training")
    print("=" * 60)

    # Prepare data
    download_dataset()
    classes = get_class_labels()
    save_labels(classes)
    num_classes = len(classes)
    print(f"\nClasses: {num_classes}")

    train_gen, val_gen = build_generators()

    # Build model
    model, base = build_model(num_classes)
    model.summary()

    # ── Phase 1: Train head only ──────────────────────────────────
    print("\n[Phase 1] Training classification head (base frozen)...")
    model.compile(
        optimizer=optimizers.Adam(learning_rate=LEARNING_RATE),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history1 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_FROZEN,
        callbacks=get_callbacks("phase1"),
    )

    # ── Phase 2: Fine-tune top layers ────────────────────────────
    print(f"\n[Phase 2] Fine-tuning top {UNFREEZE_LAYERS} layers of MobileNetV2...")
    base.trainable = True
    for layer in base.layers[:-UNFREEZE_LAYERS]:
        layer.trainable = False

    # Recompile with lower LR
    model.compile(
        optimizer=optimizers.Adam(learning_rate=FINETUNE_LR),
        loss="categorical_crossentropy",
        metrics=["accuracy"],
    )

    history2 = model.fit(
        train_gen,
        validation_data=val_gen,
        epochs=EPOCHS_FINETUNE,
        callbacks=get_callbacks("phase2"),
    )

    # Save final model
    model.save(MODEL_PATH)
    print(f"\nModel saved → {MODEL_PATH}")

    # Save training summary
    summary = {
        "num_classes": num_classes,
        "phase1_best_val_accuracy": max(history1.history["val_accuracy"]),
        "phase2_best_val_accuracy": max(history2.history["val_accuracy"]),
        "total_epochs": EPOCHS_FROZEN + EPOCHS_FINETUNE,
    }
    with open(os.path.join(MODEL_DIR, "training_summary.json"), "w") as f:
        json.dump(summary, f, indent=2)

    print("\nTraining complete.")
    print(f"Phase 1 best val accuracy: {summary['phase1_best_val_accuracy']:.4f}")
    print(f"Phase 2 best val accuracy: {summary['phase2_best_val_accuracy']:.4f}")


if __name__ == "__main__":
    train()
