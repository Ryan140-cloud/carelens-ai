# CareLens AI - 3-Minute Hackathon Demo Video Script

**Target Duration**: 3:00 Minutes  
**Video Resolution**: 1080p 60fps  
**Audio**: Clear voiceover + ambient background music (low volume)

---

## Timeline & Scene Breakdown

### [0:00 - 0:30] Scene 1: The Problem & Introduction
- **Visual**: Show statistics on preventable vision loss followed by the CareLens AI Landing Page (`http://localhost:5173`).
- **Voiceover**:
  > "Over 2 billion people worldwide suffer from vision impairment, yet millions of cases of diabetic retinopathy, glaucoma, and cataracts could be prevented with early screening. However, specialized eye clinics are scarce in rural areas, traditional AI tools produce confusing technical jargon, and most digital health apps ignore accessibility. Introducing **CareLens AI**—an AI-assisted early eye-health screening platform built with accessibility-first healthcare guidance."

---

### [0:30 - 1:15] Scene 2: Upload, Image Quality Validation & AI Analysis
- **Visual**: Navigate to the **Screening Page**. Drag & drop a retinal fundus image. Click **Analyze Image**.
- **Voiceover**:
  > "A user or health worker simply uploads a retinal fundus scan. Before making any prediction, CareLens AI executes an automated Image Quality Validation check to inspect resolution, blur variance, illumination, and fundus tissue features. If an image is blurred or non-fundus, prediction is safely blocked. Once validated, our multi-label PyTorch EfficientNet model screens the scan across 8 target conditions simultaneously."

---

### [1:15 - 2:00] Scene 3: Results, Explainable Grad-CAM & Audio Playback
- **Visual**: The **Results Page** renders. Show the Screening Risk Badge, Confidence indicator (84.5%), Grad-CAM Visual Heatmap toggle, Patient-Friendly summary, and click **"Listen to Result"**.
- **Voiceover**:
  > "Instead of returning raw numbers, CareLens AI generates an explainable Grad-CAM visual heatmap highlighting the exact spatial regions influencing the model. It then converts technical findings into plain, patient-understandable language paired with recommended next steps. Users can click 'Listen to Result' to hear the guidance read aloud via Text-to-Speech audio, or click 'Export PDF Report' to generate a print-ready clinical summary for their doctor."

---

### [2:00 - 2:35] Scene 4: Accessibility Center & Multilingual Voice Assistant
- **Visual**: Navigate to **Accessibility Center**. Demonstrate High Contrast Mode toggle, Text Sizing, Multilingual translation (switch to Hindi & Punjabi), and open the **Voice Assistant**.
- **Voiceover**:
  > "Accessibility is a core feature, not an add-on. CareLens AI features a WCAG AAA High Contrast mode, dynamic font scaling, full keyboard navigation, and instant translation across English, Hindi, and Punjabi. Users can also speak directly to the CareLens Voice Assistant to ask questions hands-free."

---

### [2:35 - 3:00] Scene 5: Medical Safety Positioning & Conclusion
- **Visual**: Show the Medical Safety Disclaimer banner, Screening History log, and return to the Hero CTA.
- **Voiceover**:
  > "Crucially, CareLens AI strictly operates as a preliminary decision-support tool. It never diagnoses patients or replaces doctors, always guiding users to seek professional evaluation. Most AI tools stop at raw prediction; CareLens AI completes the journey—from early screening to explainable heatmaps, accessible communication, and professional follow-up. Thank you."
