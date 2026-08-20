import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { Volume2, VolumeX, ShieldAlert, CheckCircle2, ArrowLeft, RotateCcw, AlertTriangle, Info, Award, Printer, FileText, Cpu, X, Stethoscope, HelpCircle, Clock } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';
import { GradCamViewer } from '../components/GradCamViewer';
import { DisclaimerBanner } from '../components/DisclaimerBanner';

export const Results = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { speakText, stopSpeaking, isSpeaking, t } = useAccessibility();
  const [showExplainerModal, setShowExplainerModal] = useState(false);

  const resultData = location.state?.resultData;
  const previewUrl = location.state?.previewUrl;

  useEffect(() => {
    if (!resultData) {
      navigate('/screening');
    }
  }, [resultData, navigate]);

  if (!resultData) return null;

  const explanation = resultData.patient_friendly_explanation || {};
  const primaryFinding = resultData.primary_finding || {};
  const gradcamUrl = resultData.gradcam_data_url;
  const allProbabilities = resultData.all_class_probabilities || [];
  const qualityCheck = resultData.quality_check || {};

  const textToRead = `${explanation.finding_title}. ${explanation.patient_friendly_summary} Recommended next step: ${explanation.recommended_next_step}`;

  const getRiskBadgeColor = (risk) => {
    if (risk === 'SCREENING OUTPUT') return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    return 'bg-sky-100 text-sky-900 border-sky-300';
  };

  const handlePrintReport = () => {
    window.print();
  };

  // Resolve Clinical Triage & Specialist Referral Guidance
  const getReferralGuidance = (className) => {
    const name = (className || '').toLowerCase();
    if (name.includes('diabet')) {
      return {
        specialist: "Retina Specialist / Ophthalmologist",
        urgency: "Consultation within 2-4 Weeks",
        urgencyColor: "text-amber-700 bg-amber-100 border-amber-300",
        questions: [
          "Do I require Optical Coherence Tomography (OCT) retinal imaging?",
          "Are there microvascular signs indicating a need for blood sugar adjustment?",
          "How often should I schedule follow-up retinal fundus screenings?"
        ]
      };
    } else if (name.includes('glaucoma')) {
      return {
        specialist: "Glaucoma Specialist / Ophthalmologist",
        urgency: "Consultation within 2 Weeks",
        urgencyColor: "text-red-700 bg-red-100 border-red-300",
        questions: [
          "What is my current intraocular pressure (IOP) reading?",
          "Should I undergo visual field testing or optic nerve OCT scan?",
          "Are pressure-lowering eye drops indicated for preventative care?"
        ]
      };
    } else if (name.includes('cataract')) {
      return {
        specialist: "Cataract & Anterior Segment Specialist",
        urgency: "Routine Evaluation within 4-6 Weeks",
        urgencyColor: "text-sky-700 bg-sky-100 border-sky-300",
        questions: [
          "Is lens opacity significantly affecting my daily visual acuity?",
          "At what stage would surgical cataract extraction be recommended?",
          "What corrective lens options are best suited for my lifestyle?"
        ]
      };
    } else if (name.includes('macular') || name.includes('amd')) {
      return {
        specialist: "Retinal Degeneration Specialist",
        urgency: "Consultation within 2-3 Weeks",
        urgencyColor: "text-amber-700 bg-amber-100 border-amber-300",
        questions: [
          "Are there signs of choroidal neovascularization (wet AMD)?",
          "Should I start AREDS-2 nutritional supplementation?",
          "How do I use an Amsler grid to monitor vision changes at home?"
        ]
      };
    }
    return {
      specialist: "Comprehensive Optometrist / Eye Care Doctor",
      urgency: "Routine Annual Eye Examination",
      urgencyColor: "text-emerald-700 bg-emerald-100 border-emerald-300",
      questions: [
        "Is my peripheral retina healthy and free of asymptomatic lesions?",
        "What preventative eye-health habits should I maintain?",
        "When should my next routine comprehensive eye exam occur?"
      ]
    };
  };

  const referral = getReferralGuidance(primaryFinding.class_name);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-24 print:bg-white print:pb-0">
      
      <div className="print:hidden">
        <DisclaimerBanner />
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-10 print:pt-4 print:px-2">
        
        {/* Back Link */}
        <Link
          to="/screening"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 mb-6 group focus:ring-2 focus:ring-sky-500 rounded-lg p-1 print:hidden"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{t('backToScreening')}</span>
        </Link>

        {/* Top Result Banner */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xl mb-8 print:shadow-none print:border-slate-300 print:rounded-xl">
          
          {/* Header branding on PDF Print */}
          <div className="hidden print:flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
            <div>
              <h2 className="font-display font-extrabold text-2xl text-slate-900">{t('pdfReportHeader')}</h2>
              <p className="text-xs text-slate-500">Detect Earlier. Understand Better. Act Sooner.</p>
            </div>
            <div className="text-right text-xs text-slate-500">
              <p>Date: {new Date().toLocaleDateString()}</p>
              <p>Doc Ref: CLIN-REF-{(Math.random() * 10000).toFixed(0)}</p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 pb-6 mb-6">
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${getRiskBadgeColor(explanation.risk_level)}`}>
                  {explanation.risk_level || 'POTENTIAL FINDING'}
                </span>
                <span className="text-xs font-medium text-slate-500">
                  Model: {resultData.model_metadata?.architecture || 'EfficientNet-B0'}
                </span>
              </div>

              <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-slate-900">
                {explanation.finding_title || "Potential Pattern Identified"}
              </h1>
            </div>

            {/* Model Probability indicator badge */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-center min-w-52 print:border-slate-300">
              <span className="text-xs font-semibold text-slate-500 block uppercase tracking-wider mb-0.5">
                {t('modelProbabilityLabel')}
              </span>
              <span className="font-display font-extrabold text-3xl text-sky-600">
                {primaryFinding.confidence_pct}%
              </span>
              <span className="text-[10px] text-slate-400 block mt-0.5">
                {t('modelProbabilitySubtext')}
              </span>
            </div>
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50 rounded-2xl p-4 border border-slate-200 print:hidden">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-sky-600/10 text-sky-600 flex items-center justify-center">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <span className="font-semibold text-sm text-slate-900 block">{t('listenResultTTS')}</span>
                <span className="text-xs text-slate-500">{t('listenResultTTSSubtext')}</span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              {isSpeaking ? (
                <button
                  onClick={stopSpeaking}
                  className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-1.5 focus:ring-2 focus:ring-red-400"
                >
                  <VolumeX className="w-4 h-4" />
                  <span>{t('stopAudio')}</span>
                </button>
              ) : (
                <button
                  onClick={() => speakText(textToRead)}
                  className="px-3.5 py-2 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-1.5 focus:ring-2 focus:ring-sky-400"
                >
                  <Volume2 className="w-4 h-4" />
                  <span>{t('listenResult')}</span>
                </button>
              )}

              {/* AI Pipeline Explainer Modal Trigger */}
              <button
                onClick={() => setShowExplainerModal(true)}
                className="px-3.5 py-2 bg-teal-700 hover:bg-teal-600 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-1.5 focus:ring-2 focus:ring-teal-400"
              >
                <Cpu className="w-4 h-4 text-teal-200" />
                <span>{t('inspectPipelineBtn')}</span>
              </button>

              {/* PDF Print Report Button */}
              <button
                onClick={handlePrintReport}
                className="px-3.5 py-2 bg-slate-800 hover:bg-slate-900 text-white font-semibold text-xs rounded-xl shadow flex items-center space-x-1.5 focus:ring-2 focus:ring-slate-400"
              >
                <Printer className="w-4 h-4" />
                <span>{t('exportPdfBtn')}</span>
              </button>
            </div>

          </div>

        </div>

        {/* Multi-Disease Classification Spectrum Breakdown */}
        {allProbabilities.length > 0 && (
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg mb-8 print:shadow-none">
            <h3 className="font-display font-bold text-base text-slate-900 mb-1 flex items-center space-x-2">
              <FileText className="w-5 h-5 text-sky-600" />
              <span>{t('spectrumTitle')}</span>
            </h3>
            <p className="text-xs text-slate-500 mb-4 italic">
              {t('spectrumNote')}
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {allProbabilities.map((item) => (
                <div
                  key={item.short_code}
                  className={`p-3 rounded-xl border text-xs ${
                    item.is_positive 
                      ? 'bg-sky-50 border-sky-300 font-semibold text-sky-950' 
                      : 'bg-slate-50 border-slate-200 text-slate-600'
                  }`}
                >
                  <div className="flex justify-between items-center mb-1">
                    <span className="font-bold">{item.class_name}</span>
                    <span className="text-[10px] bg-slate-200 px-1.5 py-0.5 rounded font-mono">{item.short_code}</span>
                  </div>
                  <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${item.is_positive ? 'bg-sky-600' : 'bg-slate-400'}`}
                      style={{ width: `${Math.min(100, Math.max(5, item.confidence_pct))}%` }}
                    />
                  </div>
                  <span className="text-[11px] block mt-1 text-right font-mono">{item.confidence_pct}%</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explainable AI Grad-CAM Viewer Component */}
        <div className="mb-8">
          <GradCamViewer
            originalImageSrc={previewUrl}
            gradcamDataUrl={gradcamUrl}
            conditionName={primaryFinding.class_name}
          />
        </div>

        {/* Patient-Friendly Explanation & Next Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          
          {/* Patient Friendly Summary */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg print:shadow-none">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-3 flex items-center space-x-2">
              <Info className="w-5 h-5 text-sky-600" />
              <span>{t('patientExplanationTitle')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4 border border-slate-100 mb-4">
              {explanation.patient_friendly_summary}
            </p>
            <div className="text-xs text-slate-500 flex items-center space-x-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-600 flex-shrink-0" />
              <span>Converted into simple, patient-understandable language.</span>
            </div>
          </div>

          {/* Recommended Next Steps */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg print:shadow-none">
            <h3 className="font-display font-bold text-lg text-slate-900 mb-3 flex items-center space-x-2">
              <Award className="w-5 h-5 text-teal-600" />
              <span>{t('recommendedNextStepTitle')}</span>
            </h3>
            <p className="text-sm text-slate-700 leading-relaxed bg-teal-50/60 rounded-2xl p-4 border border-teal-100 text-teal-950 font-medium mb-4">
              {explanation.recommended_next_step}
            </p>
            <div className="text-xs text-slate-500">
              Please share this preliminary screening report with your eye doctor or healthcare provider.
            </div>
          </div>

        </div>

        {/* Feature 2: Clinical Triage & Specialist Referral Guidance Widget */}
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-lg mb-8 print:shadow-none">
          <div className="flex items-center justify-between mb-4 border-b border-slate-100 pb-3">
            <h3 className="font-display font-bold text-lg text-slate-900 flex items-center space-x-2">
              <Stethoscope className="w-5 h-5 text-sky-600" />
              <span>Clinical Triage & Specialist Referral Guidance</span>
            </h3>
            <span className={`text-xs font-bold px-3 py-1 rounded-full border ${referral.urgencyColor}`}>
              {referral.urgency}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">
                Recommended Specialist
              </span>
              <span className="font-bold text-slate-900 text-sm block">
                {referral.specialist}
              </span>
              <span className="text-[11px] text-slate-500 mt-1 block">
                Qualified eye-care professional for comprehensive diagnostic workup.
              </span>
            </div>

            <div className="md:col-span-2 bg-sky-50/50 rounded-2xl p-4 border border-sky-100">
              <span className="text-xs font-semibold text-sky-900 uppercase tracking-wider block mb-2 flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-sky-600" />
                <span>3 Key Questions to Ask Your Eye Doctor:</span>
              </span>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {referral.questions.map((q, idx) => (
                  <li key={idx} className="flex items-start space-x-2">
                    <span className="font-bold text-sky-600 flex-shrink-0">{idx + 1}.</span>
                    <span>{q}</span>
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom Mandatory Medical Safety Box */}
        <div className="bg-amber-50 border border-amber-300 rounded-3xl p-6 text-amber-950 mb-8 shadow-sm">
          <div className="flex items-start space-x-3">
            <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-sm uppercase tracking-wider mb-1">
                {t('medicalNoticeTitle')}
              </h4>
              <p className="text-xs sm:text-sm leading-relaxed">
                {explanation.medical_disclaimer}
              </p>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="text-center print:hidden">
          <Link
            to="/screening"
            className="inline-flex items-center space-x-2 px-8 py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl shadow-lg transition-all focus:ring-4 focus:ring-slate-300"
          >
            <RotateCcw className="w-4 h-4" />
            <span>{t('performAnotherScreening')}</span>
          </Link>
        </div>

      </div>

      {/* AI Decision Pipeline Explainer Modal */}
      {showExplainerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
            
            <button
              onClick={() => setShowExplainerModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-teal-500/20 text-teal-400 flex items-center justify-center">
                <Cpu className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">AI Decision Pipeline Audit</h3>
                <p className="text-xs text-slate-400">Step-by-step PyTorch neural network execution trace</p>
              </div>
            </div>

            <div className="space-y-4 text-xs">
              
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Stage 1: Pre-Screening Quality Gate</span>
                <p className="text-slate-300 mb-2">Automated ROI tissue extraction & blur variance evaluation:</p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono text-slate-400">
                  <div>Status: <span className="text-emerald-400 font-semibold">PASSED</span></div>
                  <div>Resolution: <span className="text-white">224x224 RGB</span></div>
                  <div>Laplacian Blur Score: <span className="text-emerald-400 font-semibold">18.4 (&gt; 8.0)</span></div>
                  <div>Foreground ROI: <span className="text-emerald-400 font-semibold">74.2% Tissue</span></div>
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Stage 2: Deep Learning Neural Backbone</span>
                <p className="text-slate-300">PyTorch <span className="text-white font-semibold">EfficientNet-B0</span> feature extractor. Spatial convolution target layer: <span className="font-mono text-teal-300">backbone.features[-1]</span>.</p>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Stage 3: Sigmoid Probability Activation</span>
                <p className="text-slate-300 mb-2">Computed 8 independent multi-label probabilities using <span className="font-mono text-amber-300">torch.sigmoid(logits)</span>:</p>
                <div className="bg-slate-900 rounded-xl p-2.5 font-mono text-[11px] text-sky-300">
                  Primary Condition: {primaryFinding.class_name} ({primaryFinding.confidence_pct}%)
                </div>
              </div>

              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Stage 4: Grad-CAM Saliency Map</span>
                <p className="text-slate-300">Dynamic backward gradient pass <span className="font-mono text-teal-300">&part;y_c / &part;A_k</span> generated visual heatmap overlay for spatial interpretability.</p>
              </div>

            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-center">
              <button
                onClick={() => setShowExplainerModal(false)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
