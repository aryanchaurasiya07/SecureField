import React, { useState, useRef } from 'react';
import { toast } from '../utils/toast';

function Field({ label, placeholder, value, onChange, required }) {
  return (
    <div>
      <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">
        {label} {required && <span className="text-red-400">*</span>}
      </label>
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="mt-1.5 w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
      />
    </div>
  );
}

export default function Step3_VoiceNotes({ testData, update, onNext }) {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState(testData.voiceNote || '');
  const [caseNumber, setCaseNumber] = useState(testData.caseNumber || '');
  const [suspectName, setSuspectName] = useState(testData.suspectName || '');
  const [location, setLocation] = useState(testData.incidentLocation || '');
  const [error, setError] = useState('');
  const recognitionRef = useRef(null);

  const startRecording = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setError('Speech recognition not supported on this browser. Please type notes below.');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';

    recognition.onresult = (e) => {
      let text = '';
      for (let i = 0; i < e.results.length; i++) text += e.results[i][0].transcript;
      setTranscript(text);
    };
    recognition.onerror = (e) => {
      setError(`Voice error: ${e.error}. Please type your notes instead.`);
      setIsRecording(false);
    };
    recognition.onend = () => setIsRecording(false);

    recognitionRef.current = recognition;
    recognition.start();
    setIsRecording(true);
    setError('');
    toast('Recording started — speak now', 'info', 2000);
  };

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setIsRecording(false);
    update({ voiceNote: transcript });
    toast('Recording saved', 'success');
  };

  const handleNext = () => {
    update({ voiceNote: transcript, caseNumber, suspectName, incidentLocation: location });
    onNext();
  };


  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Step 3: Case & Field Notes</h2>
        <p className="text-slate-400 text-sm mt-1">Record case details and field observations before the test.</p>
      </div>

      {/* Case Details */}
      <div className="bg-slate-800 rounded-2xl border border-slate-700 p-4 space-y-3">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">📂 Case Details</p>
        <Field label="Case / FIR Number" placeholder="e.g. FIR/2026/DL/0042" value={caseNumber} onChange={setCaseNumber} />
        <Field label="Suspect Name / Description" placeholder="e.g. John Doe, male, ~30 yrs" value={suspectName} onChange={setSuspectName} />
        <Field label="Incident Location" placeholder="e.g. NH-48, near km 42, New Delhi" value={location} onChange={setLocation} />
      </div>

      {/* Voice Note */}
      <div className="space-y-3">
        <p className="text-xs font-bold text-slate-300 uppercase tracking-wider">🎙️ Voice / Text Notes</p>

        <div className="flex justify-center">
          <button
            onClick={isRecording ? stopRecording : startRecording}
            className={`w-24 h-24 rounded-full flex flex-col items-center justify-center gap-1.5 font-bold border-4 transition-all active:scale-90 ${
              isRecording
                ? 'bg-red-600 border-red-400 animate-pulse shadow-lg shadow-red-900'
                : 'bg-slate-700 border-slate-500 hover:bg-slate-600'
            }`}
          >
            <span className="text-3xl">{isRecording ? '⏹' : '🎙️'}</span>
            <span className="text-xs text-white">{isRecording ? 'Stop' : 'Record'}</span>
          </button>
        </div>

        {isRecording && (
          <div className="flex items-center justify-center gap-2 text-red-400">
            <span className="w-2 h-2 bg-red-500 rounded-full animate-ping" />
            <span className="text-sm font-semibold">Recording…</span>
          </div>
        )}

        {error && (
          <div className="bg-yellow-950 border border-yellow-700 rounded-xl p-3 text-yellow-300 text-xs">{error}</div>
        )}

        <textarea
          value={transcript}
          onChange={e => { setTranscript(e.target.value); update({ voiceNote: e.target.value }); }}
          rows={4}
          placeholder="Additional observations — substance appearance, packaging, circumstances of seizure…"
          className="w-full bg-slate-700 border border-slate-600 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
        />
      </div>

      <div className="flex gap-3">
        <button
          onClick={() => { update({ voiceNote: '', caseNumber, suspectName, incidentLocation: location }); onNext(); }}
          className="flex-1 py-3 rounded-xl bg-slate-700 text-slate-300 font-semibold hover:bg-slate-600"
        >
          Skip Notes
        </button>
        <button
          onClick={handleNext}
          className="flex-[2] py-3 rounded-xl bg-blue-600 hover:bg-blue-500 font-bold text-white active:scale-95 transition-all"
        >
          Save & Continue →
        </button>
      </div>
    </div>
  );
}
