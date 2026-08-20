# CareLens AI - REST API Specification

Base URL: `http://localhost:8000/api`

---

## Endpoints Summary

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/health` | System health check & safety positioning |
| `GET` | `/model-info` | Model metadata, target classes & evaluation metrics |
| `POST` | `/image-quality` | Pre-screening image validation check |
| `POST` | `/screen` | Primary screening endpoint (prediction + Grad-CAM) |
| `GET` | `/history` | Fetch user screening history log |
| `POST` | `/history` | Save screening history record |
| `DELETE` | `/history/{item_id}` | Delete history record |
| `POST` | `/translate` | Multilingual translation engine |
| `POST` | `/tts` | Client-side TTS audio fallback metadata |

---

## Detailed Request & Response Formats

### `POST /api/screen`
Uploads a retinal fundus image for quality validation, model inference, and Grad-CAM generation.

**Request**: `multipart/form-data`
- `file`: Image binary (JPEG, PNG, WEBP)

**Response (Success)**:
```json
{
  "success": true,
  "is_ungradable": false,
  "quality_check": {
    "is_valid": true,
    "is_ungradable": false,
    "user_message": "Image quality verified suitable for preliminary AI screening.",
    "reason": "Passed all quality validation criteria.",
    "metrics": {
      "resolution": "300x300",
      "blur_score": 45.2,
      "red_spectrum_ratio": 0.42
    }
  },
  "primary_finding": {
    "class_name": "Diabetes / Diabetic Retinopathy",
    "short_code": "D",
    "probability": 0.845,
    "confidence_pct": 84.5,
    "is_positive": true
  },
  "gradcam_data_url": "data:image/jpeg;base64,...",
  "patient_friendly_explanation": {
    "finding_title": "Potential Microvascular Pattern Identified",
    "risk_level": "Moderate-to-High",
    "primary_condition": "Diabetes / Diabetic Retinopathy",
    "confidence_display": "84.5%",
    "patient_friendly_summary": "The screening model detected visual patterns characteristic of retinal microvascular changes related to blood sugar levels.",
    "recommended_next_step": "Schedule a comprehensive dilated eye exam with an ophthalmologist or optometrist for clinical evaluation.",
    "medical_disclaimer": "CareLens AI is an AI-assisted decision support tool. It does NOT diagnose patients..."
  }
}
```
