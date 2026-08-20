import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, AlertCircle, Sparkles } from 'lucide-react';
import { useAccessibility } from '../context/AccessibilityContext';

export const VoiceAssistant = () => {
  const { voiceModeActive, setVoiceModeActive, speakText, stopSpeaking, isSpeaking, t } = useAccessibility();
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setRecognitionSupported(false);
    }
  }, []);

  const handleStartListening = () => {
    setErrorMessage('');
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setErrorMessage("Voice interaction is not supported in this browser. Please use text interaction.");
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setTranscript("Listening for your request…");
      };

      recognition.onresult = (event) => {
        const speechToText = event.results[0][0].transcript;
        setTranscript(`"${speechToText}"`);
        setIsListening(false);
        processVoiceCommand(speechToText);
      };

      recognition.onerror = (event) => {
        setIsListening(false);
        if (event.error === 'not-allowed') {
          setErrorMessage("Microphone access is required for voice interaction. Please grant browser microphone permission.");
        } else {
          setErrorMessage("Could not recognize voice input. Please try again or type your request.");
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      setIsListening(false);
      setErrorMessage("Failed to activate microphone input.");
    }
  };

  const processVoiceCommand = (input) => {
    const text = input.toLowerCase();

    let reply = "";
    if (text.includes("result") || text.includes("mean") || text.includes("finding")) {
      reply = "Your screening result indicates a potential risk pattern that should be evaluated by an eye-care professional. Remember, this screening result is not a medical diagnosis.";
    } else if (text.includes("disclaimer") || text.includes("doctor")) {
      reply = "CareLens AI is an early decision support tool. It does not diagnose patients or replace an ophthalmologist.";
    } else if (text.includes("screen") || text.includes("start") || text.includes("upload")) {
      reply = "To start a new screening, upload or capture a clear retinal fundus image on the screening page.";
    } else {
      reply = "I heard you. CareLens AI provides early retinal screening guidance. For any medical symptoms, please consult an eye doctor directly.";
    }

    setAssistantReply(reply);
    speakText(reply);
  };

  if (!voiceModeActive) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-5 shadow-2xl border border-slate-700 animate-slide-up" role="dialog" aria-label="Voice Assistant Panel">
      
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center animate-pulse">
            <Sparkles className="w-4 h-4" />
          </div>
          <span className="font-display font-semibold text-sm">CareLens Voice Assistant</span>
        </div>
        <button
          onClick={() => setVoiceModeActive(false)}
          className="text-slate-400 hover:text-white p-1 rounded-lg focus:ring-2 focus:ring-sky-500"
          aria-label="Close Voice Assistant"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Main Controls */}
      <div className="text-center py-3">
        {!recognitionSupported ? (
          <div className="text-amber-400 text-xs flex items-center space-x-1.5 justify-center bg-amber-950/40 p-2.5 rounded-xl border border-amber-800">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Voice interaction is not supported in this browser. You can use text interaction.</span>
          </div>
        ) : (
          <>
            <button
              onClick={isListening ? () => {} : handleStartListening}
              className={`w-16 h-16 rounded-full mx-auto flex items-center justify-center text-white transition-all shadow-lg ${
                isListening 
                  ? 'bg-red-500 animate-ping' 
                  : isSpeaking 
                  ? 'bg-teal-500 ring-4 ring-teal-300/40' 
                  : 'bg-sky-600 hover:bg-sky-500 hover:scale-105'
              }`}
              aria-label={isListening ? "Listening..." : "Tap to Speak"}
            >
              {isListening ? <Mic className="w-7 h-7" /> : <Mic className="w-7 h-7" />}
            </button>
            <p className="text-xs text-slate-300 font-medium mt-3">
              {isListening ? "Listening… Speak now" : "Tap button to ask a question"}
            </p>
          </>
        )}
      </div>

      {/* Transcript & Replies */}
      {transcript && (
        <div className="bg-slate-800/80 rounded-xl p-3 text-xs text-slate-300 mt-2 border border-slate-700">
          <span className="text-slate-500 font-semibold uppercase block mb-1">You asked:</span>
          <p className="italic">{transcript}</p>
        </div>
      )}

      {assistantReply && (
        <div className="bg-sky-950/60 rounded-xl p-3 text-xs text-sky-200 mt-2 border border-sky-800">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sky-400 font-semibold uppercase">CareLens AI:</span>
            {isSpeaking && (
              <button onClick={stopSpeaking} className="text-sky-300 hover:text-white flex items-center space-x-1">
                <Volume2 className="w-3.5 h-3.5 animate-pulse" />
                <span>Stop</span>
              </button>
            )}
          </div>
          <p>{assistantReply}</p>
        </div>
      )}

      {errorMessage && (
        <div className="bg-red-950/80 text-red-300 rounded-xl p-3 text-xs mt-2 border border-red-800 flex items-start space-x-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
          <p>{errorMessage}</p>
        </div>
      )}

    </div>
  );
};
