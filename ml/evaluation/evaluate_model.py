"""
CareLens AI - Real Model Evaluation & Metrics Pipeline

EVALUATES ONLY ON REAL TEST DATASET SPLIT.
SYNTHETIC / SIMULATED METRICS GENERATION HAS BEEN REMOVED ENTIRELY.

Computes per-class and macro screening metrics:
- Sensitivity / Recall (Crucial for screening to minimize false negatives)
- Specificity
- Precision
- F1-Score
- Accuracy
- ROC-AUC
- Confusion Matrix (TP, FP, TN, FN)
"""

import os
import json
import torch
import numpy as np
import pandas as pd
import matplotlib.pyplot as plt
from sklearn.metrics import (
    precision_score, recall_score, f1_score, accuracy_score,
    roc_auc_score, confusion_matrix, roc_curve
)
from typing import Dict, Any, Tuple
from torch.utils.data import DataLoader

from ml.models.screening_model import CareLensScreeningNet, CLASS_LABELS, CLASS_SHORT_NAMES
from ml.dataset.odir_loader import ODIRDataset, get_transforms

DEFAULT_CHECKPOINT = "ml/checkpoints/carelens_efficientnet_b0.pt"
DEFAULT_TEST_SPLIT = "ml/checkpoints/test_split.csv"
DEFAULT_IMAGE_DIR = "data/ODIR-5K/images"

def evaluate_carelens_model(
    checkpoint_path: str = DEFAULT_CHECKPOINT,
    test_csv: str = DEFAULT_TEST_SPLIT,
    image_dir: str = DEFAULT_IMAGE_DIR,
    output_dir: str = "docs/metrics"
) -> Dict[str, Any]:
    """
    Runs actual PyTorch model inference on the real saved test dataset split.
    Calculates genuine per-class and macro performance metrics.
    """
    os.makedirs(output_dir, exist_ok=True)
    device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

    # 1. Require Verified Test Split & Checkpoint (Strict Error Handling - No Fake Metrics)
    if not os.path.exists(checkpoint_path):
        raise FileNotFoundError(
            f"[CareLens Evaluation Error] Trained model checkpoint not found at '{checkpoint_path}'. "
            "Evaluation cannot be performed without a real trained checkpoint."
        )

    if not os.path.exists(test_csv):
        raise FileNotFoundError(
            f"[CareLens Evaluation Error] Real test split metadata file not found at '{test_csv}'. "
            "Evaluation cannot be performed without real test dataset annotations."
        )

    if not os.path.exists(image_dir):
        raise FileNotFoundError(
            f"[CareLens Evaluation Error] Retinal image directory not found at '{image_dir}'. "
            "Evaluation cannot be performed without real test images."
        )

    # 2. Load Real Checkpoint
    checkpoint = torch.load(checkpoint_path, map_location=device)
    model = CareLensScreeningNet(backbone="efficientnet_b0", num_classes=8, pretrained=False)
    model.load_state_dict(checkpoint["model_state_dict"])
    model.to(device)
    model.eval()

    # 3. Load Real Test DataLoader
    test_df = pd.read_csv(test_csv)
    _, val_transform = get_transforms(img_size=224)
    test_dataset = ODIRDataset(test_df, image_dir=image_dir, transform=val_transform)
    test_loader = DataLoader(test_dataset, batch_size=16, shuffle=False)

    print(f"[CareLens Evaluation] Running evaluation on {len(test_dataset)} real test images...")

    target_cols = ["N", "D", "G", "C", "A", "H", "M", "O"]
    all_y_true = []
    all_y_probs = []

    # 4. Perform Model Inference over Real Test Batch
    with torch.no_grad():
        for images, labels in test_loader:
            images = images.to(device)
            logits = model(images)
            probs = torch.sigmoid(logits).cpu().numpy()
            all_y_probs.append(probs)
            all_y_true.append(labels.numpy())

    y_true = np.vstack(all_y_true)
    y_probs = np.vstack(all_y_probs)

    threshold = 0.45
    y_pred = (y_probs >= threshold).astype(int)

    # 5. Compute Per-Class & Macro Metrics
    per_class_metrics = {}
    macro_sensitivity = []
    macro_specificity = []
    macro_precision = []
    macro_f1 = []

    for idx, (label, short_code) in enumerate(zip(CLASS_LABELS, CLASS_SHORT_NAMES)):
        yt = y_true[:, idx]
        yp = y_pred[:, idx]
        probs = y_probs[:, idx]

        tn, fp, fn, tp = confusion_matrix(yt, yp, labels=[0, 1]).ravel()

        sensitivity = tp / (tp + fn + 1e-8)  # Recall
        specificity = tn / (tn + fp + 1e-8)
        precision = tp / (tp + fp + 1e-8)
        f1 = 2 * (precision * sensitivity) / (precision + sensitivity + 1e-8)
        acc = (tp + tn) / (tp + tn + fp + fn + 1e-8)

        try:
            auc = float(roc_auc_score(yt, probs)) if len(np.unique(yt)) > 1 else 0.5
        except Exception:
            auc = 0.5

        per_class_metrics[short_code] = {
            "disease_name": label,
            "sensitivity_recall": round(float(sensitivity), 4),
            "specificity": round(float(specificity), 4),
            "precision": round(float(precision), 4),
            "f1_score": round(float(f1), 4),
            "accuracy": round(float(acc), 4),
            "roc_auc": round(auc, 4),
            "confusion_matrix": {"TP": int(tp), "FP": int(fp), "TN": int(tn), "FN": int(fn)}
        }

        macro_sensitivity.append(sensitivity)
        macro_specificity.append(specificity)
        macro_precision.append(precision)
        macro_f1.append(f1)

    overall_accuracy = float(np.mean(y_true == y_pred))

    summary_metrics = {
        "model_name": "CareLens ScreeningNet (EfficientNet-B0)",
        "model_version": checkpoint.get("model_version", "1.1.0"),
        "dataset_source": "ODIR-5K Retinal Fundus Benchmark",
        "training_date": checkpoint.get("training_date", "N/A"),
        "total_test_images": len(test_dataset),
        "total_test_patients": test_df['ID'].nunique() if 'ID' in test_df.columns else len(test_dataset),
        "classification_threshold": threshold,
        "metrics_available": True,
        "macro_metrics": {
            "sensitivity_recall": round(float(np.mean(macro_sensitivity)), 4),
            "specificity": round(float(np.mean(macro_specificity)), 4),
            "precision": round(float(np.mean(macro_precision)), 4),
            "f1_score": round(float(np.mean(macro_f1)), 4),
            "overall_accuracy": round(overall_accuracy, 4)
        },
        "per_class": per_class_metrics,
        "screening_safety_note": (
            "Model threshold is set for multi-label decision support. "
            "All screening outputs require professional evaluation by a qualified eye care specialist."
        )
    }

    # Save summary metrics to JSON file
    metrics_file = os.path.join(output_dir, "evaluation_metrics.json")
    with open(metrics_file, "w") as f:
        json.dump(summary_metrics, f, indent=2)

    # Plot metrics figure for documentation
    plt.figure(figsize=(10, 5))
    classes = CLASS_SHORT_NAMES
    sensitivities = [per_class_metrics[c]["sensitivity_recall"] for c in classes]
    specificities = [per_class_metrics[c]["specificity"] for c in classes]

    x = np.arange(len(classes))
    width = 0.35

    plt.bar(x - width/2, sensitivities, width, label='Sensitivity (Recall)', color='#0ea5e9')
    plt.bar(x + width/2, specificities, width, label='Specificity', color='#10b981')

    plt.xlabel('Disease Classes (ODIR-5K)')
    plt.ylabel('Score')
    plt.title('CareLens AI - Real Test Set Sensitivity vs Specificity')
    plt.xticks(x, classes)
    plt.ylim(0, 1.1)
    plt.legend()
    plt.tight_layout()

    chart_file = os.path.join(output_dir, "evaluation_chart.png")
    plt.savefig(chart_file, dpi=150)
    plt.close()

    print(f"[CareLens Evaluation] Real evaluation metrics saved to {metrics_file}")
    print(f"[CareLens Evaluation] Evaluation chart saved to {chart_file}")

    return summary_metrics

if __name__ == "__main__":
    try:
        evaluate_carelens_model()
    except FileNotFoundError as e:
        print(f"\n{e}\n")
