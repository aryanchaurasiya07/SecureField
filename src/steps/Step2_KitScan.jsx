import React, { useState } from 'react';
import { REAGENT_KITS } from '../data/colorRanges';

export default function Step2_KitScan({ testData, update, onNext }) {
  const [scanning, setScanning] = useState(false);
  const [kitBrand, setKitBrand] = useState(testData.kitBrand || '');
  const [kitExpiry, setKitExpiry] = useState(testData.kitExpiry || '');
  const [scanned, setScanned] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);

  const simulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      const brand = 'NIK Test Kit — Type A'; const expiry = '2027-06';
      setKitBrand(brand); setKitExpiry(expiry);
      update({ kitBrand: brand, kitExpiry: expiry });
      setScanning(false); setScanned(true);
    }, 1500);
  };

  const isExpired = kitExpiry && new Date(kitExpiry + '-01') < new Date();

  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Test Kit Identification</h2>
        <p className="text-gray-400 text-sm mt-1">Select reagent type and verify kit details.</p>
      </div>

      {/* Reagent selector */}
      <div>
        <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reagent Type</p>
        <div className="grid grid-cols-2 gap-2">
          {Object.entries(REAGENT_KITS).map(([key, kit]) => (
            <button key={key} onClick={() => update({ kitType: key })}
              className="p-3 rounded-2xl border-2 text-left transition-all active:scale-95"
              style={testData.kitType === key
                ? { borderColor: '#2563eb', background: '#eff6ff' }
                : { borderColor: '#e5e7eb', background: 'white' }}>
              <p className="text-sm font-bold text-gray-800">{kit.name}</p>
              <p className="text-xs text-gray-400 mt-0.5">{kit.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Barcode scan */}
      {!scanned && !manualEntry && (
        <div className="space-y-2">
          <button onClick={simulateScan} disabled={scanning}
            className="w-full bg-white border-2 border-dashed border-gray-300 rounded-3xl py-8 flex flex-col items-center gap-2 hover:border-blue-400 transition-colors">
            {scanning
              ? <><div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" /><p className="text-gray-500 text-sm">Scanning…</p></>
              : <><span className="text-4xl">📦</span><p className="text-gray-600 font-semibold text-sm">Scan Kit Barcode</p><p className="text-gray-400 text-xs">Point camera at barcode</p></>}
          </button>
          <button onClick={() => setManualEntry(true)} className="w-full text-blue-500 text-sm font-medium py-2">Enter manually instead</button>
        </div>
      )}

      {/* Manual entry */}
      {manualEntry && !scanned && (
        <div className="space-y-3">
          <input type="text" placeholder="Kit brand / name" value={kitBrand} onChange={e => setKitBrand(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }} />
          <input type="month" value={kitExpiry} onChange={e => setKitExpiry(e.target.value)}
            className="w-full rounded-2xl px-4 py-3.5 text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
            style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0' }} />
          <button onClick={() => { update({ kitBrand, kitExpiry }); setScanned(true); }}
            className="w-full py-3.5 rounded-2xl font-bold text-white" style={{ background: '#475569' }}>
            Save Kit Details
          </button>
        </div>
      )}

      {/* Scanned result */}
      {scanned && (
        <div className="rounded-3xl p-4 flex items-center gap-3 border"
          style={isExpired ? { background: '#fef2f2', borderColor: '#fca5a5' } : { background: '#f0fdf4', borderColor: '#86efac' }}>
          <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
            style={{ background: isExpired ? '#fee2e2' : '#dcfce7' }}>
            {isExpired ? '⚠️' : '✅'}
          </div>
          <div className="flex-1">
            <p className="font-bold text-sm" style={{ color: isExpired ? '#dc2626' : '#16a34a' }}>{isExpired ? 'EXPIRED KIT' : 'Kit Verified'}</p>
            <p className="text-xs text-gray-500">{kitBrand || testData.kitBrand}</p>
            <p className="text-xs text-gray-400">Expiry: {kitExpiry || testData.kitExpiry}</p>
          </div>
          <button onClick={() => setScanned(false)} className="text-gray-400 text-xs underline">Re-scan</button>
        </div>
      )}

      <button onClick={onNext}
        className="w-full py-4 rounded-2xl font-bold text-white text-base active:scale-95 transition-all"
        style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
        Continue →
      </button>
    </div>
  );
}
