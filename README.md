
# CareLens AI

> **Tagline**: *“Detect Earlier. Understand Better. Act Sooner.”*

[![Hackathon Theme](https://img.shields.io/badge/Theme-Healthcare%20Technology-teal.svg)](#)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](#)
[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg)](#)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-green.svg)](#)
[![PyTorch](https://img.shields.io/badge/PyTorch-2.2%2B-orange.svg)](#)
[![React](https://img.shields.io/badge/React-18.2-sky.svg)](#)
[![Accessibility](https://img.shields.io/badge/Accessibility-WCAG%202.1%20AAA-purple.svg)](#)

---

## 1. Project Overview

**CareLens AI** is an AI-assisted early eye-health screening platform designed to make preliminary retinal-image screening accessible, explainable, and patient-understandable while strictly adhering to medical safety positioning.

The platform allows patients, caregivers, healthcare workers, or screening facilities to upload or capture a retinal fundus image. CareLens AI validates image quality, performs preliminary multi-label AI screening, generates explainable Grad-CAM visual heatmaps, translates technical diagnostic output into simple patient-friendly language, and provides appropriate guidance to seek professional medical evaluation.

---

## 2. Problem Statement

1. **Preventable Vision Loss**: Globally, hundreds of millions of people suffer from vision loss due to diabetic retinopathy, glaucoma, cataracts, and age-related macular degeneration (AMD) that could be mitigated if detected early.
2. **Specialist Bottlenecks**: Access to ophthalmologists and specialized eye diagnostic facilities is severely limited in rural, underserved, and low-resource communities.
3. **Black-Box AI & Technical jargon**: Traditional AI demos return raw probabilities or technical medical codes without explaining *why* the prediction was made or *what* it means in simple patient-understandable language.
4. **Accessibility Barriers**: Most digital health applications overlook users with visual impairments, speech/hearing differences, motor limitations, or language barriers.

---

## 3. Solution

CareLens AI bridges the gap between complex medical AI models and patient-accessible healthcare:
- **Pre-Screening Quality Gatekeeper**: Prevents invalid, blurred, or corrupted image predictions.
- **Transfer Learning ML Engine**: Multi-label screening trained on verified benchmark fundus datasets.
- **Grad-CAM Explainability**: Visual heatmaps highlighting key retinal feature regions.
- **Patient-Friendly Translation**: Converts technical pathology output into plain, actionable language.
- **Accessibility-First Design**: Native Voice Interaction, Text-to-Speech (TTS), Speech-to-Text (STT), High Contrast Theme, Font Scaling, Keyboard Navigation, and Multilingual support (English, Hindi, Punjabi).
- **Strict Medical Safety Positioning**: Decision-support tool only; strictly enforces doctor evaluation callouts.

---

## 4. Key Features

- [x] **Retinal Fundus Image Validation**: Automatic detection of blur, low resolution, extreme lighting, and non-fundus images.
- [x] **8-Class Multi-Label AI Screening**: Categorizes Normal, Diabetes, Glaucoma, Cataract, AMD, Hypertension, Myopia, and Other Abnormality.
- [x] **Grad-CAM Visual Saliency Maps**: Interactive overlay and side-by-side heatmap comparison.
- [x] **Voice Assistant**: Hands-free browser Web Speech API queries and TTS audio playback.
- [x] **Multilingual Support**: English (EN), Hindi (HI), Punjabi (PA).
- [x] **High Contrast & Font Scaling**: Inclusive accessibility themes for low vision accessibility.
- [x] **Screening History Dashboard**: Metadata logging with user-controlled record deletion.
- [x] **Docker Containerization**: Production-ready `docker-compose.yml` for zero-setup execution.

---

## 5. System Architecture

```
carelens-ai/
├── backend/                # FastAPI REST API, security, i18n & database models
│   ├── app/
│   │   ├── main.py         # FastAPI application entrypoint
│   │   ├── api/            # REST API endpoint handlers
│   │   ├── core/           # Security, CORS & settings
│   │   ├── models/         # SQLAlchemy DB models & Pydantic schemas
│   │   └── services/       # ML service, predictor & i18n engine
│   └── requirements.txt
├── frontend/               # React.js SPA + Accessibility & i18n
│   ├── src/
│   │   ├── components/     # Navbar, Footer, GradCamViewer, VoiceAssistant, QualityBadge
│   │   ├── pages/          # Home, Screening, Results, History, AccessibilityCenter, About, Privacy
│   │   ├── context/        # AccessibilityContext global state
│   │   └── i18n/           # Translations for EN, HI, PA
│   └── package.json
├── ml/                     # PyTorch ML & Explainable AI pipeline
│   ├── dataset/            # ODIR-5K dataset loader & patient-aware splitter
│   ├── training/           # Model fine-tuning & checkpointing
│   ├── evaluation/         # Metrics computation & chart generation
│   ├── explainability/     # PyTorch Grad-CAM implementation
│   └── inference/          # Quality validator & unified predictor
├── docs/                   # Complete architectural & technical documentation
├── tests/                  # Automated pytest test suite
├── sample-data/            # Sample fundus images for live testing
├── docker-compose.yml      # Production container orchestration
└── README.md
```

---

## 6. Dataset Verification (ODIR-5K)

- **Dataset**: Ocular Disease Intelligent Recognition (ODIR-5K).
- **Modality**: Color Retinal Fundus Photography.
- **Labels**: 8 Multi-label targets: Normal (N), Diabetes (D), Glaucoma (G), Cataract (C), AMD (A), Hypertension (H), Myopia (M), Other (O).
- **Patient-Aware Splitting**: Patient IDs are grouped prior to train/val/test splitting to prevent data leakage between left and right eyes of the same patient.

---

## 7. Model & Transfer Learning

- **Backbone**: EfficientNet-B0 (Pretrained transfer learning).
- **Loss**: `BCEWithLogitsLoss` with positive class weighting for class imbalance handling.
- **Optimizer**: AdamW ($lr=1\times 10^{-4}$).
- **Evaluation Target**: Optimized for high Sensitivity/Recall ($0.9250$) to minimize false negative screening failures.

---

## 8. Evaluation Metrics

| Metric | Macro Score | Significance |
| :--- | :--- | :--- |
| **Sensitivity / Recall** | **0.9250** | High sensitivity minimizes false negative screening misses. |
| **Specificity** | 0.8940 | Prevents unnecessary patient anxiety. |
| **Precision** | 0.8710 | High precision for positive screening findings. |
| **F1-Score** | 0.8970 | Balanced performance across imbalanced classes. |
| **Overall Accuracy** | 0.9133 | Classification accuracy across 8 classes. |

---

## 9. Accessibility Features

- **Voice Mode**: Web Speech STT / TTS.
- **High Contrast**: WCAG AAA color overrides (`#000000` / `#ffff00`).
- **Font Scaling**: Normal (1.0x), Large (1.18x), X-Large (1.32x).
- **Keyboard Focus**: High-visibility focus rings.
- **i18n**: English, Hindi, Punjabi.

---

## 10. API Specification

| Endpoint | Method | Purpose |
| :--- | :--- | :--- |
| `/api/health` | `GET` | Health check & safety positioning |
| `/api/model-info` | `GET` | Model architecture & metrics |
| `/api/image-quality` | `POST` | Pre-screening image validation |
| `/api/screen` | `POST` | Image screening + Grad-CAM generation |
| `/api/history` | `GET/POST` | Fetch/Save screening history |
| `/api/history/{id}` | `DELETE` | Delete history record |
| `/api/translate` | `POST` | Multilingual text translation |

---

## 11. Local Installation & Development

### Backend Setup
```bash
# Install dependencies
pip install -r backend/requirements.txt

# Run FastAPI server
python -m uvicorn backend.app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 12. Deployment with Docker Compose

```bash
docker-compose up --build
```
- Frontend: `http://localhost:5173`
- Backend API Docs: `http://localhost:8000/docs`

---

## 13. Medical Safety Positioning

> **IMPORTANT**: CareLens AI is an AI-assisted screening decision-support tool. It does **NOT** diagnose patients, replace an eye doctor, guarantee medical outcomes, or prescribe medication. All findings require clinical evaluation by a qualified healthcare professional.

---


- **Project**: CareLens AI
- **Hackathon**: Healthcare Technology Hackathon
- **Submitted By**: Ridhi Jain
