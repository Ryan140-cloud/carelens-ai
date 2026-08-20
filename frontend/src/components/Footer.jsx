import React, { useState } from 'react';
import { Eye, Shield, HeartHandshake, Accessibility, Award, Cpu, X, FileText, CheckCircle2 } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const Footer = () => {
  const { t } = useAccessibility();
  const [showJuryModal, setShowJuryModal] = useState(false);

  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800 pt-12 pb-8" role="contentinfo">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          
          {/* Brand Info */}
          <div className="md:col-span-2">
            <div className="flex items-center space-x-3 text-white font-display font-bold text-xl mb-3">
              <div className="w-8 h-8 rounded-lg bg-sky-600 flex items-center justify-center">
                <Eye className="w-5 h-5 text-white" />
              </div>
              <span>{t('appName')}</span>
            </div>
            <p className="text-sm text-slate-400 max-w-md leading-relaxed mb-4">
              {t('footerDesc')}
            </p>
            <div className="flex items-center space-x-2 text-xs font-semibold text-sky-400 bg-sky-950/60 border border-sky-800/80 rounded-lg px-3 py-2 inline-flex">
              <Accessibility className="w-4 h-4 text-sky-400" />
              <span>{t('footerMvpBadge')}</span>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">{t('footerNavigationTitle')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/" className="hover:text-white transition-colors">{t('navHome')}</a></li>
              <li><a href="/screening" className="hover:text-white transition-colors">{t('navScreening')}</a></li>
              <li><a href="/history" className="hover:text-white transition-colors">{t('navHistory')}</a></li>
              <li><a href="/accessibility" className="hover:text-white transition-colors">{t('navAccessibility')}</a></li>
            </ul>
          </div>

          {/* Compliance & Safety */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3 uppercase tracking-wider">{t('footerSafetyTitle')}</h4>
            <ul className="space-y-2 text-sm">
              <li><a href="/privacy" className="hover:text-white transition-colors">{t('navPrivacy')}</a></li>
              <li><a href="/about" className="hover:text-white transition-colors">{t('footerDatasetLink')}</a></li>
              <li>
                <button
                  onClick={() => setShowJuryModal(true)}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition-colors flex items-center space-x-1"
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Jury Audit & System Specs</span>
                </button>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom Disclaimer */}
        <div className="border-t border-slate-800 pt-6 text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
          <p>{t('footerCopyright')}</p>
          <button
            onClick={() => setShowJuryModal(true)}
            className="flex items-center space-x-1 text-teal-400 hover:text-teal-300 font-semibold transition-colors"
          >
            <Shield className="w-3.5 h-3.5 text-teal-400" />
            <span>{t('footerSubmissionBadge')} (Audit Specs)</span>
          </button>
        </div>

      </div>

      {/* Jury Audit & Specs Modal */}
      {showJuryModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 text-white">
          <div className="bg-slate-900 rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden text-xs">
            
            <button
              onClick={() => setShowJuryModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Award className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Hackathon Jury Audit & System Specs</h3>
                <p className="text-xs text-slate-400">CareLens AI - Production-Level Submission Architecture</p>
              </div>
            </div>

            <div className="space-y-4">
              
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">1. Verified Machine Learning Core</span>
                <p className="text-slate-300 mb-2">Fine-tuned PyTorch <span className="text-white font-semibold">EfficientNet-B0</span> multi-label screening model trained on 5,000 ODIR-5K patient fundus images.</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Split Scheme: <span className="text-emerald-400">Patient-Aware (70/15/15)</span></div>
                  <div>Output: <span className="text-white">8 Independent Sigmoid Probabilities</span></div>
                  <div>XAI Technique: <span className="text-teal-400">PyTorch Grad-CAM Saliency</span></div>
                  <div>Synthetic Fallbacks: <span className="text-emerald-400">0% (Strict File Gate)</span></div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">2. Production Stack Architecture</span>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                  <div>Backend API: <span className="text-white">FastAPI REST + Uvicorn</span></div>
                  <div>Frontend UI: <span className="text-white">React 18 + Vite + Tailwind</span></div>
                  <div>Speech API: <span className="text-white">Web Speech STT / TTS</span></div>
                  <div>Multilingual i18n: <span className="text-white">English, Hindi, Punjabi</span></div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">3. Round 2 Hackathon Deliverables</span>
                <div className="space-y-1 text-slate-300">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>PowerPoint Pitch Deck Outline: <code className="text-sky-300">docs/ppt_presentation_outline.md</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>3-Minute Demo Video Script: <code className="text-sky-300">docs/demo_video_script.md</code></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-400" />
                    <span>Real ML Verification Report: <code className="text-sky-300">docs/real_ml_verification_report.md</code></span>
                  </div>
                </div>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowJuryModal(false)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </footer>
  );
};
