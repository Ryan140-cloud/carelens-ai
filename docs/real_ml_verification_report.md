# CareLens AI - Real ML Verification & Compliance Report

> **Verification Date**: August 20, 2026  
> **Status**: Verified & Compliant with Strict Healthcare ML Protocols  
> **Strict Compliance**: Synthetic fallbacks, hardcoded evaluation metrics, and random classifier head fallbacks have been **permanently eliminated**.

---

## 1. Dataset Specification & Pipeline Requirements

| Metric / Dimension | Specification |
| :--- | :--- |
| **Dataset Source** | Ocular Disease Intelligent Recognition (ODIR-5K Benchmark) |
| **Dataset Location** | `data/ODIR-5K/full_df.csv` and `data/ODIR-5K/images/` |
| **Modality** | Color Retinal Fundus Photography |
| **Target Disease Classes (8)** | Normal (N), Diabetes/Diabetic Retinopathy (D), Glaucoma (G), Cataract (C), Age-related Macular Degeneration (A), Hypertension (H), Myopia (M), Other Abnormality (O) |
| **Patient-Aware Split Protocol** | 70% Train / 15% Validation / 15% Test grouped strictly by `Patient_ID` (left and right eye images of the same patient remain in the same partition to prevent data leakage) |
| **Saved Split Metadata** | `ml/checkpoints/dataset_splits.json` and `ml/checkpoints/test_split.csv` |

---

## 2. Model Architecture & Training Configuration

- **Backbone Architecture**: PyTorch `EfficientNet-B0` (Transfer Learning from ImageNet feature extractor).
- **Classification Head**: `nn.Sequential(nn.Dropout(p=0.3), nn.Linear(1280, 8))`.
- **Loss Function**: `nn.BCEWithLogitsLoss(pos_weight=pos_weights)` with real positive-class weights calculated dynamically from training set distribution.
- **Optimizer**: `AdamW(lr=1e-4, weight_decay=1e-4)`.
- **Data Augmentation**: Horizontal/vertical flips, rotation ($\pm 15^\circ$), color jitter, ImageNet normalization.
- **Early Stopping**: Patience of 5 epochs monitoring validation loss.
- **Saved Checkpoint**: `ml/checkpoints/carelens_efficientnet_b0.pt`.

---

## 3. Strict Checkpoint Loading & Safety Enforcement

1. **No Synthetic Training Fallbacks**:
   - `ml/dataset/odir_loader.py` and `ml/training/train_model.py` explicitly raise `FileNotFoundError` if real ODIR-5K dataset CSV or images are missing.
   - All `for i in range(100)` synthetic generators and `Image.new()` placeholder fallbacks have been removed.

2. **No Random Classifier Fallbacks**:
   - `CareLensPredictor` strictly requires the trained checkpoint at `ml/checkpoints/carelens_efficientnet_b0.pt`.
   - If the checkpoint is missing or corrupt, it raises a `RuntimeError("Trained CareLens model checkpoint unavailable. Screening is temporarily unavailable.")`.
   - The backend API catches this error gracefully and informs the user rather than outputting random/uncalibrated probabilities.

3. **No Fabricated Metrics in API**:
   - `/api/model-info` dynamically loads real evaluation results from `docs/metrics/evaluation_metrics.json`.
   - If evaluation has not been performed on real test images, `/api/model-info` returns `"metrics_available": false` and `metrics_summary: None`.
   - Hardcoded metrics (`0.9250`, `0.8940`, `0.8710`, `0.8970`, `0.9133`) have been removed from the backend API.

---

## 4. Grad-CAM & Quality Validator Compliance

- **Grad-CAM Saliency**: Live PyTorch backward gradient pass registered on `model.backbone.features[-1]`, generating dynamic JET colormap heatmaps for the selected primary finding.
- **Quality Validator Parameters**:
  - Minimum Resolution: $150 \times 150$ pixels
  - Blur Threshold (Laplacian Variance): $8.0$
  - Foreground ROI Analysis: Active lens region extraction (`gray > 12`) to prevent false rejections of fundus photos with dark padding.

---

## 5. Verification Checklist

- [x] All synthetic dataset generators removed.
- [x] Patient-aware split metadata pipeline implemented.
- [x] Checkpoint loading strictness enforced (no random head fallback).
- [x] Dynamic API evaluation metrics loading implemented (`metrics_available: false` fallback).
- [x] Quality validator parameters aligned between code and documentation.
- [x] Existing UI design, navigation, accessibility center, and visual identity 100% preserved.
