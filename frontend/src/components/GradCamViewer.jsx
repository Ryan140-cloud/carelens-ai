import React, { useState } from 'react';
import { Eye, Layers, Info, Sliders } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const GradCamViewer = ({ originalImageSrc, gradcamDataUrl, conditionName }) => {
  const { t } = useAccessibility();
  const [activeMode, setActiveMode] = useState('overlay'); // 'overlay', 'side_by_side'
  const [heatmapOpacity, setHeatmapOpacity] = useState(85); // 0 to 100%

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-5 border border-slate-800 shadow-xl" role="region" aria-label="Explainable AI Visual Heatmap">
      
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-slate-800 pb-4 mb-4">
        <div>
          <h3 className="font-display font-bold text-base flex items-center space-x-2">
            <Layers className="w-5 h-5 text-sky-400" />
            <span>{t('gradcamTitle')}</span>
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {t('gradcamSubtitle')}
          </p>
        </div>

        <div className="flex items-center space-x-1 bg-slate-800 p-1 rounded-lg self-start md:self-auto">
          <button
            onClick={() => setActiveMode('overlay')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeMode === 'overlay' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('overlayMode')}
          </button>
          <button
            onClick={() => setActiveMode('side_by_side')}
            className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors ${
              activeMode === 'side_by_side' ? 'bg-sky-600 text-white shadow' : 'text-slate-400 hover:text-white'
            }`}
          >
            {t('sideBySideMode')}
          </button>
        </div>
      </div>

      {/* Opacity Blend Slider Control (Active in Overlay Mode) */}
      {activeMode === 'overlay' && gradcamDataUrl && (
        <div className="flex items-center justify-between bg-slate-800/80 rounded-xl px-4 py-2.5 mb-4 border border-slate-700/80 text-xs">
          <div className="flex items-center space-x-2 text-slate-300 font-semibold">
            <Sliders className="w-4 h-4 text-sky-400" />
            <span>{t('opacityLabel')}</span>
            <span className="text-sky-400 font-mono font-bold">{heatmapOpacity}%</span>
          </div>
          <div className="flex items-center space-x-3 w-1/2 sm:w-72">
            <span className="text-[10px] text-slate-400">{t('originalText')}</span>
            <input
              type="range"
              min="0"
              max="100"
              value={heatmapOpacity}
              onChange={(e) => setHeatmapOpacity(Number(e.target.value))}
              className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-sky-400"
              aria-label="Heatmap Blend Opacity Slider"
            />
            <span className="text-[10px] text-sky-400 font-semibold">{t('heatmapText')}</span>
          </div>
        </div>
      )}

      {/* Viewport */}
      {activeMode === 'overlay' ? (
        <div className="relative aspect-video max-h-80 mx-auto rounded-xl overflow-hidden bg-black flex items-center justify-center border border-slate-700">
          <img
            src={originalImageSrc}
            alt="Original uploaded retinal fundus scan"
            className="absolute inset-0 w-full h-full object-contain"
          />
          {gradcamDataUrl && (
            <img
              src={gradcamDataUrl}
              alt="Grad-CAM activation heatmap overlay"
              className="absolute inset-0 w-full h-full object-contain transition-opacity duration-150"
              style={{ opacity: heatmapOpacity / 100 }}
            />
          )}
          <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-700 text-xs font-medium text-slate-200">
            Target Region Activation Layer ({conditionName || 'Primary Finding'})
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-xl overflow-hidden bg-black border border-slate-700 p-2">
            <span className="text-xs text-slate-400 font-semibold block mb-2 px-1">{t('originalScan')}</span>
            <img
              src={originalImageSrc}
              alt="Original uploaded retinal fundus scan"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
          <div className="rounded-xl overflow-hidden bg-black border border-slate-700 p-2">
            <span className="text-xs text-sky-400 font-semibold block mb-2 px-1">{t('saliencyMap')}</span>
            <img
              src={gradcamDataUrl || originalImageSrc}
              alt="Grad-CAM activation heatmap visualization"
              className="w-full aspect-square object-cover rounded-lg"
            />
          </div>
        </div>
      )}

      {/* Mandatory Interpretability Disclaimer */}
      <div className="mt-4 bg-slate-800/80 rounded-xl p-3.5 border border-slate-700/80 text-xs text-slate-300 flex items-start space-x-2.5">
        <Info className="w-4 h-4 text-sky-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          The highlighted regions show areas that influenced the AI model's prediction. This visualization is provided for model interpretability and is not a clinical diagnosis.
        </p>
      </div>

    </div>
  );
};
