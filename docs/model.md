# CareLens AI - Machine Learning & Explainable AI Documentation

## 1. Verified Dataset Source & Requirements

CareLens AI utilizes the **ODIR-5K (Ocular Disease Intelligent Recognition)** benchmark dataset:
- **Modality**: Retinal Fundus Color Photography (Left and Right eye images).
- **Target Classes**: 8 Multi-label Categories:
  1. **N**: Normal
  2. **D**: Diabetes / Diabetic Retinopathy
  3. **G**: Glaucoma
  4. **C**: Cataract
  5. **A**: Age-related Macular Degeneration (AMD)
  6. **H**: Hypertension
  7. **M**: Myopia
  8. **O**: Other Abnormality / Pathology

### Patient-Aware Data Splitting
Because fundus datasets contain left and right eye images per patient, random sample-level splitting introduces severe data leakage. CareLens AI enforces **Patient-Aware Splitting**, grouping all images by `Patient_ID` before partitioning into Train (70%), Validation (15%), and Test (15%) sets. Split metadata is saved to `ml/checkpoints/dataset_splits.json`.

---

## 2. Pre-Screening Image Quality Validator

Before passing uploaded files to neural network inference, the image is passed through the `ImageQualityValidator`:
1. **Resolution Gate**: Rejects images smaller than $150 \times 150$ pixels.
2. **Blur Detection**: Calculates Variance of Laplacian ($\text{Var}(\Delta I)$) over the active tissue ROI. Rejects images with score $< 8.0$.
3. **Extreme Illumination**: Detects solid black ($>85\%$ dark pixels) or washed out ($>85\%$ bright pixels) images.
4. **Foreground ROI Warm Spectrum Check**: Extracts foreground tissue mask (`gray > 12`) to verify red/orange color dominance characteristic of retinal tissue while ignoring dark background padding.

If validation fails, prediction is halted and the user receives:
> *"Image quality is insufficient for reliable screening. Please upload a clearer retinal image or seek assistance from a healthcare professional."*

---

## 3. Transfer Learning Architecture & Training

- **Backbone**: EfficientNet-B0 (Pretrained on ImageNet).
- **Loss Function**: Binary Cross Entropy with Logits (`BCEWithLogitsLoss`) using calculated positive class weights from the training set to handle class imbalance.
- **Optimization**: AdamW optimizer ($lr=1\times 10^{-4}$, weight decay $1\times 10^{-4}$), ReduceLROnPlateau scheduler.
- **Checkpoint Requirement**: `CareLensPredictor` strictly requires trained checkpoint weights at `ml/checkpoints/carelens_efficientnet_b0.pt`. Synthetic fallbacks and untrained random classifier heads are prohibited.

---

## 4. Evaluation Metrics Pipeline

Evaluation metrics are computed on the real test split (`ml/checkpoints/test_split.csv`) using `python -m ml.evaluation.evaluate_model` and outputted to `docs/metrics/evaluation_metrics.json`:
- **Macro Sensitivity / Recall**: Primary metric for minimizing false negatives.
- **Macro Specificity**: Minimizes false positive anxiety.
- **Macro Precision**: Assures reliability of positive alerts.
- **Macro F1-Score**: Harmonic mean balancing precision & recall.
- **Overall Accuracy**: Micro/Macro accuracy across 8 classes.

If the real test set evaluation has not been executed, the `/api/model-info` API endpoint returns `"metrics_available": false` rather than presenting simulated or hardcoded numbers.

---

## 5. Explainable AI (Grad-CAM)

Grad-CAM computes spatial activation maps from the final convolutional feature layer (`features[-1]`). The 2D activation matrix is normalized, mapped to a `COLORMAP_JET` overlay, and returned as a Base64 data URL alongside mandatory interpretability callouts:
> *"The highlighted regions show areas that influenced the AI model's prediction. This visualization is for model interpretability and is not a clinical diagnosis."*
