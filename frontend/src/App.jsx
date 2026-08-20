import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AccessibilityProvider } from './context/AccessibilityContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { VoiceAssistant } from './components/VoiceAssistant';

import { Home } from './pages/Home';
import { Screening } from './pages/Screening';
import { Results } from './pages/Results';
import { History } from './pages/History';
import { AccessibilityCenter } from './pages/AccessibilityCenter';
import { About } from './pages/About';
import { Privacy } from './pages/Privacy';

export default function App() {
  return (
    <AccessibilityProvider>
      <Router>
        <div className="flex flex-col min-h-screen">
          <Navbar />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/screening" element={<Screening />} />
              <Route path="/results" element={<Results />} />
              <Route path="/history" element={<History />} />
              <Route path="/accessibility" element={<AccessibilityCenter />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
            </Routes>
          </main>
          <Footer />
          <VoiceAssistant />
        </div>
      </Router>
    </AccessibilityProvider>
  );
}
