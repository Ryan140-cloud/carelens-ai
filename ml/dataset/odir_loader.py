"""
CareLens AI - ODIR-5K Dataset Loader & Patient-Aware Splitter

Handles loading and structuring retinal fundus dataset records while guaranteeing
that images from the same patient ID remain in the same partition (Train, Val, or Test)
to prevent data leakage across left and right eye images.

NO SYNTHETIC OR FAKE IMAGE FALLBACKS ARE PERMITTED.
"""

import os
import pandas as pd
import numpy as np
import torch
from torch.utils.data import Dataset, DataLoader
from torchvision import transforms
from PIL import Image
from typing import Tuple, List, Dict

class ODIRDataset(Dataset):
    def __init__(self, df: pd.DataFrame, image_dir: str, transform=None):
        self.df = df.reset_index(drop=True)
        self.image_dir = image_dir
        self.transform = transform
        self.target_cols = ["N", "D", "G", "C", "A", "H", "M", "O"]

    def __len__(self):
        return len(self.df)

    def __getitem__(self, idx: int) -> Tuple[torch.Tensor, torch.Tensor]:
        row = self.df.iloc[idx]
        img_name = row["filename"]
        img_path = os.path.join(self.image_dir, img_name)

        if not os.path.exists(img_path):
            raise FileNotFoundError(
                f"[CareLens Dataset Error] Required retinal fundus image file not found: '{img_path}'. "
                "Synthetic image fallbacks are prohibited in CareLens AI."
            )

        image = Image.open(img_path).convert("RGB")

        if self.transform:
            image = self.transform(image)

        labels = row[self.target_cols].values.astype(np.float32)
        return image, torch.tensor(labels)


def get_transforms(img_size: int = 224):
    train_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.RandomHorizontalFlip(p=0.5),
        transforms.RandomVerticalFlip(p=0.2),
        transforms.RandomRotation(degrees=15),
        transforms.ColorJitter(brightness=0.15, contrast=0.15),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    val_transform = transforms.Compose([
        transforms.Resize((img_size, img_size)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
    ])

    return train_transform, val_transform


def create_patient_aware_splits(
    df: pd.DataFrame, patient_col: str = "ID", train_ratio: float = 0.7, val_ratio: float = 0.15, seed: int = 42
) -> Tuple[pd.DataFrame, pd.DataFrame, pd.DataFrame]:
    """
    Groups data by Patient ID and performs split to ensure zero data leakage
    between training, validation, and test datasets.
    """
    unique_patients = np.array(list(df[patient_col].unique()))
    np.random.seed(seed)
    np.random.shuffle(unique_patients)

    n_total = len(unique_patients)
    n_train = int(n_total * train_ratio)
    n_val = int(n_total * val_ratio)

    train_patients = set(unique_patients[:n_train])
    val_patients = set(unique_patients[n_train:n_train + n_val])
    test_patients = set(unique_patients[n_train + n_val:])

    train_df = df[df[patient_col].isin(train_patients)].copy()
    val_df = df[df[patient_col].isin(val_patients)].copy()
    test_df = df[df[patient_col].isin(test_patients)].copy()

    return train_df, val_df, test_df
