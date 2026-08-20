import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Eye, Sun, Volume2, Globe, Sparkles, Type } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const Navbar = () => {
  const { 
    highContrast, 
    toggleHighContrast, 
    fontScale, 
    setFontScale, 
    language, 
    setLanguage, 
    voiceModeActive, 
    toggleVoiceMode,
    t 
  } = useAccessibility();

  const location = useLocation();

  const navLinks = [
    { path: '/', label: t('navHome') },
    { path: '/screening', label: t('navScreening') },
    { path: '/history', label: t('navHistory') },
    { path: '/accessibility', label: t('navAccessibility') },
    { path: '/about', label: t('navAbout') },
    { path: '/privacy', label: t('navPrivacy') }
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-sm" role="banner">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo & Tagline */}
          <Link to="/" className="flex items-center space-x-3 group focus:outline-none focus:ring-2 focus:ring-sky-500 rounded-lg p-1" aria-label="CareLens AI Home">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <Eye className="w-6 h-6" />
            </div>
            <div>
              <span className="font-display font-extrabold text-xl tracking-tight text-slate-900 block">
                CareLens <span className="text-sky-600">AI</span>
              </span>
              <span className="text-xs font-medium text-slate-500 hidden sm:block">
                {t('tagline')}
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1" aria-label="Main Navigation">
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-3.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? 'bg-sky-50 text-sky-700 font-semibold border-b-2 border-sky-600' 
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>

          {/* Quick Accessibility Controls Toolbar */}
          <div className="flex items-center space-x-2">
            
            {/* Language Switcher */}
            <div className="relative flex items-center bg-slate-100 rounded-lg p-1">
              <Globe className="w-4 h-4 text-slate-500 ml-1.5 mr-1" aria-hidden="true" />
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="bg-transparent text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer py-1 pr-1"
                aria-label={t('languageLabel')}
              >
                <option value="en" className="bg-slate-900 text-white">EN (English)</option>
                <option value="hi" className="bg-slate-900 text-white">HI (हिन्दी)</option>
                <option value="pa" className="bg-slate-900 text-white">PA (ਪੰਜਾਬੀ)</option>
              </select>
            </div>

            {/* Font Sizer Toggle */}
            <button
              onClick={() => {
                if (fontScale === 'normal') setFontScale('large');
                else if (fontScale === 'large') setFontScale('xlarge');
                else setFontScale('normal');
              }}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:ring-2 focus:ring-sky-500"
              title={`${t('fontSizeScaler')}: ${fontScale.toUpperCase()}`}
              aria-label={`${t('fontSizeScaler')}: ${fontScale}`}
            >
              <Type className="w-5 h-5" />
            </button>

            {/* High Contrast Mode Button */}
            <button
              onClick={toggleHighContrast}
              className={`p-2 rounded-lg transition-colors ${
                highContrast 
                  ? 'bg-sky-600 text-white font-bold ring-2 ring-sky-400' 
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
              title={t('highContrastToggle')}
              aria-label={t('highContrastToggle')}
            >
              <Sun className="w-5 h-5" />
            </button>

            {/* Voice Assistant Toggle */}
            <button
              onClick={toggleVoiceMode}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                voiceModeActive
                  ? 'bg-teal-600 text-white shadow-md animate-pulse'
                  : 'bg-slate-800 text-white hover:bg-slate-900'
              }`}
              aria-label="Toggle Voice Interaction Mode"
            >
              <Volume2 className="w-4 h-4" />
              <span className="hidden lg:inline">{voiceModeActive ? 'Voice ON' : 'Voice Mode'}</span>
            </button>

          </div>

        </div>
      </div>
    </header>
  );
};
