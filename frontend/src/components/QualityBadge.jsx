import React from 'react';
import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

export const QualityBadge = ({ isValid, isUngradable, message }) => {
  if (isUngradable) {
    return (
      <div className="bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-xs sm:text-sm">
        <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <div>
          <span className="font-bold text-red-950 block mb-0.5">Ungradable Image Quality</span>
          <p>{message}</p>
        </div>
      </div>
    );
  }

  if (isValid) {
    return (
      <div className="bg-teal-50 border border-teal-200 text-teal-900 rounded-xl p-3.5 flex items-center space-x-3 text-xs sm:text-sm">
        <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" aria-hidden="true" />
        <span className="font-medium">{message || "Image quality verified suitable for preliminary AI screening."}</span>
      </div>
    );
  }

  return null;
};
