import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { generateRecord } from '../utils/recordGenerator';
import { saveTest } from '../utils/storage';
import { exportToPDF } from '../utils/pdfExport';
import { toast } from '../utils/toast';
import SignaturePad from '../components/SignaturePad';
import { REAGENT_KITS } from '../data/colorRanges';

export default function Step5_Review({ operator, testData, navigate }) {
  const [submitting, setSubmitting] = useState(false);
  const [record, setRecord] = useState(null);
  const [signatureDataUrl, setSignatureDataUrl] = useState(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState(null);
  const [error, setError] = useState('');

  const kitName = REAGENT_KITS[testData.kitType]?.name || testData.kitType;

  const classStyle = {
    POSITIVE: { bg: 'bg-red-50', border: 'border-red-300', text: 'text-red-700', icon: '⚠️' },
    NEGATIVE: { bg: 'bg-green-50', border: 'border-green-300', text: 'text-green-700', icon: '✅' },
    INCONCLUSIVE: { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: '❓' },
  };
  const cls = classStyle[testData.colorResult?.classification || 'INCONCLUSIVE'];

  const handleLockRecord = async () => {
    if (!signatureDataUrl) {
      toast('Please provide your signature before locking', 'warning');
      return;
    }

    setSubmitting(true);
    setError('');
    toast('Cryptographically sealing record…', 'info', 2000);

    try {
      const { record: rec, imageDataUrl, selfieDataUrl } = await generateRecord({
        operator,
        testKit: kitName,
        kitBrand: testData.kitBrand,
        kitExpiry: testData.kitExpiry,
        colorResult: testData.colorResult,
        imageDataUrl: testData.imageDataUrl,
        selfieDataUrl: operator?.selfie,
        voiceNote: testData.voiceNote,
        caseNumber: testData.caseNumber,
        suspectName: testData.suspectName,
        incidentLocation: testData.incidentLocation,
        signatureDataUrl,
        evidencePhotos: testData.evidencePhotos || [],
        batchId: testData.batchId,
      });

      // Generate QR code for immediate on-screen verification
      const qrPayload = JSON.stringify({
        id: rec.recordId,
        res: rec.classification,
        officer: rec.operator?.name,
        time: rec.timestamp,
      });
      const qrData = await QRCode.toDataURL(qrPayload, { width: 140, margin: 1 });
      setQrCodeDataUrl(qrData);

      saveTest(rec);
      setRecord({ ...rec, imageDataUrl, selfieDataUrl, signatureDataUrl, evidencePhotos: testData.evidencePhotos || [] });

      toast(`Record ${rec.recordId} signed & sealed! ✅`, 'success', 4000);
    } catch (e) {
      setError('Failed to seal record: ' + e.message);
      toast('Record sealing failed', 'error');
    }
    setSubmitting(false);
  };

  const handleExportPDF = () => {
    if (record) {
      exportToPDF(record, record.imageDataUrl, record.selfieDataUrl, signatureDataUrl, record.evidencePhotos);
      toast('PDF report downloaded', 'success');
    }
  };

  // Locked View
  if (record) {
    return (
      <div className="space-y-4 pb-12">
        <div className="text-center py-2">
          <div className="w-16 h-16 rounded-3xl bg-green-100 text-green-700 flex items-center justify-center text-3xl mx-auto mb-2 border border-green-200">
            🔒
          </div>
          <h2 className="text-xl font-bold text-gray-900">Record Sealed & Signed</h2>
          <p className="text-gray-400 text-xs mt-0.5">Tamper-evident chain of custody initialized</p>
        </div>

        {/* QR Code Card */}
        {qrCodeDataUrl && (
          <div className="bg-white rounded-3xl p-5 shadow-sm border border-gray-100 flex items-center gap-4">
            <img src={qrCodeDataUrl} alt="Verification QR" className="w-24 h-24 rounded-xl border border-gray-100 p-1 bg-white" />
            <div className="flex-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                Verification QR
              </span>
              <p className="text-sm font-bold text-gray-900 mt-1 font-mono">{record.recordId}</p>
              <p className="text-xs text-gray-400 mt-0.5">Scan to cross-verify this official record in court</p>
            </div>
          </div>
        )}

        {/* Summary Card */}
        <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-100 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-gray-400">Classification</span>
            <span className="font-bold text-sm px-2.5 py-0.5 rounded-full bg-red-100 text-red-700">
              {record.classification}
            </span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Timestamp</span>
            <span className="text-gray-700 font-medium">{new Date(record.timestamp).toLocaleTimeString('en-IN')}</span>
          </div>
          <div className="flex justify-between text-xs">
            <span className="text-gray-400">Officer Signature</span>
            <span className="text-green-600 font-semibold">✓ Cryptographically Locked</span>
          </div>
          <div className="pt-2 border-t border-gray-100">
            <p className="text-[11px] font-mono text-gray-400 truncate">{record.imageHash}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleExportPDF}
            className="w-full py-4 rounded-2xl font-bold text-white flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
          >
            📄 Download Official Court PDF
          </button>
          <button
            onClick={() => navigate('result', record)}
            className="w-full py-3.5 rounded-2xl font-bold text-gray-700 bg-white border border-gray-200 active:scale-95 transition-all text-sm"
          >
            View Full Record & Chain of Custody
          </button>
          <button
            onClick={() => navigate('dashboard')}
            className="w-full py-2 text-xs text-gray-400 underline text-center"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Pre-Lock Review View
  return (
    <div className="space-y-4 pb-12">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Step 5: Review & Sign</h2>
        <p className="text-gray-400 text-sm mt-0.5">Verify findings and sign on-device to lock the record.</p>
      </div>

      {/* Main Image View */}
      {testData.imageDataUrl && (
        <div className="rounded-3xl overflow-hidden border border-gray-200 shadow-sm">
          <img src={testData.imageDataUrl} alt="Reaction" className="w-full" />
        </div>
      )}

      {/* Evidence Photos Strip */}
      {testData.evidencePhotos && testData.evidencePhotos.length > 0 && (
        <div className="bg-white rounded-3xl p-3 border border-gray-100 shadow-sm">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2 px-1">
            Supporting Evidence ({testData.evidencePhotos.length})
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {testData.evidencePhotos.map(p => (
              <div key={p.id} className="relative rounded-xl overflow-hidden w-20 h-20 flex-shrink-0 border border-gray-100">
                <img src={p.dataUrl} alt="" className="w-full h-full object-cover" />
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[9px] text-white px-1 py-0.5 truncate">
                  {p.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Classification Card */}
      {testData.colorResult && (
        <div className={`rounded-3xl border p-4 ${cls.bg} ${cls.border}`}>
          <div className="flex items-center gap-3">
            <span className="text-2xl">{cls.icon}</span>
            <div>
              <p className={`font-bold text-base ${cls.text}`}>{testData.colorResult.classification}</p>
              <p className={`text-xs ${cls.text} opacity-85`}>{testData.colorResult.substance}</p>
            </div>
          </div>
        </div>
      )}

      {/* Details Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm divide-y divide-gray-50 text-xs">
        <div className="p-3 flex justify-between">
          <span className="text-gray-400">Conducting Officer</span>
          <span className="font-semibold text-gray-800">{operator?.name} ({operator?.badgeId})</span>
        </div>
        <div className="p-3 flex justify-between">
          <span className="text-gray-400">Test Reagent</span>
          <span className="font-semibold text-gray-800">{kitName}</span>
        </div>
        {testData.caseNumber && (
          <div className="p-3 flex justify-between">
            <span className="text-gray-400">Case / FIR No.</span>
            <span className="font-semibold text-gray-800">{testData.caseNumber}</span>
          </div>
        )}
        {testData.suspectName && (
          <div className="p-3 flex justify-between">
            <span className="text-gray-400">Suspect</span>
            <span className="font-semibold text-gray-800">{testData.suspectName}</span>
          </div>
        )}
      </div>

      {/* Signature Section */}
      <div className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-2">
        <p className="text-xs font-bold text-gray-700 uppercase tracking-wider">
          Officer Digital Signature <span className="text-red-500">*</span>
        </p>
        <SignaturePad
          onSave={(data) => setSignatureDataUrl(data)}
          onClear={() => setSignatureDataUrl(null)}
        />
      </div>

      {error && <p className="text-xs text-red-500 text-center">{error}</p>}

      {/* Legal Lock Statement */}
      <div className="rounded-2xl p-3 bg-amber-50 border border-amber-200 text-amber-800 text-[11px] leading-relaxed">
        By signing, I attest that the above photograph and observations represent an authentic, unmanipulated test conducted in field conditions.
      </div>

      <button
        onClick={handleLockRecord}
        disabled={submitting || !signatureDataUrl || !testData.colorResult}
        className="w-full py-4 rounded-2xl font-bold text-white text-base active:scale-95 transition-all disabled:opacity-40 shadow-lg"
        style={{ background: 'linear-gradient(135deg,#166534,#15803d)' }}
      >
        {submitting ? 'Cryptographically Sealing…' : '🔒 Sign & Seal Official Record'}
      </button>
    </div>
  );
}
