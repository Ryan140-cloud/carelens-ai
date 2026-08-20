# CareLens AI - Accessibility Architecture & Design System

Accessibility is a **CORE PRODUCT FEATURE** in CareLens AI, designed to serve users with diverse vision, hearing, motor, and cognitive needs.

---

## Key Accessibility Features

### 1. Voice Interaction (Speech-to-Text & Text-to-Speech)
- Powered by the browser's native `SpeechRecognition` and `SpeechSynthesis` APIs.
- Users can ask questions like *"What does my result mean?"* or *"Explain glaucoma"*.
- Graceful Fallback: If browser permissions are denied or unsupported, a clear notification is displayed:
  > *"Voice interaction is not supported in this browser. You can use text-based interaction."*

### 2. High Contrast Theme Mode
- Toggled via the navigation bar or Accessibility Center.
- Overrides element background colors to `#000000` / `#121212`, applies high-contrast `#ffff00` borders, and enhances text contrast ratio beyond WCAG AAA standards.

### 3. Font Scaling
- Supports Normal (1.0x), Large (1.18x), and Extra Large (1.32x) font scaling via root CSS variable `--font-scale`.

### 4. Keyboard & Screen Reader Navigation
- Focus outline (`outline: 3px solid #0284c7`) active across all interactive elements.
- Accessible ARIA labels (`aria-label`, `role="region"`, `role="banner"`, `aria-hidden`) implemented throughout HTML layout.

### 5. Multilingual Interface
- i18n translation system supporting **English (EN)**, **Hindi (HI)**, and **Punjabi (PA)** across navigation, screening instructions, result summaries, disclaimers, and guidance.
