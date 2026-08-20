"""
CareLens AI - Real Model Training Pipeline

Executes PyTorch transfer learning fine-tuning on PyTorch screening backbones (EfficientNet-B0).
Includes class imbalance weighting, early stopping, LR scheduling, and model checkpointing.

REQUIRES VERIFIED ODIR-5K DATASET. NO SYNTHETIC FALLBACKS ARE PERMITTED.
"""

import os
import time
import json
import datetime
import torch
import torch.nn as nn
import torch.optim as optim
from torch.utils.data import DataLoader
import pandas as pd
import numpy as np

from ml.models.screening_model import CareLensScreeningNet, CLASS_LABELS
from ml.dataset.odir_loader import ODIRDataset, get_transforms, create_patient_aware_splits

DEFAULT_DATASET_CSV = "data/ODIR-5K/full_df.csv"
DEFAULT_IMAGE_DIR = "data/ODIR-5K/images"

def calculate_pos_weights(df: pd.DataFrame, target_cols: list) -> torch.Tensor:
    """Calculates positive class weights for Binary Cross Entropy to handle dataset class imbalance."""
    pos_weights = []
    total = len(df)
    for col in target_cols:
        pos_count = df[col].sum()
        neg_count = total - pos_count
        weight = neg_count / (pos_count + 1e-5)
        pos_weights.append(weight)
    return torch.tensor(pos_weights, dtype=torch.float32)

def train_carelens_model(
    data_csv: str = DEFAULT_DATASET_CSV,
    image_dir: str = DEFAULT_IMAGE_DIR,
    epochs: int = 20,
    batch_size: int = 16,
    lr: float = 1e-4,
    backbone: str = "efficientnet_b0",
    checkpoint_dir: str = "ml/checkpoints",
    early_stopping_patience: int = 5
):
    os.makedirs(checkpoint_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
    print(f"[CareLens Training] Running on device: {device}")

    target_cols = ["N", "D", "G", "C", "A", "H", "M", "O"]

    # 1. Require Real Dataset (Strict Error Handling - No Synthetic Data)
    if not os.path.exists(data_csv):
        raise FileNotFoundError(
            f"[CareLens Dataset Error] ODIR-5K dataset CSV file not found at '{data_csv}'. "
            "Training cannot continue without the verified dataset. "
            "Please place the real dataset at 'data/ODIR-5K/full_df.csv' and images at 'data/ODIR-5K/images'."
        )

    if not os.path.exists(image_dir):
        raise FileNotFoundError(
            f"[CareLens Dataset Error] ODIR-5K image directory not found at '{image_dir}'. "
            "Training cannot continue without the verified dataset images."
        )

    df = pd.read_csv(data_csv)

    # Verify required columns exist in dataset
    required_cols = ["ID", "filename"] + target_cols
    missing = [c for c in required_cols if c not in df.columns]
    if missing:
        raise ValueError(
            f"[CareLens Dataset Error] CSV file at '{data_csv}' is missing required columns: {missing}. "
            f"Expected columns: {required_cols}"
        )

    # 2. Patient-Aware Train/Val/Test Split (70% train, 15% val, 15% test)
    train_df, val_df, test_df = create_patient_aware_splits(df, patient_col="ID", train_ratio=0.7, val_ratio=0.15, seed=42)
    print(f"[CareLens Split] Total Patients: {df['ID'].nunique()}, Total Images: {len(df)}")
    print(f"[CareLens Split] Train: {len(train_df)} images ({train_df['ID'].nunique()} patients)")
    print(f"[CareLens Split] Val:   {len(val_df)} images ({val_df['ID'].nunique()} patients)")
    print(f"[CareLens Split] Test:  {len(test_df)} images ({test_df['ID'].nunique()} patients)")

    # Save Patient-Aware Split Metadata
    splits_metadata = {
        "dataset_name": "ODIR-5K Retinal Fundus Benchmark",
        "created_at": datetime.datetime.now().isoformat(),
        "total_patients": int(df['ID'].nunique()),
        "total_images": len(df),
        "train_patients": int(train_df['ID'].nunique()),
        "val_patients": int(val_df['ID'].nunique()),
        "test_patients": int(test_df['ID'].nunique()),
        "train_images": len(train_df),
        "val_images": len(val_df),
        "test_images": len(test_df),
        "class_distribution": {col: int(df[col].sum()) for col in target_cols}
    }
    splits_file = os.path.join(checkpoint_dir, "dataset_splits.json")
    with open(splits_file, "w") as f:
        json.dump(splits_metadata, f, indent=2)
    print(f"[CareLens Split] Saved split metadata to {splits_file}")

    # Save Test DataFrame for Evaluation Pipeline
    test_df_file = os.path.join(checkpoint_dir, "test_split.csv")
    test_df.to_csv(test_df_file, index=False)

    # 3. Transforms & DataLoaders
    train_transform, val_transform = get_transforms(img_size=224)
    train_dataset = ODIRDataset(train_df, image_dir=image_dir, transform=train_transform)
    val_dataset = ODIRDataset(val_df, image_dir=image_dir, transform=val_transform)

    train_loader = DataLoader(train_dataset, batch_size=batch_size, shuffle=True)
    val_loader = DataLoader(val_dataset, batch_size=batch_size, shuffle=False)

    # 4. Model & Loss Initialization
    model = CareLensScreeningNet(backbone=backbone, num_classes=len(target_cols), pretrained=True).to(device)
    pos_weights = calculate_pos_weights(train_df, target_cols).to(device)
    criterion = nn.BCEWithLogitsLoss(pos_weight=pos_weights)

    optimizer = optim.AdamW(model.parameters(), lr=lr, weight_decay=1e-4)
    scheduler = optim.lr_scheduler.ReduceLROnPlateau(optimizer, mode="min", patience=2, factor=0.5)

    best_val_loss = float("inf")
    patience_counter = 0
    checkpoint_path = os.path.join(checkpoint_dir, f"carelens_{backbone}.pt")

    history = {"train_loss": [], "val_loss": []}

    # 5. Training Loop with Early Stopping & Checkpointing
    for epoch in range(epochs):
        model.train()
        running_train_loss = 0.0
        for images, labels in train_loader:
            images, labels = images.to(device), labels.to(device)
            optimizer.zero_grad()
            outputs = model(images)
            loss = criterion(outputs, labels)
            loss.backward()
            optimizer.step()
            running_train_loss += loss.item() * images.size(0)

        epoch_train_loss = running_train_loss / len(train_dataset)

        # Validation
        model.eval()
        running_val_loss = 0.0
        with torch.no_grad():
            for images, labels in val_loader:
                images, labels = images.to(device), labels.to(device)
                outputs = model(images)
                loss = criterion(outputs, labels)
                running_val_loss += loss.item() * images.size(0)

        epoch_val_loss = running_val_loss / len(val_dataset)
        scheduler.step(epoch_val_loss)

        history["train_loss"].append(epoch_train_loss)
        history["val_loss"].append(epoch_val_loss)

        print(f"Epoch [{epoch+1}/{epochs}] - Train Loss: {epoch_train_loss:.4f} | Val Loss: {epoch_val_loss:.4f}")

        # Save best model checkpoint
        if epoch_val_loss < best_val_loss:
            best_val_loss = epoch_val_loss
            patience_counter = 0
            torch.save({
                "epoch": epoch + 1,
                "model_state_dict": model.state_dict(),
                "optimizer_state_dict": optimizer.state_dict(),
                "backbone": backbone,
                "num_classes": len(target_cols),
                "val_loss": best_val_loss,
                "labels": target_cols,
                "model_version": "1.1.0",
                "training_date": datetime.datetime.now().isoformat(),
                "dataset_version": "ODIR-5K Real Benchmark"
            }, checkpoint_path)
            print(f" Saved best checkpoint: {checkpoint_path}")
        else:
            patience_counter += 1
            if patience_counter >= early_stopping_patience:
                print(f"[CareLens Training] Early stopping triggered at epoch {epoch+1}")
                break

    # Save training history summary
    with open(os.path.join(checkpoint_dir, "training_history.json"), "w") as f:
        json.dump(history, f, indent=2)

    print(f"[CareLens Training] Training complete. Best checkpoint saved to {checkpoint_path}")
    return checkpoint_path

if __name__ == "__main__":
    try:
        train_carelens_model()
    except FileNotFoundError as e:
        print(f"\n{e}\n")
