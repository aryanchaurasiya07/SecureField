import React, { useState } from 'react';
import { getOperator, clearOperator, getTests } from '../utils/storage';
import { toast } from '../utils/toast';

export default function SettingsScreen({ navigate }) {
  const operator = getOperator();
  const tests = getTests();
  const [confirmClear, setConfirmClear] = useState(false);

  const handleLogout = () => { clearOperator(); toast('Logged out', 'info'); setTimeout(() => navigate('login'), 400); };

  const handleExportAll = () => {
    const blob = new Blob([JSON.stringify({ exportedAt: new Date().toISOString(), operator, records: tests }, null, 2)], { type: 'application/json' });
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
    a.download = `SecureField_Export_${new Date().toISOString().split('T')[0]}.json`; a.click();
    toast(`Exported ${tests.length} records`, 'success');
  };

  const handleCSV = () => {
    if (!tests.length) { toast('No records to export', 'warning'); return; }
    const headers = ['Record ID','Timestamp','Officer','Badge ID','Kit','Classification','Substance','Lat','Lng','Confidence','Hash'];
    const rows = tests.map(t => [t.recordId,t.timestamp,t.operator?.name,t.operator?.badgeId,t.testKit,t.classification,t.detectedSubstance,t.location?.latitude||'',t.location?.longitude||'',t.confidence,t.imageHash]);
    const csv = [headers,...rows].map(r=>r.map(v=>`"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
    const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv],{type:'text/csv'}));
    a.download = `SecureField_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    toast(`CSV exported`, 'success');
  };

  const handleClear = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.clear(); toast('All data cleared','warning'); setTimeout(()=>window.location.reload(),600);
  };

  const Section = ({ title, children }) => (
    <div>
      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">{title}</p>
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        {children}
      </div>
    </div>
  );

  const Row = ({ icon, label, sub, onClick, danger, chevron = true }) => (
    <button onClick={onClick}
      className="w-full flex items-center gap-3 px-4 py-4 border-b border-gray-50 last:border-0 text-left transition-colors active:bg-gray-50"
    >
      <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
        style={{ background: danger ? '#fee2e2' : '#f1f5f9' }}>
        {icon}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${danger ? 'text-red-500' : 'text-gray-800'}`}>{label}</p>
        {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
      </div>
      {chevron && <span className="text-gray-300 text-sm">›</span>}
    </button>
  );

  return (
    <div className="px-5 pt-2 pb-4 space-y-5">

      {/* Officer Profile Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 flex items-center gap-4">
        {operator?.selfie ? (
          <img src={operator.selfie} alt="" className="w-16 h-16 rounded-full object-cover border-2 border-gray-100 shadow" />
        ) : (
          <div className="w-16 h-16 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-2xl">
            {operator?.name?.[0]?.toUpperCase() || 'O'}
          </div>
        )}
        <div>
          <p className="text-gray-900 font-bold text-lg leading-tight">{operator?.name || 'Unknown'}</p>
          <p className="text-blue-500 text-sm font-medium">{operator?.badgeId || 'N/A'}</p>
          <p className="text-gray-400 text-xs mt-1">{tests.length} test{tests.length!==1?'s':''} conducted</p>
        </div>
      </div>

      <Section title="Application">
        <Row icon="🧪" label="SecureField v1.0" sub="NCB Digital Field Test Companion" onClick={() => {}} />
        <Row icon="📊" label={`${tests.length} Records Stored`} sub="Tamper-evident digital records" onClick={() => navigate('log')} />
        <Row icon="🔒" label="SHA-256 Encryption" sub="Web Crypto API · On-device processing" onClick={() => {}} chevron={false} />
      </Section>

      <Section title="Export & Backup">
        <Row icon="📄" label="Export as JSON" sub="Full tamper-evident backup" onClick={handleExportAll} />
        <Row icon="📊" label="Export as CSV" sub="For spreadsheet analysis" onClick={handleCSV} />
      </Section>

      <Section title="Integrity Tools">
        <Row icon="🔍" label="Verify Record Integrity" sub="Detect image tampering" onClick={() => navigate('verify')} />
      </Section>

      <Section title="Account">
        <Row icon="🚪" label="Change Operator / Logout" sub="Return to login screen" onClick={handleLogout} danger={false} />
        <Row icon="🗑️" label={confirmClear ? '⚠️ Tap again — cannot undo!' : 'Clear All Data'} sub={confirmClear ? 'All records will be deleted permanently' : 'Delete all records from this device'} onClick={handleClear} danger />
      </Section>

      <div className="rounded-2xl p-4 text-xs text-yellow-700 leading-relaxed" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <strong>Legal Notice:</strong> All field test results are presumptive and must be confirmed by an accredited laboratory before use as evidence.
      </div>
    </div>
  );
}
