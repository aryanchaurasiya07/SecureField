import React from 'react';

function Card({ children }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">{children}</div>
  );
}

export default function Step1_Selfie({ operator, testData, update, onNext }) {


  return (
    <div className="space-y-4 pb-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Identity Verification</h2>
        <p className="text-gray-400 text-sm mt-1">Confirm the operating officer before beginning.</p>
      </div>

      {/* Officer Card */}
      <Card>
        {operator?.selfie && (
          <img src={operator.selfie} alt="Officer" className="w-full h-32 object-cover object-top" />
        )}
        <div className="p-4 flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl flex-shrink-0"
            style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
            {operator?.selfie ? '✓' : '👤'}
          </div>
          <div>
            <p className="text-gray-900 font-bold">{operator?.name}</p>
            <p className="text-blue-500 text-sm">{operator?.badgeId}</p>
          </div>
          <div className="ml-auto">
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full" style={{ background: '#dcfce7', color: '#166534' }}>✓ Active</span>
          </div>
        </div>
      </Card>

      {/* Auto-captured info */}
      <Card>
        <div className="p-4 space-y-3">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Auto-Captured</p>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-base">🕐</div>
            <div>
              <p className="text-xs text-gray-400">Timestamp</p>
              <p className="text-sm font-semibold text-gray-800">{new Date().toLocaleString('en-IN')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center text-base">📍</div>
            <div>
              <p className="text-xs text-gray-400">GPS Location</p>
              <p className="text-sm font-semibold text-gray-500">Captured on record generation</p>
            </div>
          </div>
        </div>
      </Card>

      {/* Confirm */}
      <label className="flex items-start gap-3 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 cursor-pointer">
        <input
          type="checkbox"
          checked={testData.selfieConfirmed}
          onChange={e => update({ selfieConfirmed: e.target.checked })}
          className="mt-0.5 w-5 h-5 accent-blue-600 rounded"
        />
        <p className="text-sm text-gray-600 leading-relaxed">
          I confirm I am <strong className="text-gray-900">{operator?.name}</strong> ({operator?.badgeId}) and am conducting this test in my official capacity.
        </p>
      </label>

      <button
        onClick={onNext}
        disabled={!testData.selfieConfirmed}
        className="w-full py-4 rounded-2xl font-bold text-white text-base transition-all active:scale-95 disabled:opacity-40"
        style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}
      >
        Confirm Identity →
      </button>
    </div>
  );
}
