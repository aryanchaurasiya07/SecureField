import React, { useState } from 'react';
import { getOperator, clearOperator, getTests } from '../utils/storage';
import { toast } from '../utils/toast';

export default function VerifyScreen({ navigate }) {
  const [recordId, setRecordId] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [result, setResult] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const fileRef = React.useRef(null);

  const handleFile = (e) => {
    const file = e.target.files[0]; if (!file) return;
    setImageFile(file); setResult(null);
    const reader = new FileReader();
    reader.onload = ev => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const computeHash = async (dataUrl) => {
    const base64 = dataUrl.split(',')[1];
    const binary = atob(base64);
    const buffer = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) buffer[i] = binary.charCodeAt(i);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    return 'sha256:' + Array.from(new Uint8Array(hashBuffer)).map(b=>b.toString(16).padStart(2,'0')).join('');
  };

  const handleVerify = async () => {
    if (!recordId.trim()) { toast('Enter a Record ID', 'warning'); return; }
    if (!imageFile) { toast('Select an image', 'warning'); return; }
    setVerifying(true);
    try {
      const tests = getTests();
      const record = tests.find(t => t.recordId.trim() === recordId.trim());
      if (!record) { setResult({ status: 'not_found' }); setVerifying(false); return; }
      const computedHash = await computeHash(imagePreview);
      setResult({ status: computedHash === record.imageHash ? 'valid' : 'tampered', computedHash, storedHash: record.imageHash, record });
    } catch(e) { toast('Verification error: ' + e.message, 'error'); }
    setVerifying(false);
  };

  return (
    <div className="px-5 pt-2 pb-6 space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 sr-only">Verify Record</h2>
        <p className="text-gray-400 text-sm">Re-upload an image to verify it hasn't been tampered with.</p>
      </div>

      {/* How it works */}
      <div className="rounded-3xl p-4" style={{ background: '#eff6ff', border: '1px solid #bfdbfe' }}>
        <p className="text-blue-700 text-xs font-bold mb-1">How this works</p>
        <p className="text-blue-600 text-xs leading-relaxed">The app re-computes a SHA-256 fingerprint of the image and compares it to the one locked in the original record. Even a single pixel change produces a completely different hash.</p>
      </div>

      {/* Step 1 */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step 1 — Enter Record ID</p>
        <input type="text" placeholder="e.g. NCB-SF-2026-00001" value={recordId}
          onChange={e => { setRecordId(e.target.value); setResult(null); }}
          className="w-full rounded-2xl px-4 py-3.5 text-gray-900 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }} />
      </div>

      {/* Step 2 */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Step 2 — Upload Test Image</p>
        <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
        {imagePreview ? (
          <div className="relative rounded-3xl overflow-hidden border border-gray-200">
            <img src={imagePreview} alt="Upload" className="w-full" />
            <button onClick={() => { setImagePreview(null); setImageFile(null); setResult(null); }}
              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center text-sm font-bold shadow">✕</button>
          </div>
        ) : (
          <button onClick={() => fileRef.current.click()}
            className="w-full rounded-3xl py-10 flex flex-col items-center gap-2 transition-colors"
            style={{ background: 'white', border: '2px dashed #cbd5e1' }}>
            <span className="text-4xl">📂</span>
            <p className="text-gray-500 text-sm font-medium">Tap to upload image</p>
          </button>
        )}
      </div>

      <button onClick={handleVerify} disabled={verifying || !imageFile || !recordId}
        className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
        {verifying
          ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Verifying…</>
          : '🔍 Verify Integrity'}
      </button>

      {result && (
        <div className="rounded-3xl p-5 border"
          style={result.status==='valid' ? { background:'#f0fdf4',borderColor:'#86efac' }
               : result.status==='tampered' ? { background:'#fef2f2',borderColor:'#fca5a5' }
               : { background:'#f8fafc',borderColor:'#e2e8f0' }}>
          {result.status === 'not_found' && (
            <><p className="font-bold text-gray-700 text-lg">❓ Record Not Found</p>
            <p className="text-gray-500 text-sm mt-1">No record with ID <span className="font-mono">{recordId}</span> found.</p></>
          )}
          {result.status === 'valid' && (
            <><p className="font-bold text-green-700 text-lg">✅ Integrity Verified</p>
            <p className="text-green-600 text-sm mt-1">The image is identical to the original. Record has NOT been tampered with.</p>
            <p className="text-green-500 text-xs font-mono mt-3 break-all">{result.storedHash}</p></>
          )}
          {result.status === 'tampered' && (
            <><p className="font-bold text-red-700 text-lg">🚨 Tampering Detected</p>
            <p className="text-red-600 text-sm mt-1">The image does NOT match the original. It has been altered.</p>
            <div className="mt-3 space-y-2">
              <div><p className="text-xs font-bold text-red-500">Stored (Original):</p><p className="text-xs font-mono text-red-400 break-all">{result.storedHash}</p></div>
              <div><p className="text-xs font-bold text-red-500">Computed (Uploaded):</p><p className="text-xs font-mono text-red-400 break-all">{result.computedHash}</p></div>
            </div></>
          )}
        </div>
      )}
    </div>
  );
}
