import React, { useState } from 'react';
import Step1_Selfie from '../steps/Step1_Selfie';
import Step2_KitScan from '../steps/Step2_KitScan';
import Step3_VoiceNotes from '../steps/Step3_VoiceNotes';
import Step4_ColorCapture from '../steps/Step4_ColorCapture';
import Step5_Review from '../steps/Step5_Review';

const STEPS = [
  { id: 1, icon: '🤳', label: 'Identity' },
  { id: 2, icon: '📦', label: 'Kit' },
  { id: 3, icon: '📂', label: 'Case' },
  { id: 4, icon: '📸', label: 'Capture' },
  { id: 5, icon: '✅', label: 'Review' },
];

export default function NewTestFlow({ operator, navigate }) {
  const [step, setStep] = useState(1);
  const [testData, setTestData] = useState({ selfieConfirmed: false, kitType: 'marquis', kitBrand: '', kitExpiry: '', voiceNote: '', caseNumber: '', suspectName: '', incidentLocation: '', colorResult: null, imageDataUrl: null });

  const update = (fields) => setTestData(prev => ({ ...prev, ...fields }));
  const next = () => setStep(s => Math.min(s + 1, 5));
  const back = () => { if (step === 1) navigate('dashboard'); else setStep(s => s - 1); };

  return (
    <div className="min-h-screen" style={{ background: '#eef4f4' }}>

      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex items-center gap-3">
        <button onClick={back}
          className="w-9 h-9 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 text-sm active:scale-90 transition-transform">
          ←
        </button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-gray-900">New Field Test</h1>
          <p className="text-xs text-gray-400">Step {step} of 5 — {STEPS[step-1].label}</p>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="flex items-center gap-2 px-5 mb-5">
        {STEPS.map(s => (
          <div key={s.id} className="flex items-center gap-2 flex-1">
            <div className={`flex-1 h-1.5 rounded-full transition-all ${s.id <= step ? 'bg-blue-500' : 'bg-gray-200'}`} />
          </div>
        ))}
      </div>

      {/* Step indicators */}
      <div className="flex px-5 mb-6 gap-1">
        {STEPS.map(s => (
          <div key={s.id} className="flex-1 flex flex-col items-center gap-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm transition-all ${
              s.id < step  ? 'bg-blue-500 text-white' :
              s.id === step ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' :
              'bg-white text-gray-400 border border-gray-200'
            }`}>
              {s.id < step ? '✓' : s.icon}
            </div>
            <p className={`text-xs font-medium ${s.id === step ? 'text-blue-600' : 'text-gray-400'}`}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* Content */}
      <div className="px-5">
        {step === 1 && <Step1_Selfie operator={operator} testData={testData} update={update} onNext={next} />}
        {step === 2 && <Step2_KitScan testData={testData} update={update} onNext={next} />}
        {step === 3 && <Step3_VoiceNotes testData={testData} update={update} onNext={next} />}
        {step === 4 && <Step4_ColorCapture testData={testData} update={update} onNext={next} />}
        {step === 5 && <Step5_Review operator={operator} testData={testData} navigate={navigate} />}
      </div>
    </div>
  );
}
