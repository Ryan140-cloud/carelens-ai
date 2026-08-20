import os
import io
import torch
import torchvision.transforms as transforms
from PIL import Image
import numpy as np
from typing import Dict, Any, List

# Limit PyTorch CPU threads for lightweight cloud deployment compatibility
torch.set_num_threads(1)

from ml.models.screening_model import CareLensScreeningNet
from ml.explainability.gradcam import GradCAM, encode_image_to_base64
from ml.inference.quality_validator import ImageQualityValidator

CLASS_NAMES = [
    "Normal",
    "Diabetic Retinopathy",
    "Glaucoma",
    "Cataract",
    "Age-related Macular Degeneration",
    "Hypertension",
    "Myopia",
    "Other Abnormality"
]

CLASS_SHORT_CODES = ["N", "D", "G", "C", "A", "H", "M", "O"]

RESPONSIBLE_EXPLANATIONS = {
    "Normal": {
        "title": "No Obvious Screening Abnormality Identified",
        "patient_friendly": "The AI screening model did not identify clear visual patterns of common retinal diseases in this fundus image.",
        "recommended_next_step": "Maintain routine annual comprehensive eye examinations with an eye doctor.",
        "risk_level": "SCREENING OUTPUT"
    },
    "Diabetic Retinopathy": {
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
        self.device = torch.device("cpu")
        self.model = CareLensScreeningNet(backbone="efficientnet_b0", num_classes=8, pretrained=False)

        # Resolve Checkpoint Location
        target_ckpt = checkpoint_path
        if not os.path.exists(target_ckpt):
            if os.path.exists("ml/checkpoints/carelens_efficientnet_b0.pt"):
                target_ckpt = "ml/checkpoints/carelens_efficientnet_b0.pt"
            elif os.path.exists("ml/checkpoints/carelens_efficientnet.pt"):
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
        # Step 1: Pre-Screening Image Quality Gate
        quality = self.validator.validate(image_bytes)
        if not quality["is_valid"]:
            return {
                "quality_check": quality,
                "is_ungradable": True,
                "primary_finding": None,
                "all_class_probabilities": [],
                "gradcam_data_url": None,
                "patient_friendly_explanation": {
                    "finding_title": "Ungradable Image Quality",
                    "patient_friendly_summary": quality["user_message"],
                    "recommended_next_step": "Please capture or upload a clearer, well-focused retinal image.",
                    "risk_level": "UNGRADABLE IMAGE",
                    "medical_disclaimer": "CareLens AI is an AI-assisted screening decision-support tool. It does NOT diagnose patients, replace an eye doctor, guarantee medical outcomes, or prescribe medication."
                }
            }

        # Step 2: PyTorch Model Inference
        pil_img = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        input_tensor = self.transform(pil_img).unsqueeze(0).to(self.device)

        with torch.no_grad():
            logits = self.model(input_tensor)
            probabilities = torch.sigmoid(logits).squeeze(0).cpu().numpy()

        # Step 3: Class Probability Spectrum
        class_spectrum = []
        for i, (name, short_code) in enumerate(zip(CLASS_NAMES, CLASS_SHORT_CODES)):
            prob = float(probabilities[i])
            class_spectrum.append({
                "class_name": name,
                "short_code": short_code,
                "confidence_pct": round(prob * 100, 1),
                "is_positive": prob >= 0.45
            })

        # Identify Primary Finding
        primary_idx = int(np.argmax(probabilities))
        primary_class = CLASS_NAMES[primary_idx]
        primary_prob = float(probabilities[primary_idx])

        # Step 4: Explainable AI Grad-CAM Saliency Map Generation
        gradcam_data_url = None
        try:
            cam_map = self.gradcam.generate_cam(input_tensor, target_class_idx=primary_idx)
            overlay = self.gradcam.overlay_heatmap_on_image(pil_img, cam_map, alpha=0.5)
            gradcam_data_url = encode_image_to_base64(overlay)
        except Exception as e:
            print(f"[CareLens Predictor Warning] Grad-CAM generation failed: {e}")

        # Step 5: Responsible Patient Explanation
        explanation_template = RESPONSIBLE_EXPLANATIONS.get(
            primary_class,
            RESPONSIBLE_EXPLANATIONS["Other Abnormality"]
        )

        return {
            "quality_check": quality,
            "is_ungradable": False,
            "primary_finding": {
                "class_name": primary_class,
                "confidence_pct": round(primary_prob * 100, 1),
                "is_abnormal": primary_idx != 0
            },
            "all_class_probabilities": class_spectrum,
            "gradcam_data_url": gradcam_data_url,
            "patient_friendly_explanation": {
                "finding_title": explanation_template["title"],
                "patient_friendly_summary": explanation_template["patient_friendly"],
                "recommended_next_step": explanation_template["recommended_next_step"],
                "risk_level": explanation_template["risk_level"],
                "medical_disclaimer": (
                    "CareLens AI is an AI-assisted screening decision-support tool. "
                    "It does NOT diagnose patients, replace an eye doctor, guarantee medical outcomes, or prescribe medication. "
                    "All screening results require clinical evaluation by a qualified healthcare professional."
                )
            },
            "model_metadata": {
                "architecture": "EfficientNet-B0",
                "model_version": getattr(self, "model_version", "1.1.0"),
                "dataset_version": getattr(self, "dataset_version", "ODIR-5K Benchmark"),
                "num_classes": 8
            }
        }
