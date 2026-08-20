import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, Camera, FileImage, AlertCircle, Loader2, Sparkles, CheckCircle2, ArrowRight } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { DisclaimerBanner } from '../components/DisclaimerBanner';
import { QualityBadge } from '../components/QualityBadge';

export const Screening = () => {
  const { t } = useAccessibility();
  const navigate = useNavigate();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [qualityResult, setQualityResult] = useState(null);
  const fileInputRef = useRef(null);

  const handleFileSelect = (file) => {
    setErrorMessage('');
    setQualityResult(null);

    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage("Please select a valid image file (JPEG, PNG, WEBP).");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSampleSelect = async (sampleName) => {
    setErrorMessage('');
    setQualityResult(null);
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 300;
      canvas.height = 300;
      const ctx = canvas.getContext('2d');
      
      ctx.fillStyle = '#110502';
      ctx.fillRect(0, 0, 300, 300);
      
      ctx.beginPath();
      ctx.arc(150, 150, 130, 0, 2 * Math.PI);
      ctx.fillStyle = sampleName === 'cataract' ? '#b85835' : '#d4491c';
      ctx.fill();

      ctx.beginPath();
      ctx.arc(100, 150, sampleName === 'glaucoma' ? 36 : 26, 0, 2 * Math.PI);
      ctx.fillStyle = sampleName === 'glaucoma' ? '#fff0b8' : '#ffdf91';
      ctx.fill();

      ctx.strokeStyle = '#7a1905';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(100, 150);
      ctx.quadraticCurveTo(150, 80, 220, 50);
      ctx.moveTo(100, 150);
      ctx.quadraticCurveTo(160, 220, 230, 240);
      ctx.stroke();

      if (sampleName === 'dr') {
        ctx.fillStyle = '#ff2b2b';
        ctx.beginPath();
        ctx.arc(180, 120, 5, 0, 2 * Math.PI);
        ctx.arc(200, 170, 6, 0, 2 * Math.PI);
        ctx.fill();
      }

      canvas.toBlob((blob) => {
        const file = new File([blob], `sample_${sampleName}.jpg`, { type: 'image/jpeg' });
        handleFileSelect(file);
      }, 'image/jpeg');

    } catch (e) {
      setErrorMessage("Could not load sample image.");
    }
  };

  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setIsAnalyzing(true);
    setErrorMessage('');

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/screen', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.detail || "Something went wrong while analyzing the image. Please try again.");
      }

      const data = await response.json();

      if (data.is_ungradable) {
        setQualityResult(data.quality_check);
        setIsAnalyzing(false);
        return;
      }

      navigate('/results', { state: { resultData: data, previewUrl } });

    } catch (err) {
      setErrorMessage(err.message || "Server error occurred. Please check connection and try again.");
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
      
      <DisclaimerBanner />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-10">
        
        {/* Field Deployment Badge Indicator */}
        <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-2.5 mb-6 text-xs text-emerald-900 shadow-sm">
          <div className="flex items-center space-x-2 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{t('fieldDeploymentMode')}</span>
          </div>
          <span className="text-[11px] bg-emerald-200/80 text-emerald-950 font-mono px-2 py-0.5 rounded font-bold">
            {t('zeroCloudLatency')}
          </span>
        </div>

        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 bg-sky-100 text-sky-800 text-xs font-semibold px-3 py-1 rounded-full mb-3">
            <Sparkles className="w-3.5 h-3.5 text-sky-600" />
            <span>{t('uploadBadge')}</span>
          </div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-slate-900 mb-2">
            {t('uploadTitle')}
          </h1>
          <p className="text-sm sm:text-base text-slate-600">
            {t('uploadSubtitle')}
          </p>
        </div>

        {/* Dropzone Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl mb-8">
          
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-sky-300 hover:border-sky-500 bg-sky-50/50 hover:bg-sky-50 rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all focus:outline-none focus:ring-4 focus:ring-sky-200"
            tabIndex={0}
            role="button"
            aria-label="Upload Retinal Image Dropzone"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={(e) => handleFileSelect(e.target.files[0])}
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="hidden"
            />

            {previewUrl ? (
              <div className="max-w-xs mx-auto">
                <img
                  src={previewUrl}
                  alt="Retinal image preview"
                  className="w-48 h-48 object-cover rounded-2xl mx-auto shadow-md border-2 border-sky-400 mb-3"
                />
                <p className="text-xs font-medium text-slate-600 truncate">{selectedFile?.name}</p>
                <span className="text-xs text-sky-600 font-semibold underline mt-1 block">Click to change image</span>
              </div>
            ) : (
              <div>
                <div className="w-16 h-16 rounded-2xl bg-sky-600/10 text-sky-600 mx-auto flex items-center justify-center mb-4">
                  <Upload className="w-8 h-8" />
                </div>
                <h3 className="font-display font-bold text-lg text-slate-900 mb-1">
                  {t('dragDropText')}
                </h3>
                <p className="text-xs text-slate-500 mb-4">
                  {t('orSelectFile')}
                </p>
                <span className="inline-block bg-white text-slate-600 text-xs font-medium px-3.5 py-1.5 rounded-lg border border-slate-200 shadow-sm">
                  {t('supportedFormats')}
                </span>
              </div>
            )}
          </div>

          {/* 1-Click Sample Image Quick Options */}
          <div className="mt-6 pt-6 border-t border-slate-100">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                {t('sampleScansTitle')}
              </span>
              <span className="text-[10px] text-sky-600 font-semibold">{t('testInstantly')}</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSampleSelect('normal')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-200 text-left flex items-center space-x-2"
              >
                <span>👁️</span>
                <span>{t('sampleNormal')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleSelect('dr')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-200 text-left flex items-center space-x-2"
              >
                <span>🩸</span>
                <span>{t('sampleDiabetic')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleSelect('glaucoma')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-200 text-left flex items-center space-x-2"
              >
                <span>⭕</span>
                <span>{t('sampleGlaucoma')}</span>
              </button>
              <button
                type="button"
                onClick={() => handleSampleSelect('cataract')}
                className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold rounded-xl transition-colors border border-slate-200 text-left flex items-center space-x-2"
              >
                <span>☁️</span>
                <span>{t('sampleCataract')}</span>
              </button>
            </div>
          </div>

        </div>

        {/* Quality Check Ungradable Warning Badge */}
        {qualityResult && (
          <div className="mb-6">
            <QualityBadge
              isValid={qualityResult.is_valid}
              isUngradable={qualityResult.is_ungradable}
              message={qualityResult.user_message}
            />
          </div>
        )}

        {/* Error Notification */}
        {errorMessage && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-800 rounded-xl p-4 flex items-start space-x-3 text-sm">
            <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p>{errorMessage}</p>
          </div>
        )}

        {/* Submit Action Button */}
        <button
          onClick={handleAnalyze}
          disabled={!selectedFile || isAnalyzing}
          className={`w-full py-4 rounded-xl font-bold text-base shadow-lg transition-all flex items-center justify-center space-x-2.5 focus:ring-4 ${
            !selectedFile || isAnalyzing
              ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
              : 'bg-sky-600 hover:bg-sky-500 text-white shadow-sky-600/30 focus:ring-sky-300'
          }`}
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-white" />
              <span>{t('analyzingState')}</span>
            </>
          ) : (
            <>
              <span>{t('analyzeButton')}</span>
              <ArrowRight className="w-5 h-5" />
            </>
          )}
        </button>

      </div>
    </div>
  );
};
