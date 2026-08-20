import React, { createContext, useContext, useState, useEffect } from 'react';
import { translations } from '../i18n/translations';

const AccessibilityContext = createContext();

export const AccessibilityProvider = ({ children }) => {
  const [highContrast, setHighContrast] = useState(false);
  const [fontScale, setFontScale] = useState('normal'); // 'normal', 'large', 'xlarge'
  const [language, setLanguage] = useState('en');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [voiceModeActive, setVoiceModeActive] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);

  useEffect(() => {
    // Check SpeechSynthesis availability
    if (!('speechSynthesis' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  // Update HTML class for High Contrast
  useEffect(() => {
    if (highContrast) {
      document.documentElement.classList.add('high-contrast');
    } else {
      document.documentElement.classList.remove('high-contrast');
    }
  }, [highContrast]);

  // Update root CSS variable for Font Scaling
  useEffect(() => {
    let scaleVal = '1';
    if (fontScale === 'large') scaleVal = '1.18';
    if (fontScale === 'xlarge') scaleVal = '1.32';
    document.documentElement.style.setProperty('--font-scale', scaleVal);
  }, [fontScale]);

  // Translation helper function
  const t = (key) => {
    const langDict = translations[language] || translations['en'];
    return langDict[key] || translations['en'][key] || key;
  };

  // Text-to-Speech playback
  const speakText = (text) => {
    if (!('speechSynthesis' in window)) {
      alert("Text-to-speech audio interaction is not supported in this browser. Please use text display.");
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    
    if (language === 'hi') utterance.lang = 'hi-IN';
    else if (language === 'pa') utterance.lang = 'pa-IN';
    else utterance.lang = 'en-US';

    utterance.rate = 0.95; // Slightly clearer pace for medical text

    utterance.onstart = () => setIsSpeaking(true);
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
  };

  const toggleHighContrast = () => setHighContrast(prev => !prev);
  const toggleVoiceMode = () => setVoiceModeActive(prev => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        setHighContrast,
        toggleHighContrast,
        fontScale,
        setFontScale,
        language,
        setLanguage,
        isSpeaking,
        speakText,
        stopSpeaking,
        voiceModeActive,
        setVoiceModeActive,
        toggleVoiceMode,
        speechSupported,
        t
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
