import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { exportToPDF } from '../utils/pdfExport';
import { addCustodyAction } from '../utils/storage';
import { toast } from '../utils/toast';

const CLS = {
  POSITIVE:     { bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', badge: '#fee2e2', badgeText: '#991b1b', icon: '⚠️', label: 'POSITIVE' },
  NEGATIVE:     { bg: 'linear-gradient(135deg,#14532d,#16a34a)', badge: '#dcfce7', badgeText: '#166534', icon: '✅', label: 'NEGATIVE' },
  INCONCLUSIVE: { bg: 'linear-gradient(135deg,#78350f,#d97706)', badge: '#fef3c7', badgeText: '#92400e', icon: '❓', label: 'INCONCLUSIVE' },
};

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-start gap-3 py-3 border-b border-gray-100 last:border-0">
      <span className="text-base w-6 text-center flex-shrink-0">{icon}</span>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm text-gray-800 mt-0.5 break-words">{value || '—'}</p>
      </div>
    </div>
  );
}

export default function ResultScreen({ record: initialRecord, navigate }) {
  const [record, setRecord] = useState(initialRecord);
  const [exporting, setExporting] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);
  const [showCustodyModal, setShowCustodyModal] = useState(false);
  const [custodyAction, setCustodyAction] = useState('SUPERVISOR_VERIFIED');
  const [custodyNotes, setCustodyNotes] = useState('');
  const [custodyOfficer, setCustodyOfficer] = useState('');

  useEffect(() => {
    if (!record) return;
    const payload = JSON.stringify({
      id: record.recordId,
      time: record.timestamp,
      hash: record.imageHash?.slice(0, 16),
      res: record.classification,
    });
    QRCode.toDataURL(payload, { width: 140, margin: 1 }).then(setQrDataUrl);
  }, [record]);

  if (!record) return (
    <div className="p-6 text-center">
      <p className="text-gray-400">No record selected.</p>
      <button onClick={() => navigate('dashboard')} className="mt-4 text-blue-500 underline text-sm">Go to Dashboard</button>
    </div>
  );

  const cls = CLS[record.classification] || CLS.INCONCLUSIVE;

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF(record, record.imageDataUrl, record.selfieDataUrl, record.signatureDataUrl, record.evidencePhotos || []);
    setExporting(false);
    toast('PDF report downloaded', 'success');
  };

  const handleAddCustody = () => {
    if (!custodyOfficer.trim()) {
      toast('Enter officer / handler name', 'warning');
      return;
    }
    const updated = addCustodyAction(record.recordId, {
      action: custodyAction,
      officer: custodyOfficer.trim(),
      notes: custodyNotes.trim(),
    });
    if (updated) {
      setRecord({ ...updated, imageDataUrl: record.imageDataUrl, signatureDataUrl: record.signatureDataUrl });
      setShowCustodyModal(false);
      setCustodyNotes('');
      setCustodyOfficer('');
      toast('Chain of custody updated', 'success');
    }
  };

  return (
    <div className="px-5 pt-2 pb-6 space-y-4">

      {/* Classification Hero Card */}
      <div className="rounded-3xl overflow-hidden shadow-md" style={{ background: cls.bg }}>
        <div className="p-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/20 flex items-center justify-center text-3xl flex-shrink-0">
            {cls.icon}
          </div>
          <div className="flex-1">
            <p className="text-white font-bold text-xl">{record.classification}</p>
            <p className="text-white/75 text-sm mt-0.5 leading-snug">{record.detectedSubstance}</p>
            <p className="text-white/50 text-xs mt-1">Confidence: {record.confidence}</p>
          </div>
          <div className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center flex-shrink-0"
            style={{ background: record.colorDetected?.hex || 'transparent' }} />
        </div>
      </div>

      {/* Verification QR Card */}
      {qrDataUrl && (
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex items-center gap-4">
          <img src={qrDataUrl} alt="QR" className="w-20 h-20 rounded-xl border border-gray-100 p-1" />
          <div className="flex-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
              Court Verification QR
            </span>
            <p className="text-sm font-bold text-gray-900 mt-1 font-mono">{record.recordId}</p>
            <p className="text-xs text-gray-400 mt-0.5">Scannable proof linking to cryptographic chain</p>
          </div>
        </div>
      )}

      {/* Test Image */}
      {record.imageDataUrl && (
        <div className="rounded-3xl overflow-hidden shadow-sm border border-gray-100">
          <img src={record.imageDataUrl} alt="Test" className="w-full" />
          <div className="bg-white px-4 py-3 flex items-center gap-2">
            <span className="text-green-600 text-sm">🔒</span>
            <p className="text-xs font-mono text-gray-400 truncate flex-1">{record.imageHash?.slice(0, 36)}…</p>
          </div>
        </div>
      )}

      {/* Supporting Evidence Gallery */}
      {record.evidencePhotos && record.evidencePhotos.length > 0 && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
            Supporting Evidence ({record.evidencePhotos.length})
          </p>
          <div className="grid grid-cols-3 gap-2">
            {record.evidencePhotos.map(p => (
              <div key={p.id} className="rounded-xl overflow-hidden aspect-square border border-gray-100 relative shadow-sm">
                <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-1 py-0.5 truncate">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Card */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 py-3 border-b border-gray-100">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Record Details</p>
        </div>
        <div className="px-4">
          <InfoRow icon="🔖" label="Record ID"  value={record.recordId} />
          {record.batchId && <InfoRow icon="📦" label="Batch / Incident" value={record.batchId} />}
          <InfoRow icon="🕐" label="Timestamp"  value={new Date(record.timestamp).toLocaleString('en-IN')} />
          <InfoRow icon="👤" label="Officer"    value={`${record.operator?.name} · ${record.operator?.badgeId}`} />
          <InfoRow icon="📍" label="GPS"        value={record.location?.latitude ? `${record.location.latitude.toFixed(5)}°N, ${record.location.longitude.toFixed(5)}°E (±${Math.round(record.location.accuracy || 0)}m)` : 'Unavailable'} />
          <InfoRow icon="🧪" label="Test Kit"   value={record.testKit} />
          <InfoRow icon="📦" label="Kit Brand"  value={record.kitBrand} />
          <InfoRow icon="⏳" label="Expiry"     value={record.kitExpiry} />
        </div>
      </div>

      {/* Case Details */}
      {record.caseDetails && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Case Details</p>
          </div>
          <div className="px-4">
            <InfoRow icon="📂" label="Case / FIR No." value={record.caseDetails.caseNumber} />
            <InfoRow icon="🧑" label="Suspect"        value={record.caseDetails.suspectName} />
            <InfoRow icon="📌" label="Incident Location" value={record.caseDetails.incidentLocation} />
          </div>
        </div>
      )}

      {/* Officer E-Signature */}
      {record.signatureDataUrl && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <div className="flex justify-between items-center mb-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Officer E-Signature</p>
            <span className="text-[10px] text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">✓ Verified</span>
          </div>
          <div className="rounded-xl border border-dashed border-gray-200 p-2 bg-slate-50 flex justify-center">
            <img src={record.signatureDataUrl} alt="Signature" className="h-16 object-contain" />
          </div>
          <p className="text-[11px] text-gray-400 mt-2 text-center">Digitally signed by {record.operator?.name}</p>
        </div>
      )}

      {/* Chain of Custody Timeline */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4 space-y-3">
        <div className="flex justify-between items-center">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Chain of Custody</p>
          <button
            onClick={() => setShowCustodyModal(true)}
            className="text-xs text-blue-600 font-bold bg-blue-50 px-2.5 py-1 rounded-full hover:bg-blue-100"
          >
            ＋ Add Transfer
          </button>
        </div>

        <div className="space-y-3 mt-2">
          {(record.chainOfCustody || []).map((c, i) => (
            <div key={c.actionId || i} className="flex gap-3 text-xs border-l-2 border-blue-500 pl-3 py-1">
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="font-bold text-gray-800">{c.action.replace('_', ' ')}</span>
                  <span className="text-gray-400">{new Date(c.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <p className="text-gray-500 mt-0.5">By: {c.officer}</p>
                {c.notes && <p className="text-gray-400 mt-0.5 italic">"{c.notes}"</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Custody Transfer Modal */}
      {showCustodyModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-5 max-w-sm w-full space-y-4 shadow-xl">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-gray-900 text-base">Record Custody Transfer</h3>
              <button onClick={() => setShowCustodyModal(false)} className="text-gray-400 font-bold">✕</button>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Transfer Action</label>
              <select
                value={custodyAction}
                onChange={e => setCustodyAction(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
              >
                <option value="SUPERVISOR_VERIFIED">Supervisor Verification</option>
                <option value="LAB_TRANSFER">Dispatched to Forensic Lab</option>
                <option value="EVIDENCE_LOCKER">Deposited in Malkhana / Locker</option>
                <option value="COURT_PRESENTATION">Presented in Court</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Receiving / Authorized Officer</label>
              <input
                type="text"
                placeholder="e.g. Insp. Sharma (NCB Malkhana)"
                value={custodyOfficer}
                onChange={e => setCustodyOfficer(e.target.value)}
                className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-gray-400 uppercase">Handover Notes / Receipt ID</label>
              <textarea
                placeholder="e.g. Sealed in envelope #402, handed to FSL courier"
                value={custodyNotes}
                onChange={e => setCustodyNotes(e.target.value)}
                rows={2}
                className="mt-1 w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800 resize-none"
              />
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowCustodyModal(false)}
                className="flex-1 py-3 bg-gray-100 rounded-xl text-xs font-bold text-gray-600"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCustody}
                className="flex-1 py-3 bg-blue-600 rounded-xl text-xs font-bold text-white"
              >
                Sign Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Voice Note */}
      {record.voiceNote && (
        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
          <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">🎙️ Field Notes</p>
          <p className="text-sm text-gray-700 leading-relaxed">{record.voiceNote}</p>
        </div>
      )}

      {/* Hash */}
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-4">
        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">🔏 Cryptographic Hash</p>
        <p className="text-xs font-mono text-green-600 break-all">{record.imageHash}</p>
        <p className="text-xs text-gray-400 mt-1">Tampering with the image invalidates this hash.</p>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button onClick={handleExport} disabled={exporting}
          className="flex-1 py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all disabled:opacity-50 shadow-md"
          style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
          {exporting ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : '📄'}
          Download Court PDF
        </button>
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(record, null, 2)], { type: 'application/json' });
            const a = document.createElement('a'); a.href = URL.createObjectURL(blob);
            a.download = `${record.recordId}.json`; a.click();
          }}
          className="flex-1 py-4 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 shadow-sm active:scale-95 transition-all text-sm"
        >
          JSON Export
        </button>
      </div>

      <button onClick={() => navigate('dashboard')} className="w-full py-2 text-gray-400 text-sm text-center">
        ← Back to Dashboard
      </button>
    </div>
  );
}
