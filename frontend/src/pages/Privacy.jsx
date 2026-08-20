import React from 'react';
import { Shield, Lock, Eye, CheckCircle } from 'lucide-react';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { useAccessibility } from '../context/AccessibilityContext';

export const Privacy = () => {
  const { t } = useAccessibility();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      <DisclaimerBanner />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        <div className="text-center mb-12">
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-3">
            {t('privacyTitle')}
          </h1>
          <p className="text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            {t('privacySubtitle')}
          </p>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-md space-y-6">
          
          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-teal-600/10 text-teal-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">{t('privacyNoStorageTitle')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('privacyNoStorageDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Shield className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">{t('privacyUserControlTitle')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('privacyUserControlDesc')}
              </p>
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600/10 text-indigo-600 flex items-center justify-center flex-shrink-0 mt-1">
              <Eye className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-display font-bold text-lg text-slate-900 mb-1">{t('privacyDisclaimerTitle')}</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                {t('privacyDisclaimerDesc')}
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
