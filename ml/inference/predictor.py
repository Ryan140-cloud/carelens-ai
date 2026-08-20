"""
CareLens AI - End-to-End Inference Pipeline
Integrates Image Quality Validation, PyTorch Model Inference, Grad-CAM Explainability,
and Patient-Friendly Explanation Translation.

STRICT CHECKPOINT LOADING: Fails explicitly if trained model weights checkpoint is missing.
No random classification head fallbacks are permitted.
"""

import os
import io
import torch
import numpy as np
from PIL import Image
from torchvision import transforms
from typing import Dict, Any, List

from ml.models.screening_model import CareLensScreeningNet, CLASS_LABELS, CLASS_SHORT_NAMES
from ml.inference.quality_validator import ImageQualityValidator, UNGRADABLE_MESSAGE
from ml.explainability.gradcam import GradCAM

# Standard Medical Guidance templates for screening findings (Responsible Medical Wording)
GUIDANCE_MAP = {
    "Normal": {
        "title": "No Significant Pathological Patterns Identified",
        "patient_friendly": "The screening model did not identify obvious structural abnormalities in the uploaded image. Routine eye check-ups remain recommended.",
        "recommended_next_step": "Maintain routine regular eye check-ups with an eye-care professional.",
        "risk_level": "SCREENING OUTPUT"
    },
    "Diabetes / Diabetic Retinopathy": {
        "title": "Potential Microvascular Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with diabetic retinopathy screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Schedule a comprehensive dilated eye exam with an ophthalmologist or optometrist for clinical evaluation.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Glaucoma": {
        "title": "Potential Optic Nerve Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with glaucoma screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Seek clinical evaluation by an eye doctor for intraocular pressure and visual field assessment.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Cataract": {
        "title": "Potential Lens Opacity Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with cataract screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Consult an eye professional for visual acuity testing and cataract evaluation.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Age-related Macular Degeneration": {
        "title": "Potential Macular Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with age-related macular degeneration screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Consult a retinal specialist or ophthalmologist for macular health check.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Hypertension": {
        "title": "Potential Hypertensive Vascular Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with hypertensive retinal screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Discuss eye health and blood pressure management with your physician or eye specialist.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Myopia": {
        "title": "Potential Myopic Retinal Pattern Identified",
        "patient_friendly": "The screening model identified image patterns associated with high myopic screening indicators. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Schedule a refractive and retinal exam with an eye doctor.",
        "risk_level": "POTENTIAL FINDING"
    },
    "Other Abnormality": {
        "title": "General Retinal Pattern Identified",
        "patient_friendly": "The screening model identified atypical visual patterns in the fundus image. This result requires evaluation by an eye-care professional.",
        "recommended_next_step": "Seek evaluation by a qualified eye care professional.",
        "risk_level": "POTENTIAL FINDING"
    }
}

class CareLensPredictor:
    def __init__(self, checkpoint_path: str = "ml/checkpoints/carelens_efficientnet_b0.pt"):
        self.validator = ImageQualityValidator()
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.model = CareLensScreeningNet(backbone="efficientnet_b0", num_classes=8, pretrained=False)

        # Resolve Checkpoint Location
        target_ckpt = checkpoint_path
        if not os.path.exists(target_ckpt) and os.path.exists("ml/checkpoints/carelens_efficientnet.pt"):
            target_ckpt = "ml/checkpoints/carelens_efficientnet.pt"

        # STRICT CHECKPOINT REQUIREMENT - NO UNTRAINED / RANDOM FALLBACKS
        if not os.path.exists(target_ckpt):
            raise RuntimeError(
                f"[CareLens ML Error] Trained CareLens model checkpoint unavailable at '{target_ckpt}'. "
                "Screening is temporarily unavailable. Please run the model training pipeline first."
            )

        try:
            ckpt = torch.load(target_ckpt, map_location=self.device)
            self.model.load_state_dict(ckpt["model_state_dict"])
            self.model_version = ckpt.get("model_version", "1.1.0")
            self.dataset_version = ckpt.get("dataset_version", "ODIR-5K Benchmark")
            print(f"[CareLens Predictor] Successfully loaded PyTorch trained checkpoint from '{target_ckpt}'")
        except Exception as e:
            raise RuntimeError(
                f"[CareLens ML Error] Failed to load trained checkpoint from '{target_ckpt}': {e}. "
                "Screening is temporarily unavailable."
            )

        self.model.to(self.device)
        self.model.eval()

        # Initialize Grad-CAM targeting backbone feature layer
        target_layer = self.model.get_target_layer_for_gradcam()
        self.gradcam = GradCAM(self.model, target_layer)

        self.transform = transforms.Compose([
            transforms.Resize((224, 224)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

    def predict(self, image_bytes: bytes) -> Dict[str, Any]:
        """
        Full screening pipeline execution.
        """
        # 1. Quality Validation Check
        quality_result = self.validator.validate_image_bytes(image_bytes)

        if not quality_result["is_valid"]:
            return {
                "success": False,
                "is_ungradable": True,
                "quality_check": quality_result,
                "error_message": quality_result["user_message"],
                "prediction": None,
                "gradcam_data_url": None,
                "patient_friendly_explanation": None
            }

        # 2. Preprocess image
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        # 3. Model Inference (Multi-Label Sigmoid Probabilities)
        with torch.no_grad():
            logits = self.model(input_tensor)
            probs = torch.sigmoid(logits).cpu().numpy()[0]

        # Map probabilities to classes
        class_results = []
        for idx, (label, short_code) in enumerate(zip(CLASS_LABELS, CLASS_SHORT_NAMES)):
            prob = float(probs[idx])
            class_results.append({
                "class_name": label,
                "short_code": short_code,
                "probability": round(prob, 4),
                "confidence_pct": round(prob * 100, 1),
                "is_positive": bool(prob >= 0.45)
            })

        # Identify primary finding (highest probability non-normal, or normal if all low)
        sorted_results = sorted(class_results, key=lambda x: x["probability"], reverse=True)
        primary_finding = sorted_results[0]

        if primary_finding["class_name"] == "Normal" and primary_finding["probability"] < 0.6:
            # Check if any disease condition has notable probability
            disease_findings = [r for r in sorted_results if r["class_name"] != "Normal" and r["probability"] >= 0.40]
            if disease_findings:
                primary_finding = disease_findings[0]

        primary_class_name = primary_finding["class_name"]
        primary_prob = primary_finding["probability"]
        primary_idx = CLASS_LABELS.index(primary_class_name)

        # 4. Generate Grad-CAM Visual Heatmap Overlay
        try:
            # Require grad for backward pass in Grad-CAM
            input_tensor_grad = input_tensor.clone().detach().requires_grad_(True)
            heatmap_2d = self.gradcam.generate_heatmap(input_tensor_grad, target_class_idx=primary_idx)
            _, gradcam_data_url = self.gradcam.overlay_heatmap(pil_img, heatmap_2d)
        except Exception as e:
            print(f"[CareLens Predictor] Grad-CAM generation warning: {e}")
            gradcam_data_url = None

        # 5. Build Safe Patient-Friendly Explanation & Guidance
        guidance = GUIDANCE_MAP.get(primary_class_name, GUIDANCE_MAP["Other Abnormality"])

        explanation_data = {
            "finding_title": guidance["title"],
            "risk_level": guidance["risk_level"],
            "primary_condition": primary_class_name,
            "confidence_display": f"{round(primary_prob * 100, 1)}%",
            "patient_friendly_summary": guidance["patient_friendly"],
            "recommended_next_step": guidance["recommended_next_step"],
            "gradcam_explanation": (
                "The highlighted regions in the visual heatmap show areas of the retinal scan "
                "that influenced the AI model's prediction. This visualization is provided for "
                "model interpretability and is NOT a clinical diagnosis."
            ),
            "medical_disclaimer": (
                "CareLens AI is an AI-assisted screening decision-support tool. "
                "It does NOT diagnose patients, replace an eye doctor, or guarantee medical outcomes. "
                "Always consult a qualified eye care professional for definitive clinical diagnosis and treatment."
            )
        }

        return {
            "success": True,
            "is_ungradable": False,
            "quality_check": quality_result,
            "primary_finding": primary_finding,
            "all_class_probabilities": class_results,
            "gradcam_data_url": gradcam_data_url,
            "patient_friendly_explanation": explanation_data,
            "model_metadata": {
                "architecture": "EfficientNet-B0 (Transfer Learning)",
                "dataset_source": self.dataset_version,
                "version": self.model_version
            }
        }
