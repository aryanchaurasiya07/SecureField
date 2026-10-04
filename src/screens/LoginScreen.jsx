import React, { useState, useRef } from 'react';
import { saveOperator } from '../utils/storage';

export default function LoginScreen({ onLogin }) {
  const [name, setName] = useState('');
  const [badgeId, setBadgeId] = useState('');
  const [selfie, setSelfie] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [error, setError] = useState('');
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setShowCamera(true);
    } catch { setError('Camera access denied.'); }
  };

  const captureSelfie = () => {
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    canvas.getContext('2d').drawImage(videoRef.current, 0, 0);
    setSelfie(canvas.toDataURL('image/jpeg', 0.8));
    streamRef.current?.getTracks().forEach(t => t.stop());
    setShowCamera(false);
  };

  const handleLogin = () => {
    if (!name.trim() || !badgeId.trim()) { setError('Name and Badge ID are required.'); return; }
    const operator = { name: name.trim(), badgeId: badgeId.trim(), selfie };
    saveOperator(operator);
    onLogin(operator);
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#eef4f4' }}>
      {/* Top gradient blob */}
      <div className="h-64 relative overflow-hidden flex-shrink-0">
        <div className="absolute inset-0" style={{ background: 'linear-gradient(145deg,#0f2027,#203a43,#2c5364)' }} />
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#38bdf8,transparent)' }} />
        <div className="absolute bottom-0 left-0 right-0 h-12" style={{ background: '#eef4f4', borderRadius: '40px 40px 0 0' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center pb-8">
          <div className="w-16 h-16 rounded-3xl bg-white/10 border border-white/20 flex items-center justify-center text-4xl mb-3">
            🧪
          </div>
          <h1 className="text-white text-2xl font-bold">SecureField</h1>
          <p className="text-blue-200 text-sm mt-1">NCB Digital Field Test Companion</p>
        </div>
      </div>

      {/* Form card */}
      <div className="flex-1 px-5 -mt-4 relative z-10 pb-8">
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-5 space-y-4">
          <div>
            <p className="text-xl font-bold text-gray-900">Sign In</p>
            <p className="text-gray-400 text-sm mt-0.5">Enter your officer credentials</p>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Full Name</label>
              <input
                type="text" placeholder="e.g. Rajesh Kumar"
                value={name} onChange={e => setName(e.target.value)}
                className="mt-1.5 w-full rounded-2xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              />
            </div>
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Badge / Operator ID</label>
              <input
                type="text" placeholder="e.g. NCB-DL-1234"
                value={badgeId} onChange={e => setBadgeId(e.target.value)}
                className="mt-1.5 w-full rounded-2xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
                style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }}
              />
            </div>

            {/* Selfie */}
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Identity Photo (Optional)</label>
              {selfie ? (
                <div className="mt-1.5 relative rounded-2xl overflow-hidden">
                  <img src={selfie} alt="Selfie" className="w-full h-28 object-cover" />
                  <button onClick={() => setSelfie(null)} className="absolute top-2 right-2 w-7 h-7 rounded-full bg-red-500 text-white flex items-center justify-center text-xs font-bold">✕</button>
                  <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full text-xs text-white font-semibold" style={{ background: '#16a34a' }}>✓ Captured</div>
                </div>
              ) : showCamera ? (
                <div className="mt-1.5 relative rounded-2xl overflow-hidden">
                  <video ref={videoRef} autoPlay playsInline className="w-full h-36 object-cover bg-black" />
                  <button onClick={captureSelfie} className="absolute bottom-3 left-1/2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-blue-500 shadow-lg" />
                </div>
              ) : (
                <button onClick={startCamera}
                  className="mt-1.5 w-full rounded-2xl py-4 flex items-center justify-center gap-2 text-sm font-medium text-gray-500 transition-colors hover:bg-gray-50"
                  style={{ background: '#f8fafc', border: '1.5px dashed #cbd5e1' }}>
                  📷 Take Identity Photo
                </button>
              )}
            </div>
          </div>

          {error && <p className="text-red-500 text-xs text-center">{error}</p>}

          <button
            onClick={handleLogin}
            className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
          >
            Begin Field Operations →
          </button>
        </div>

        <p className="text-gray-400 text-xs text-center mt-4 px-4 leading-relaxed">
          All results are presumptive and subject to laboratory confirmation. Ministry of Home Affairs · NCB.
        </p>
      </div>
    </div>
  );
}
