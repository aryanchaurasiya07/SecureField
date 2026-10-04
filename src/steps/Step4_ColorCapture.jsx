import React, { useState, useRef, useEffect } from 'react';
import { analyzeColor } from '../utils/colorAnalyzer';
import { REAGENT_KITS } from '../data/colorRanges';
import { toast } from '../utils/toast';
import EvidenceGallery from '../components/EvidenceGallery';

/**
 * Stamps operator info + timestamp + NCB branding onto the captured image
 */
function watermarkImage(dataUrl, operator, kitName) {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0);

      const W = canvas.width;
      const H = canvas.height;
      const scale = Math.max(W / 400, 1); // scale font to image size

      // Semi-transparent top banner
      ctx.fillStyle = 'rgba(15,23,42,0.82)';
      ctx.fillRect(0, 0, W, 52 * scale);

      // Top banner text
      ctx.fillStyle = '#93c5fd';
      ctx.font = `bold ${13 * scale}px Arial`;
      ctx.fillText('🔒 SECUREFIELD — NCB OFFICIAL RECORD', 12 * scale, 18 * scale);

      ctx.fillStyle = '#e2e8f0';
      ctx.font = `${10 * scale}px Arial`;
      ctx.fillText(`Officer: ${operator?.name || 'N/A'} · ${operator?.badgeId || 'N/A'}`, 12 * scale, 34 * scale);
      ctx.fillText(`Kit: ${kitName} · ${new Date().toLocaleString('en-IN')}`, 12 * scale, 47 * scale);

      // Bottom disclaimer banner
      ctx.fillStyle = 'rgba(120,53,15,0.88)';
      ctx.fillRect(0, H - 36 * scale, W, 36 * scale);
      ctx.fillStyle = '#fcd34d';
      ctx.font = `bold ${10 * scale}px Arial`;
      ctx.textAlign = 'center';
      ctx.fillText('⚠️  PRESUMPTIVE RESULT ONLY — LABORATORY CONFIRMATION REQUIRED', W / 2, H - 20 * scale);
      ctx.fillStyle = '#fef3c7';
      ctx.font = `${9 * scale}px Arial`;
      ctx.fillText('Ministry of Home Affairs · Narcotics Control Bureau · SecureField v1.0', W / 2, H - 7 * scale);
      ctx.textAlign = 'left';

      // Thin overlay guide boxes (for court clarity)
      ctx.strokeStyle = 'rgba(99,102,241,0.6)';
      ctx.lineWidth = 2 * scale;
      ctx.setLineDash([6 * scale, 4 * scale]);
      ctx.strokeRect(12 * scale, 56 * scale, W - 24 * scale, H * 0.22);

      ctx.strokeStyle = 'rgba(234,179,8,0.8)';
      ctx.beginPath();
      ctx.arc(W / 2, H * 0.65, 40 * scale, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      resolve(canvas.toDataURL('image/jpeg', 0.92));
    };
    img.src = dataUrl;
  });
}

export default function Step4_ColorCapture({ testData, update, onNext }) {
  const [mode, setMode] = useState('guide');
  const [imageDataUrl, setImageDataUrl] = useState(testData.imageDataUrl || null);
  const [colorResult, setColorResult] = useState(testData.colorResult || null);
  const [error, setError] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const startCamera = async () => {
    setError('');
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setError('Camera is not supported on this browser or requires HTTPS. You can upload an image file instead.');
      return;
    }
    try {
      let stream = null;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 1920 }, height: { ideal: 1080 } },
          audio: false,
        });
      } catch {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }
      streamRef.current = stream;
      setMode('camera');
      setError('');
    } catch (err) {
      console.error('Camera access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setError('Camera permission denied in browser. Please check camera permission in the address bar lock icon, or upload an image file below.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setError('No camera device detected. Please upload an image file below.');
      } else {
        setError(`Camera could not be opened (${err.message || err.name}). You can upload an image file below.`);
      }
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const rawDataUrl = ev.target.result;
      const kitName = REAGENT_KITS[testData.kitType]?.name || testData.kitType;
      const watermarked = await watermarkImage(rawDataUrl, testData._operator || {}, kitName);
      setImageDataUrl(watermarked);
      setMode('preview');
      toast('Photo loaded & watermarked', 'success');
    };
    reader.readAsDataURL(file);
  };

  const capturePhoto = async () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 1280;
    canvas.height = video.videoHeight || 720;
    canvas.getContext('2d').drawImage(video, 0, 0);
    const rawDataUrl = canvas.toDataURL('image/jpeg', 0.92);

    // Apply watermark
    const kitName = REAGENT_KITS[testData.kitType]?.name || testData.kitType;
    const watermarked = await watermarkImage(rawDataUrl, testData._operator || {}, kitName);

    setImageDataUrl(watermarked);
    streamRef.current?.getTracks().forEach(t => t.stop());
    setMode('preview');
    toast('Photo captured & watermarked', 'success');
  };

  const analyzePhoto = () => {
    setAnalyzing(true);
    const img = new Image();
    img.onload = () => {
      const result = analyzeColor(img, testData.kitType || 'marquis');
      setColorResult(result);
      update({ colorResult: result, imageDataUrl });
      setAnalyzing(false);
      setMode('analyzed');
      toast(`Analysis complete: ${result.classification}`,
        result.classification === 'POSITIVE' ? 'warning' :
        result.classification === 'NEGATIVE' ? 'success' : 'info');
    };
    img.src = imageDataUrl;
  };

  useEffect(() => {
    if (mode === 'camera' && videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(e => console.warn('Video play warning:', e));
    }
  }, [mode]);

  useEffect(() => {
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  const classColor = {
    POSITIVE: 'text-red-400 bg-red-950 border-red-700',
    NEGATIVE: 'text-green-400 bg-green-950 border-green-700',
    INCONCLUSIVE: 'text-yellow-400 bg-yellow-950 border-yellow-700',
  };

  const classIcon = { POSITIVE: '⚠️', NEGATIVE: '✅', INCONCLUSIVE: '❓' };

  const kitName = REAGENT_KITS[testData.kitType]?.name || 'Unknown';

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-white">Step 4: Capture & Analyse</h2>
        <p className="text-slate-400 text-sm mt-1">
          Kit: <strong className="text-blue-300">{kitName}</strong>
          <span className="ml-2 text-slate-500 text-xs">· Photo will be auto-watermarked</span>
        </p>
      </div>

      {/* Instruction Guide */}
      {mode === 'guide' && (
        <div className="space-y-4">
          <div className="bg-blue-950 border border-blue-700 rounded-xl p-4 space-y-2">
            <p className="text-blue-300 font-bold text-sm">📋 Before you take the photo:</p>
            <ol className="text-slate-300 text-sm space-y-2 list-none">
              <li className="flex gap-2"><span className="text-blue-400 font-bold">1.</span> Place the <strong>reference colour card</strong> in the TOP of the frame (inside the blue box)</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">2.</span> Place the <strong>reacted test kit</strong> in the CENTER circle</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">3.</span> Ensure <strong>even, neutral lighting</strong> — avoid shadows</li>
              <li className="flex gap-2"><span className="text-blue-400 font-bold">4.</span> Hold phone <strong>directly above</strong>, not at an angle</li>
            </ol>
          </div>

          <div className="border-2 border-dashed border-slate-600 rounded-xl overflow-hidden aspect-video bg-slate-800 flex flex-col relative">
            <div className="h-[25%] border-b-2 border-dashed border-indigo-500/60 bg-indigo-900/20 flex items-center justify-center">
              <p className="text-indigo-300 text-xs">🎨 Reference Colour Card Zone</p>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full border-2 border-dashed border-yellow-400 mx-auto flex items-center justify-center">
                  <span className="text-yellow-300 text-xs">Kit</span>
                </div>
                <p className="text-slate-500 text-xs mt-1">Test Kit Result</p>
              </div>
            </div>
          </div>

          {error && (
            <div className="bg-red-950 border border-red-700 rounded-xl p-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          <div className="flex flex-col gap-2.5">
            <button onClick={startCamera} className="w-full py-4 rounded-xl font-bold text-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md">
              📸 Open Camera
            </button>
            <label className="w-full py-3.5 rounded-xl font-semibold text-sm bg-slate-700 hover:bg-slate-600 text-slate-200 border border-slate-600 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-95 text-center">
              📁 Choose Photo / Upload File
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>
      )}

      {/* Camera Live View */}
      {mode === 'camera' && (
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden bg-black" style={{ aspectRatio: '16/9' }}>
            <video
              ref={el => {
                videoRef.current = el;
                if (el && streamRef.current && el.srcObject !== streamRef.current) {
                  el.srcObject = streamRef.current;
                }
              }}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 pointer-events-none">
              {/* Reference card zone */}
              <div className="absolute top-0 left-0 right-0 h-[25%] border-b-2 border-dashed border-indigo-400/80 bg-indigo-900/20 flex items-center justify-center">
                <span className="text-indigo-200 text-xs bg-indigo-900/70 px-3 py-1 rounded-full">🎨 Place Colour Card Here</span>
              </div>
              {/* Test kit circle */}
              <div className="absolute inset-0 flex items-center justify-center mt-8">
                <div className="w-24 h-24 rounded-full border-2 border-dashed border-yellow-300 flex items-center justify-center">
                  <span className="text-yellow-200 text-xs">Test Kit</span>
                </div>
              </div>
              {/* Corner marks */}
              {['top-1 left-1', 'top-1 right-1', 'bottom-1 left-1', 'bottom-1 right-1'].map((pos, i) => (
                <div key={i} className={`absolute ${pos} w-4 h-4 border-white ${i < 2 ? 'border-t-2' : 'border-b-2'} ${i % 2 === 0 ? 'border-l-2' : 'border-r-2'}`} />
              ))}
            </div>
          </div>

          <button onClick={capturePhoto} className="w-full py-4 rounded-xl font-bold text-lg bg-white text-slate-900 flex items-center justify-center gap-2 active:scale-95 transition-all">
            ⚪ Capture & Watermark Photo
          </button>
          <label className="w-full py-2.5 rounded-xl text-center text-xs text-slate-400 hover:text-slate-200 border border-dashed border-slate-600 cursor-pointer block">
            Switch to image file upload instead
            <input type="file" accept="image/*" onChange={(e) => { streamRef.current?.getTracks().forEach(t => t.stop()); handleFileUpload(e); }} className="hidden" />
          </label>
          <button onClick={() => { streamRef.current?.getTracks().forEach(t => t.stop()); setMode('guide'); }} className="w-full text-slate-400 text-sm py-2">
            ← Back
          </button>
        </div>
      )}

      {/* Preview */}
      {mode === 'preview' && (
        <div className="space-y-4">
          <div className="rounded-xl overflow-hidden border border-indigo-800">
            <img src={imageDataUrl} alt="Captured" className="w-full" />
          </div>
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-3 flex items-center gap-2">
            <span className="text-green-400">✅</span>
            <p className="text-green-300 text-sm">Photo watermarked with officer ID, timestamp & NCB branding</p>
          </div>
          <p className="text-slate-400 text-sm text-center">Verify both zones are visible and clear, then analyse.</p>
          <div className="flex gap-3">
            <button onClick={() => setMode('guide')} className="flex-1 py-3 bg-slate-700 rounded-xl text-slate-300 font-semibold hover:bg-slate-600">Retake</button>
            <button onClick={analyzePhoto} disabled={analyzing} className="flex-[2] py-3 bg-blue-600 hover:bg-blue-500 rounded-xl text-white font-bold flex items-center justify-center gap-2">
              {analyzing
                ? <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Analysing…</>
                : '🔬 Analyse Colour'}
            </button>
          </div>
        </div>
      )}

      {/* Result */}
      {mode === 'analyzed' && colorResult && (
        <div className="space-y-4">
          <img src={imageDataUrl} alt="Analysed" className="w-full rounded-xl border border-slate-700" />

          <div className={`rounded-xl border p-4 ${classColor[colorResult.classification]}`}>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 rounded-xl border-2 border-current flex-shrink-0 shadow-lg"
                style={{ backgroundColor: colorResult.hex }} />
              <div className="flex-1">
                <p className="font-bold text-xl flex items-center gap-2">
                  {classIcon[colorResult.classification]} {colorResult.classification}
                </p>
                <p className="text-xs opacity-80 mt-0.5">{colorResult.substance}</p>
              </div>
            </div>
            <div className="bg-black/20 rounded-lg p-2 mt-2">
              <p className="text-xs font-mono opacity-70">
                HSL: {colorResult.hsl?.h}° / {colorResult.hsl?.s}% / {colorResult.hsl?.l}%
                &nbsp;·&nbsp; Confidence: <strong>{colorResult.confidence}</strong>
              </p>
            </div>
          </div>

          {/* Color explanation */}
          <div className="bg-slate-800 rounded-xl p-3 border border-slate-700 flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg border border-slate-600 flex-shrink-0"
              style={{ backgroundColor: colorResult.hex }} />
            <div>
              <p className="text-xs text-slate-400">Detected colour after lighting correction</p>
              <p className="text-sm font-mono text-white">{colorResult.hex}</p>
            </div>
          </div>

          {/* Evidence Gallery */}
          <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm">
            <EvidenceGallery
              photos={testData.evidencePhotos || []}
              onAddPhoto={(photo) => {
                const current = testData.evidencePhotos || [];
                update({ evidencePhotos: [...current, photo] });
              }}
              onRemovePhoto={(id) => {
                const current = testData.evidencePhotos || [];
                update({ evidencePhotos: current.filter(p => p.id !== id) });
              }}
            />
          </div>

          <button onClick={onNext} className="w-full py-4 rounded-2xl font-bold text-white text-base active:scale-95 transition-all shadow-md" style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
            Proceed to Review & Sign →
          </button>
          <button onClick={() => setMode('guide')} className="w-full text-gray-400 text-sm py-1 underline text-center">
            Retake Primary Photo
          </button>
        </div>
      )}
    </div>
  );
}
