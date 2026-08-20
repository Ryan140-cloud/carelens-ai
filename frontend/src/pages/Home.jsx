import React from 'react';
import { Link } from 'react-router-dom';
import { Eye, ShieldCheck, Volume2, Globe, Layers, ArrowRight, CheckCircle, AlertTriangle, Sparkles } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const Home = () => {
  const { t, toggleVoiceMode } = useAccessibility();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      
      <DisclaimerBanner />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-28 border-b border-slate-200 bg-gradient-to-b from-sky-50/60 via-white to-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            
            <div className="inline-flex items-center space-x-2 bg-sky-100/80 border border-sky-200 text-sky-800 text-xs font-semibold px-3.5 py-1.5 rounded-full mb-6 shadow-sm">
              <Sparkles className="w-4 h-4 text-sky-600" />
              <span>AI-Assisted Early Eye Screening & Decision Support</span>
            </div>

            <h1 className="font-display font-extrabold text-4xl sm:text-5xl lg:text-6xl tracking-tight text-slate-900 leading-tight mb-6">
              CareLens <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-600 to-teal-500">AI</span>
            </h1>

            <p className="font-display font-bold text-xl sm:text-2xl text-sky-900 mb-4">
              “{t('tagline')}”
            </p>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed mb-8">
              {t('subtitle')}
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/screening"
                className="w-full sm:w-auto px-8 py-4 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-base rounded-xl shadow-lg shadow-sky-600/25 hover:shadow-sky-600/35 transition-all flex items-center justify-center space-x-2 focus:ring-4 focus:ring-sky-300"
              >
                <span>{t('startScreening')}</span>
                <ArrowRight className="w-5 h-5" />
              </Link>

              <Link
                to="/accessibility"
                className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-semibold text-base rounded-xl border border-slate-300 shadow-sm transition-all flex items-center justify-center space-x-2 focus:ring-4 focus:ring-slate-200"
              >
                <span>{t('accessibilityMode')}</span>
              </Link>
            </div>

            {/* Medical Position Tag */}
            <div className="mt-8 text-xs text-slate-500 flex items-center justify-center space-x-1.5">
              <ShieldCheck className="w-4 h-4 text-teal-600" />
              <span>Preliminary Screening Tool • Requires Clinical Evaluation</span>
            </div>

          </div>
        </div>
      </section>

      {/* Core Workflow Pillars */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="font-display font-bold text-2xl sm:text-3xl text-slate-900 mb-3">
              Screening Workflow & Features
            </h2>
            <p className="text-slate-600 text-sm sm:text-base">
              Designed from the ground up for medical safety, explainability, and multi-accessible communication.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Feature 1 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center mb-4">
                <Eye className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                1. AI Screening Model
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Multi-label classification trained on verified benchmark retinal fundus images with pre-prediction image quality validation.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center mb-4">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                2. Explainable Grad-CAM
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Generates visual heatmap overlays showing spatial region influences, paired with simple patient-friendly descriptions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
              <div className="w-12 h-12 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6" />
              </div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-2">
                3. Accessibility-First Design
              </h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Voice interaction, Text-to-Speech audio, high contrast mode, text scaling, and multilingual support in English, Hindi, and Punjabi.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* Safety Positioning Callout */}
      <section className="py-14 bg-slate-900 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="w-12 h-12 rounded-full bg-amber-500/20 text-amber-400 mx-auto flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <h2 className="font-display font-bold text-2xl sm:text-3xl mb-4">
            Responsible Healthcare Positioning
          </h2>
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed mb-6">
            CareLens AI does <strong className="text-amber-400">NOT</strong> diagnose patients, replace an ophthalmologist, or prescribe medication. It provides preliminary decision support to help individuals and healthcare workers act sooner.
          </p>
          <div className="inline-flex items-center space-x-2 text-xs font-semibold bg-slate-800 px-4 py-2 rounded-xl border border-slate-700">
            <span>Always consult a qualified eye care professional for medical evaluation.</span>
          </div>
        </div>
      </section>

    </div>
  );
};
