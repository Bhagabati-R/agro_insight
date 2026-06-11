

import os
import json
import shutil
from pathlib import Path
from config import DATASET_DIR, LABELS_PATH, IMG_SIZE, BATCH_SIZE, VALIDATION_SPLIT

import tensorflow as tf
from tensorflow.keras.preprocessing.image import ImageDataGenerator


def download_dataset():
    """Download PlantVillage via Kaggle API if not already present."""
    if os.path.exists(DATASET_DIR) and len(list(Path(DATASET_DIR).iterdir())) > 5:
        print(f"Dataset already exists at {DATASET_DIR}")
        return

    print("Downloading PlantVillage dataset from Kaggle...")
    print("Make sure ~/.kaggle/kaggle.json is configured.")
    os.makedirs(os.path.dirname(DATASET_DIR), exist_ok=True)

    os.system(
        "kaggle datasets download -d abdallahalidev/plantvillage-dataset "
        f"--unzip -p {os.path.dirname(DATASET_DIR)}"
    )

    # Kaggle unzips into 'plantvillage dataset/color' — normalize path
    raw = os.path.join(os.path.dirname(DATASET_DIR), "plantvillage dataset", "color")
    if os.path.exists(raw):
        shutil.move(raw, DATASET_DIR)
        print(f"Moved dataset to {DATASET_DIR}")


def get_class_labels():
    """Return sorted list of class names from dataset folder."""
    classes = sorted([
        d for d in os.listdir(DATASET_DIR)
        if os.path.isdir(os.path.join(DATASET_DIR, d))
    ])
    return classes


def save_labels(classes):
    label_map = {i: name for i, name in enumerate(classes)}
    with open(LABELS_PATH, "w") as f:
        json.dump(label_map, f, indent=2)
    print(f"Saved {len(classes)} class labels → {LABELS_PATH}")


def build_generators():
    """
    Build train/val ImageDataGenerators with augmentation.
    Augmentation applied only to training set.
    """
    train_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=VALIDATION_SPLIT,
        rotation_range=30,
        width_shift_range=0.15,
        height_shift_range=0.15,
        shear_range=0.1,
        zoom_range=0.2,
        horizontal_flip=True,
        brightness_range=[0.8, 1.2],
        fill_mode="nearest",
    )

    val_datagen = ImageDataGenerator(
        rescale=1.0 / 255,
        validation_split=VALIDATION_SPLIT,
    )

    train_gen = train_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="training",
        shuffle=True,
        seed=42,
    )

    val_gen = val_datagen.flow_from_directory(
        DATASET_DIR,
        target_size=IMG_SIZE,
        batch_size=BATCH_SIZE,
        class_mode="categorical",
        subset="validation",
        shuffle=False,
        seed=42,
    )

    return train_gen, val_gen


def print_distribution(train_gen):
    print("\nClass distribution (training set):")
    counts = {v: 0 for v in train_gen.class_indices.values()}
    for label in train_gen.classes:
        counts[label] += 1
    for cls, idx in sorted(train_gen.class_indices.items(), key=lambda x: x[1]):
        print(f"  [{idx:02d}] {cls}: {counts[idx]} images")


if __name__ == "__main__":
    download_dataset()
    classes = get_class_labels()
    save_labels(classes)
    train_gen, val_gen = build_generators()
    print_distribution(train_gen)
    print(f"\nTotal training batches : {len(train_gen)}")
    print(f"Total validation batches: {len(val_gen)}")
    print(f"Number of classes       : {len(classes)}")
