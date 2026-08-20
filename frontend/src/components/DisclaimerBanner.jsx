import React from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const DisclaimerBanner = () => {
  const { t } = useAccessibility();

  return (
    <div className="bg-amber-50 border-y border-amber-200 py-3.5 px-4" role="region" aria-label="Medical Disclaimer Notice">
      <div className="max-w-7xl mx-auto flex items-start space-x-3 text-amber-900 text-xs sm:text-sm">
        <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold uppercase tracking-wider block text-amber-950 mb-0.5">
            {t('medicalDisclaimerTitle')}:
          </span>
          <p className="leading-relaxed">
            {t('medicalDisclaimerText')}
          </p>
        </div>
      </div>
    </div>
  );
};
