import React from 'react';
import { Volume2, Sun, Type, Globe, Keyboard, ShieldAlert, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const AccessibilityCenter = () => {
  const { 
    highContrast, 
    toggleHighContrast, 
    fontScale, 
    setFontScale, 
    language, 
    setLanguage, 
    voiceModeActive, 
    toggleVoiceMode,
    t 
  } = useAccessibility();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-10">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-teal-100 text-teal-800 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-3">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>{t('accBadge')}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-2">
            {t('navAccessibility')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto">
            {t('accHeaderDesc')}
          </p>
        </div>

        {/* Accessibility Control Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
          
          {/* Voice Mode & STT/TTS */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">{t('accVoiceTitle')}</h3>
                <span className="text-xs text-slate-500">{t('accVoiceSub')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {t('accVoiceDesc')}
            </p>

            <button
              onClick={toggleVoiceMode}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center space-x-2 ${
                voiceModeActive 
                  ? 'bg-teal-600 text-white shadow-lg shadow-teal-600/25' 
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
            >
              <span>{voiceModeActive ? t('accVoiceActiveBtn') : t('accVoiceEnableBtn')}</span>
            </button>
          </div>

          {/* High Contrast Theme */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-amber-600/10 text-amber-600 flex items-center justify-center">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">{t('accContrastTitle')}</h3>
                <span className="text-xs text-slate-500">{t('accContrastSub')}</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 mb-4 leading-relaxed">
              {t('accContrastDesc')}
            </p>

            <button
              onClick={toggleHighContrast}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all border ${
                highContrast 
                  ? 'bg-sky-600 text-white border-sky-400 shadow-md' 
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800 border-slate-300'
              }`}
            >
              <span>{highContrast ? t('accContrastActiveBtn') : t('accContrastEnableBtn')}</span>
            </button>
          </div>

          {/* Font Size Scaler */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">{t('accFontTitle')}</h3>
                <span className="text-xs text-slate-500">{t('accFontSub')}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { scale: 'normal', labelKey: 'normalFont' },
                { scale: 'large', labelKey: 'largeFont' },
                { scale: 'xlarge', labelKey: 'xlargeFont' }
              ].map((item) => (
                <button
                  key={item.scale}
                  onClick={() => setFontScale(item.scale)}
                  className={`py-2.5 rounded-xl text-xs font-bold capitalize transition-all border ${
                    fontScale === item.scale 
                      ? 'bg-sky-600 text-white border-sky-600 shadow' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {t(item.labelKey)}
                </button>
              ))}
            </div>
          </div>

          {/* Multilingual Selector */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-md">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center">
                <Globe className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-display font-bold text-base text-slate-900">{t('accLangTitle')}</h3>
                <span className="text-xs text-slate-500">{t('accLangSub')}</span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              {[
                { code: 'en', label: 'English' },
                { code: 'hi', label: 'हिन्दी' },
                { code: 'pa', label: 'ਪੰਜਾਬੀ' }
              ].map((item) => (
                <button
                  key={item.code}
                  onClick={() => setLanguage(item.code)}
                  className={`py-2.5 rounded-xl text-xs font-bold transition-all border ${
                    language === item.code 
                      ? 'bg-indigo-600 text-white border-indigo-600 shadow' 
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Keyboard Navigation Notice */}
        <div className="bg-slate-900 text-white rounded-3xl p-6 shadow-xl border border-slate-800">
          <div className="flex items-start space-x-3">
            <Keyboard className="w-6 h-6 text-sky-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-display font-bold text-base mb-1">{t('accKeyboardTitle')}</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                {t('keyboardNavGuide')}
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
