# CareLens AI - Hackathon Round 2 PowerPoint (PPT) Presentation Outline

> **Direct Match with Round 1 Pitch Deck (`CareLens_AI_Pitch_Deck1.pptx`)**  
> **Tagline**: *“Detect Earlier. Understand Better. Act Sooner.”*  
> **Category**: Healthcare Technology | AI & Accessibility  
> **Pitch Duration**: 5 - 7 Minutes

---

## Slide 1: Title Slide
- **Header**: CareLens AI
- **Tagline**: Detect Earlier. Understand Better. Act Sooner.
- **Subtitle**: Making AI-assisted eye-health screening more accessible to everyone.
- **Visual**: High-tech retinal scan graphic with Grad-CAM heatmap overlay icon & accessibility badges.

---

## Slide 2: The Problem - Eye Diseases Often Go Undetected
- **Global Vision Crisis**: Millions suffer preventable vision loss from Diabetic Retinopathy, Glaucoma, Cataracts, and AMD due to late detection.
- **Specialist Deficit**: High cost, long wait times, and severe shortage of ophthalmologists in rural & underserved areas.
- **Existing AI Limitations**: Most AI tools output confusing technical codes, lack explainability, and ignore users with visual, hearing, or language barriers.

---

## Slide 3: Our Solution - Meet CareLens AI
- **7-Step Complete Workflow**:
  1. Retinal image (captured / uploaded)
  2. Image quality & pre-screening validation
  3. AI multi-class screening model (ODIR-5K benchmark)
  4. Risk / classification result + confidence score
  5. Explainable AI (Grad-CAM saliency heatmaps)
  6. Accessibility layer (Voice, text, simple visuals, multilingual EN/HI/PA)
  7. Patient-friendly explanation & appropriate professional follow-up
- **Accessibility-First Interaction Layer**: Delivered through voice, text, and simple visuals so the experience works regardless of how a person sees, hears, or interacts.
- **Medical Disclaimer**: Decision-support tool only—not a replacement for doctors or a definitive clinical diagnosis.

---

## Slide 4: Capabilities - From Detection to Action
- **01. AI-Assisted Eye Screening**: Deep learning fundus image analysis.
- **02. Multi-Class Screening**: Cataract, Diabetic Retinopathy, Glaucoma, Normal, AMD, Hypertension, Myopia, Other Abnormality.
- **03. Explainable AI**: Grad-CAM highlights specific visual regions influencing predictions.
- **04. Easy-to-Understand Results**: Technical outputs converted into plain language summaries.
- **05. Risk-Based Guidance**: Low / Moderate / High risk categories + next steps.
- **06. Screening History**: View past screenings and track metadata over time.
- **07. Voice & Text Interaction**: Voice-first navigation, Speech-to-Text, and Text-to-Speech audio playback.
- **08. Accessible, Multilingual Interface**: High-contrast, large-text display, keyboard navigation, and English/Hindi/Punjabi i18n.

---

## Slide 5: Why CareLens AI Is Different
- **AI Screening + Explainable AI + Accessibility-First Design + Voice Interaction + Multilingual Support + Patient-Friendly Explanations + Responsible Healthcare Guidance**.
- **Product Quality**: Feels like a real startup-quality healthcare platform, not a basic student ML script.

---

## Slide 6: Under the Hood - Technology Behind CareLens AI
- **Frontend**: React.js 18, HTML5, CSS3, JavaScript, Vite, TailwindCSS.
- **Backend**: Python 3.14, FastAPI REST Server, Pydantic v2.
- **AI / ML**: PyTorch 2.2, Transfer Learning (EfficientNet-B0), PyTorch Grad-CAM.
- **Database**: SQLAlchemy ORM (SQLite zero-config local / PostgreSQL production).
- **Accessibility**: Web Speech API (STT / TTS), i18n Translation Engine (EN, HI, PA), High-Contrast CSS, Keyboard Focus.
- **Deployment**: Docker, Dockerfile.backend, Dockerfile.frontend, docker-compose.yml.
- **User Flow Diagram**:
  $$\text{User/Caregiver} \rightarrow \text{Web Interface} \rightarrow \text{Quality Check} \rightarrow \text{Deep Learning Model} \rightarrow \text{Grad-CAM Heatmap} \rightarrow \text{Patient Summary} \rightarrow \text{ACCESSIBILITY LAYER} \rightarrow \text{User/Doctor}$$

---

## Slide 7: Impact - Healthcare That Reaches Everyone
- **Early Detection**: Empowers rural health workers and caregivers to identify risks earlier.
- **Explainability & Trust**: Grad-CAM heatmaps build clinical and patient confidence.
- **Universal Accessibility**: Breaks sensory, literacy, and language barriers.

---

## Slide 8: Built for Today, Designed to Scale
- **MVP (Delivered in Round 2)**:
  - Retinal image upload & camera capture.
  - Multi-class screening model (ODIR-5K 8-class).
  - Explainable AI Grad-CAM heatmaps.
  - Patient-friendly results & 1-click Export PDF Clinical Report.
  - Voice / text interaction & Web Speech TTS.
  - Multilingual support (English, Hindi, Punjabi).
  - High-contrast, large-text, screen-reader friendly design.
- **Phase 2 & Phase 3 Roadmap**:
  - Telemedicine clinic integration & rural community health worker deployment.
  - Expansion to OCT scans & additional regional languages.

---

## Slide 9: The Path Ahead - From Prototype to Real-World Impact
- **Phase 1**: Research (Validation, dataset selection, accessibility rules).
- **Phase 2**: AI Model (Model training, patient-aware split, Grad-CAM).
- **Phase 3**: MVP (Frontend + backend + screening pipeline).
- **Phase 4**: Accessibility (Voice interaction, TTS, multilingual support, high contrast).
- **Phase 5**: Testing & Deployment (11/11 pytest test suite, Docker containerization).
- **Tagline & Conclusion**: *"CareLens AI — Detect Earlier. Understand Better. Act Sooner. Making AI-assisted eye-health screening more accessible to everyone."*
- **Thank You & Live Demo Link**: `http://localhost:5173`.
