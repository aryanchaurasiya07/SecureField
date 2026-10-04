import React, { useState } from 'react';
import { getBatches, saveBatch, generateBatchId, getTests } from '../utils/storage';
import { toast } from '../utils/toast';

export default function BatchTestScreen({ navigate }) {
  const [batches, setBatches] = useState(getBatches());
  const [showCreate, setShowCreate] = useState(false);
  const [incidentTitle, setIncidentTitle] = useState('');
  const [incidentLocation, setIncidentLocation] = useState('');
  const [caseNumber, setCaseNumber] = useState('');

  const allTests = getTests();

  const handleCreateBatch = () => {
    if (!incidentTitle.trim()) {
      toast('Please enter incident title', 'warning');
      return;
    }
    const batchId = generateBatchId();
    const newBatch = {
      batchId,
      title: incidentTitle.trim(),
      location: incidentLocation.trim() || 'Field Location',
      caseNumber: caseNumber.trim() || 'N/A',
      createdAt: new Date().toISOString(),
      testCount: 0,
    };
    saveBatch(newBatch);
    setBatches(getBatches());
    setShowCreate(false);
    setIncidentTitle('');
    setIncidentLocation('');
    setCaseNumber('');
    toast(`Batch ${batchId} created`, 'success');
  };

  const startTestInBatch = (batch) => {
    navigate('new-test', {
      batchId: batch.batchId,
      incidentLocation: batch.location,
      caseNumber: batch.caseNumber,
    });
  };

  return (
    <div className="px-5 pt-2 pb-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Batch Seizures</h2>
          <p className="text-gray-400 text-xs">Group multiple suspect tests under one operation</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-3.5 py-2 rounded-2xl bg-blue-600 text-white font-bold text-xs shadow-md active:scale-95"
        >
          ＋ New Batch
        </button>
      </div>

      {/* Create Modal */}
      {showCreate && (
        <div className="bg-white rounded-3xl p-5 border border-gray-100 shadow-sm space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Create Master Incident</p>
          <input
            type="text"
            placeholder="Operation / Incident Name (e.g. Checkpost Raid Alpha)"
            value={incidentTitle}
            onChange={e => setIncidentTitle(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
          />
          <input
            type="text"
            placeholder="FIR / Case Number (optional)"
            value={caseNumber}
            onChange={e => setCaseNumber(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
          />
          <input
            type="text"
            placeholder="Location of Seizure"
            value={incidentLocation}
            onChange={e => setIncidentLocation(e.target.value)}
            className="w-full bg-slate-50 border border-gray-200 rounded-xl px-3 py-2 text-sm text-gray-800"
          />
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => setShowCreate(false)}
              className="flex-1 py-2.5 bg-gray-100 rounded-xl text-xs font-bold text-gray-600"
            >
              Cancel
            </button>
            <button
              onClick={handleCreateBatch}
              className="flex-1 py-2.5 bg-blue-600 rounded-xl text-xs font-bold text-white"
            >
              Save Batch
            </button>
          </div>
        </div>
      )}

      {/* Batch Cards */}
      {batches.length === 0 ? (
        <div className="bg-white rounded-3xl p-8 text-center border border-gray-100 shadow-sm">
          <p className="text-3xl mb-2">📦</p>
          <p className="text-gray-500 font-semibold text-sm">No Active Batches</p>
          <p className="text-gray-400 text-xs mt-1">Create a batch to test multiple suspects under one FIR</p>
        </div>
      ) : (
        <div className="space-y-3">
          {batches.map(b => {
            const batchTests = allTests.filter(t => t.batchId === b.batchId);
            return (
              <div
                key={b.batchId}
                className="bg-white rounded-3xl p-4 border border-gray-100 shadow-sm space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[10px] font-mono text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full font-bold">
                      {b.batchId}
                    </span>
                    <h3 className="font-bold text-gray-800 text-base mt-1">{b.title}</h3>
                    <p className="text-xs text-gray-400">📍 {b.location} · {b.caseNumber}</p>
                  </div>
                  <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-gray-700 rounded-full">
                    {batchTests.length} tests
                  </span>
                </div>

                {/* Sub-tests preview */}
                {batchTests.length > 0 && (
                  <div className="flex gap-1.5 overflow-x-auto py-1">
                    {batchTests.map(t => (
                      <span
                        key={t.recordId}
                        onClick={() => navigate('result', t)}
                        className={`text-[10px] px-2 py-1 rounded-lg font-bold cursor-pointer flex-shrink-0 ${
                          t.classification === 'POSITIVE' ? 'bg-red-100 text-red-700' :
                          t.classification === 'NEGATIVE' ? 'bg-green-100 text-green-700' :
                          'bg-amber-100 text-amber-700'
                        }`}
                      >
                        {t.recordId.split('-').slice(-1)[0]}: {t.classification}
                      </span>
                    ))}
                  </div>
                )}

                <button
                  onClick={() => startTestInBatch(b)}
                  className="w-full py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold rounded-xl text-xs active:scale-95 transition-all"
                >
                  ＋ Conduct Test for this Batch
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
