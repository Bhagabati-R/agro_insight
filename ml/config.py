import os

# Paths
BASE_DIR      = os.path.dirname(os.path.abspath(__file__))
DATASET_DIR   = os.path.join(BASE_DIR, "dataset", "PlantVillage")
MODEL_DIR     = os.path.join(BASE_DIR, "model")
MODEL_PATH    = os.path.join(MODEL_DIR, "plant_disease_model.keras")
LABELS_PATH   = os.path.join(MODEL_DIR, "class_labels.json")

# Image settings
IMG_SIZE      = (224, 224)   # MobileNetV2 native input
BATCH_SIZE    = 32

# Training
EPOCHS_FROZEN = 10           # Phase 1: train only the head (base frozen)
EPOCHS_FINETUNE = 10         # Phase 2: unfreeze top layers and fine-tune
LEARNING_RATE = 1e-3
FINETUNE_LR   = 1e-5
VALIDATION_SPLIT = 0.15
TEST_SPLIT       = 0.15

# Fine-tune: unfreeze this many layers from the top of MobileNetV2
UNFREEZE_LAYERS = 30

os.makedirs(MODEL_DIR, exist_ok=True)
