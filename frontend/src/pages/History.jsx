import React, { useState, useEffect } from 'react';
import { History as HistoryIcon, Trash2, Calendar, ShieldCheck, AlertCircle, RefreshCw, GitCompare, ArrowRight, TrendingUp, CheckSquare, Square, X } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const History = () => {
  const { t } = useAccessibility();
  const [historyItems, setHistoryItems] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // Comparison State
  const [isCompareMode, setIsCompareMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  const fetchHistory = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/history');
      if (!res.ok) throw new Error("Failed to fetch screening history.");
      const data = await res.json();
      setHistoryItems(data);
    } catch (err) {
      setError("Could not load history items from local server.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm(t('clearHistoryConfirm'))) return;

    try {
      const res = await fetch(`/api/history/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setHistoryItems(prev => prev.filter(item => item.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
      }
    } catch (e) {
      alert("Failed to delete record.");
    }
  };

  const toggleSelectRecord = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(prev => prev.filter(item => item !== id));
    } else {
      if (selectedIds.length >= 2) {
        // Keep last 2 selections
        setSelectedIds([selectedIds[1], id]);
      } else {
        setSelectedIds([...selectedIds, id]);
      }
    }
  };

  const selectedRecords = historyItems.filter(item => selectedIds.includes(item.id));
  const recordA = selectedRecords[0];
  const recordB = selectedRecords[1];

  const calculateDelta = () => {
    if (!recordA || !recordB) return null;
    const diff = (recordB.confidence_pct - recordA.confidence_pct).toFixed(1);
    return {
      diff,
      isIncrease: Number(diff) > 0,
      isEqual: Number(diff) === 0,
    };
  };

  const delta = calculateDelta();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-20 pt-10">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display font-extrabold text-3xl text-slate-900 flex items-center space-x-3">
              <HistoryIcon className="w-8 h-8 text-sky-600" />
              <span>{t('navHistory')}</span>
            </h1>
            <p className="text-sm text-slate-600 mt-1">
              {t('historySubtitle')}
            </p>
          </div>

          <div className="flex items-center space-x-2">
            <button
              onClick={() => {
                setIsCompareMode(!isCompareMode);
                setSelectedIds([]);
              }}
              className={`px-4 py-2 font-semibold text-xs rounded-xl border shadow-sm flex items-center space-x-1.5 transition-colors ${
                isCompareMode 
                  ? 'bg-sky-600 text-white border-sky-600' 
                  : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <GitCompare className="w-3.5 h-3.5" />
              <span>{isCompareMode ? "Exit Compare Mode" : "Compare Longitudinal Scans"}</span>
            </button>

            <button
              onClick={fetchHistory}
              className="px-3.5 py-2 bg-white hover:bg-slate-100 text-slate-700 font-semibold text-xs rounded-xl border border-slate-300 shadow-sm flex items-center space-x-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span>{t('historyRefresh')}</span>
            </button>
          </div>
        </div>

        {/* Longitudinal Comparison Selection Banner */}
        {isCompareMode && (
          <div className="mb-6 bg-sky-50 border border-sky-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-sky-900 shadow-sm">
            <div className="flex items-center space-x-2 font-medium">
              <GitCompare className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>Select any 2 past screening records below to analyze disease probability changes over time. ({selectedIds.length}/2 selected)</span>
            </div>
            {selectedIds.length === 2 && (
              <button
                onClick={() => setShowCompareModal(true)}
                className="px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl shadow transition-all flex items-center space-x-1.5 text-xs whitespace-nowrap"
              >
                <span>View Progression Audit</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {isLoading ? (
          <div className="text-center py-16 bg-white rounded-3xl border border-slate-200 shadow-sm">
            <RefreshCw className="w-8 h-8 animate-spin text-sky-600 mx-auto mb-3" />
            <p className="text-sm font-medium text-slate-600">{t('historyLoading')}</p>
          </div>
        ) : error ? (
          <div className="bg-amber-50 border border-amber-200 text-amber-900 rounded-2xl p-6 text-center">
            <AlertCircle className="w-8 h-8 text-amber-600 mx-auto mb-2" />
            <p className="text-sm font-semibold">{error}</p>
          </div>
        ) : historyItems.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm">
            <ShieldCheck className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-slate-800 mb-1">{t('historyNoRecordsTitle')}</h3>
            <p className="text-sm text-slate-500 max-w-sm mx-auto">
              {t('historyNoRecordsDesc')}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {historyItems.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              return (
                <div
                  key={item.id}
                  onClick={() => isCompareMode && toggleSelectRecord(item.id)}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isCompareMode ? 'cursor-pointer hover:border-sky-400' : ''
                  } ${
                    isSelected ? 'border-sky-500 bg-sky-50/30 ring-2 ring-sky-200' : 'border-slate-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {isCompareMode && (
                      <div className="mt-1 text-sky-600">
                        {isSelected ? (
                          <CheckSquare className="w-5 h-5" />
                        ) : (
                          <Square className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                    )}

                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="font-display font-bold text-base text-slate-900">
                          {item.primary_condition}
                        </span>
                        <span className="bg-sky-100 text-sky-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase">
                          {item.risk_level}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-xs text-slate-500">
                        <span className="flex items-center space-x-1">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          <span>{new Date(item.created_at).toLocaleString()}</span>
                        </span>
                        <span>{t('historyRef')} <strong>{item.image_reference_id}</strong></span>
                        <span>{t('historyConf')} <strong>{item.confidence_pct}%</strong></span>
                      </div>
                    </div>
                  </div>

                  {!isCompareMode && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDelete(item.id);
                      }}
                      className="px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 font-semibold text-xs rounded-xl transition-colors flex items-center space-x-1 self-start sm:self-auto border border-red-200"
                      title="Delete Record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('deleteHistory')}</span>
                    </button>
                  )}

                </div>
              );
            })}
          </div>
        )}

      </div>

      {/* Longitudinal Comparison Modal */}
      {showCompareModal && recordA && recordB && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 text-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 border border-slate-800 shadow-2xl relative">
            
            <button
              onClick={() => setShowCompareModal(false)}
              className="absolute top-5 right-5 p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center">
                <TrendingUp className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-display font-bold text-xl text-white">Longitudinal Scan Progression Audit</h3>
                <p className="text-xs text-slate-400">Comparing 2 screening sessions over time</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              
              {/* Baseline Scan A */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-xs">
                <span className="text-sky-400 font-bold uppercase tracking-wider block mb-1">Session A (Baseline)</span>
                <p className="text-slate-400 mb-2">{new Date(recordA.created_at).toLocaleDateString()}</p>
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">{recordA.primary_condition}</span>
                  <span className="text-xl font-extrabold text-sky-400 font-display">{recordA.confidence_pct}%</span>
                  <span className="text-[10px] text-slate-400 block">Model Output Probability</span>
                </div>
              </div>

              {/* Follow-up Scan B */}
              <div className="bg-slate-800/80 rounded-2xl p-4 border border-slate-700 text-xs">
                <span className="text-teal-400 font-bold uppercase tracking-wider block mb-1">Session B (Follow-up)</span>
                <p className="text-slate-400 mb-2">{new Date(recordB.created_at).toLocaleDateString()}</p>
                <div className="bg-slate-900 rounded-xl p-3 border border-slate-800">
                  <span className="font-bold text-white block mb-0.5">{recordB.primary_condition}</span>
                  <span className="text-xl font-extrabold text-teal-400 font-display">{recordB.confidence_pct}%</span>
                  <span className="text-[10px] text-slate-400 block">Model Output Probability</span>
                </div>
              </div>

            </div>

            {/* Probability Delta Analysis */}
            {delta && (
              <div className="bg-slate-800/90 rounded-2xl p-4 border border-slate-700 mb-6 text-xs">
                <span className="text-slate-400 uppercase tracking-wider font-semibold block mb-1">Probability Trend Delta (&Delta;)</span>
                <div className="flex items-center justify-between">
                  <span className="text-slate-200">Difference from Session A to B:</span>
                  <span className={`font-mono font-extrabold text-base ${
                    delta.isIncrease ? 'text-amber-400' : delta.isEqual ? 'text-sky-400' : 'text-emerald-400'
                  }`}>
                    {delta.isIncrease ? `+${delta.diff}%` : `${delta.diff}%`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 mt-2 italic">
                  This progression audit compares output probabilities across visits. Always consult an eye doctor to evaluate structural retinal changes.
                </p>
              </div>
            )}

            <div className="text-center">
              <button
                onClick={() => setShowCompareModal(false)}
                className="px-6 py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-semibold text-xs rounded-xl shadow"
              >
                Close Audit
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};
