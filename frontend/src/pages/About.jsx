import React from 'react';
import { Eye, Database, Layers, ShieldCheck, Award, FileText } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useAccessibility } from '../context/AccessibilityContext';

export const About = () => {
  const { t } = useAccessibility();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <DisclaimerBanner />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-3">
            {t('aboutTitle')}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('aboutSubtitle')}
          </p>
        </div>

        {/* Dataset Verification Section */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">{t('aboutDatasetTitle')}</h2>
              <span className="text-xs text-slate-500 font-medium">{t('aboutDatasetBenchmark')}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-4">
            {t('aboutDatasetDesc')}
          </p>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-semibold text-slate-700 mb-4">
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">N: Normal</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">D: Diabetes</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">G: Glaucoma</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">C: Cataract</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">A: AMD</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">H: Hypertension</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">M: Myopia</div>
            <div className="bg-slate-100 p-2.5 rounded-xl text-center">O: Other Abnormality</div>
          </div>

          <p className="text-xs text-slate-500 italic">
            {t('aboutPatientSplitNote')}
          </p>
        </div>

        {/* Model & XAI Architecture */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-slate-900">{t('aboutXaiTitle')}</h2>
              <span className="text-xs text-slate-500 font-medium">{t('aboutXaiSub')}</span>
            </div>
          </div>

          <p className="text-sm text-slate-600 leading-relaxed mb-3">
            {t('aboutXaiDesc1')}
          </p>

          <p className="text-sm text-slate-600 leading-relaxed">
            {t('aboutXaiDesc2')}
          </p>
        </div>

      </div>
    </div>
  );
};
