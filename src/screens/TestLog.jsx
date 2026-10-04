import React, { useState } from 'react';
import { getTests } from '../utils/storage';

const CLS_STYLE = {
  POSITIVE:     { bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', badge: '#fee2e2', badgeText: '#991b1b', icon: '⚠️' },
  NEGATIVE:     { bg: 'linear-gradient(135deg,#14532d,#16a34a)', badge: '#dcfce7', badgeText: '#166534', icon: '✅' },
  INCONCLUSIVE: { bg: 'linear-gradient(135deg,#78350f,#d97706)', badge: '#fef3c7', badgeText: '#92400e', icon: '❓' },
};

export default function TestLog({ navigate }) {
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('ALL');

  const allTests = getTests().reverse();
  const FILTERS = ['ALL', 'POSITIVE', 'NEGATIVE', 'INCONCLUSIVE'];

  const filtered = allTests.filter(t => {
    const matchesFilter = filter === 'ALL' || t.classification === filter;
    const q = query.toLowerCase();
    const matchesQuery = !q ||
      t.recordId?.toLowerCase().includes(q) ||
      t.operator?.name?.toLowerCase().includes(q) ||
      t.detectedSubstance?.toLowerCase().includes(q) ||
      t.testKit?.toLowerCase().includes(q) ||
      t.caseDetails?.caseNumber?.toLowerCase().includes(q) ||
      t.caseDetails?.suspectName?.toLowerCase().includes(q);
    return matchesFilter && matchesQuery;
  });

  return (
    <div className="px-5 pt-2 pb-2 space-y-4">

      {/* Search */}
      <div className="flex items-center gap-2 rounded-2xl px-4 py-3 bg-white border border-gray-200 shadow-sm">
        <span className="text-gray-400">🔍</span>
        <input
          type="search"
          placeholder="Search by ID, officer, substance…"
          value={query}
          onChange={e => setQuery(e.target.value)}
          className="flex-1 bg-transparent text-sm text-gray-700 placeholder-gray-400 focus:outline-none"
        />
      </div>

      {/* Filter Pills */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(f => {
          const cls = CLS_STYLE[f];
          return (
            <button key={f} onClick={() => setFilter(f)}
              className="flex-shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all"
              style={filter === f
                ? (f === 'ALL' ? { background: '#0f172a', color: 'white' }
                   : f === 'POSITIVE' ? { background: '#dc2626', color: 'white' }
                   : f === 'NEGATIVE' ? { background: '#16a34a', color: 'white' }
                   : { background: '#d97706', color: 'white' })
                : { background: 'white', color: '#6b7280', border: '1.5px solid #e5e7eb' }}
            >
              {f === 'POSITIVE' ? '⚠️ ' : f === 'NEGATIVE' ? '✅ ' : f === 'INCONCLUSIVE' ? '❓ ' : ''}{f}
            </button>
          );
        })}
      </div>

      <p className="text-xs font-medium text-gray-400">{filtered.length} record{filtered.length !== 1 ? 's' : ''}</p>

      {/* Records */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center shadow-sm border border-gray-100">
          <p className="text-4xl mb-2">🔍</p>
          <p className="text-gray-400 text-sm">No records match</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map(test => {
            const cls = CLS_STYLE[test.classification] || CLS_STYLE.INCONCLUSIVE;
            return (
              <div
                key={test.recordId}
                onClick={() => navigate('result', test)}
                className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
              >
                {/* Color accent top bar */}
                <div className="h-1.5" style={{ background: cls.bg }} />
                <div className="p-4 flex items-start gap-3">
                  <div className="w-10 h-10 rounded-2xl flex-shrink-0 border border-gray-100"
                    style={{ background: cls.bg }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-xs font-mono text-gray-400">{test.recordId}</p>
                      <span className="text-xs font-bold px-2.5 py-1 rounded-full flex-shrink-0"
                        style={{ background: cls.badge, color: cls.badgeText }}>
                        {test.classification}
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-gray-800 mt-0.5 truncate">{test.detectedSubstance || 'Unknown'}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <p className="text-xs text-gray-400">{test.testKit}</p>
                      <span className="text-gray-300">·</span>
                      <p className="text-xs text-gray-400">{new Date(test.timestamp).toLocaleDateString('en-IN')}</p>
                    </div>
                    {test.caseDetails?.caseNumber && test.caseDetails.caseNumber !== 'Not provided' && (
                      <p className="text-xs text-gray-400 mt-0.5">📂 {test.caseDetails.caseNumber}</p>
                    )}
                    <p className="text-xs font-mono text-gray-300 mt-1 truncate">🔒 {test.imageHash?.slice(0, 20)}…</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
