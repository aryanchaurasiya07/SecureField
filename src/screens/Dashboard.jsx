import React from 'react';
import { getTests } from '../utils/storage';

// ── Kit icons (circle logos like "Explore by partner") ──────────────────────
const KIT_ICONS = [
  { key: 'marquis', label: 'Marquis',  bg: 'linear-gradient(135deg,#6366f1,#8b5cf6)', emoji: '🟣' },
  { key: 'mecke',   label: 'Mecke',    bg: 'linear-gradient(135deg,#0ea5e9,#06b6d4)', emoji: '🔵' },
  { key: 'scott',   label: 'Scott',    bg: 'linear-gradient(135deg,#10b981,#34d399)', emoji: '🟢' },
  { key: 'generic', label: 'Generic',  bg: 'linear-gradient(135deg,#f59e0b,#fbbf24)', emoji: '🟡' },
  { key: 'other',   label: 'Other',    bg: 'linear-gradient(135deg,#ef4444,#f97316)', emoji: '🔴' },
];

// ── Classification card colors ───────────────────────────────────────────────
const CLS_STYLE = {
  POSITIVE:    { bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', icon: '⚠️' },
  NEGATIVE:    { bg: 'linear-gradient(135deg,#14532d,#16a34a)', icon: '✅' },
  INCONCLUSIVE:{ bg: 'linear-gradient(135deg,#78350f,#d97706)', icon: '❓' },
};

export default function Dashboard({ operator, navigate }) {
  const tests = getTests();
  const today = tests.filter(t => new Date(t.timestamp).toDateString() === new Date().toDateString());
  const recent = [...tests].reverse().slice(0, 5);

  const stats = [
    { label: 'Today',     value: today.length,                                          bg: 'linear-gradient(135deg,#1e3a5f,#2563eb)', emoji: '📅' },
    { label: 'Total',     value: tests.length,                                          bg: 'linear-gradient(135deg,#3730a3,#6366f1)', emoji: '🔬' },
    { label: 'Positive',  value: tests.filter(t=>t.classification==='POSITIVE').length,  bg: 'linear-gradient(135deg,#7f1d1d,#dc2626)', emoji: '⚠️' },
    { label: 'Negative',  value: tests.filter(t=>t.classification==='NEGATIVE').length,  bg: 'linear-gradient(135deg,#14532d,#16a34a)', emoji: '✅' },
  ];

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = operator?.name?.split(' ')[0] || 'Officer';

  return (
    <div className="px-0 pt-2 space-y-6">

      {/* ── Hero Card (like "This month's challenge") ───────────────────── */}
      <div className="px-5">
        <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-3">{greeting}, {firstName}</p>
        <div
          className="relative rounded-3xl overflow-hidden cursor-pointer active:scale-[0.98] transition-transform"
          style={{ background: 'linear-gradient(145deg,#0f2027,#203a43,#2c5364)', minHeight: 180 }}
          onClick={() => navigate('new-test')}
        >
          {/* Subtle glow circles */}
          <div className="absolute -top-8 -right-8 w-40 h-40 rounded-full opacity-20" style={{ background: 'radial-gradient(circle,#38bdf8,transparent)' }} />
          <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-10" style={{ background: 'radial-gradient(circle,#818cf8,transparent)' }} />

          <div className="relative p-5">
            {/* Icon */}
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center text-2xl mb-8 border border-white/20">
              🧪
            </div>
            {/* Text */}
            <p className="text-white font-bold text-xl leading-tight">Start a New Field Test</p>
            <p className="text-blue-200 text-sm mt-1">{today.length > 0 ? `${today.length} test${today.length!==1?'s':''} conducted today` : 'Tap to begin a drug test'}</p>
          </div>

          {/* Arrow */}
          <div className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/10 flex items-center justify-center">
            <span className="text-white text-sm">→</span>
          </div>
        </div>

        {/* Batch Operations Quick Trigger */}
        <div
          onClick={() => navigate('batch')}
          className="mt-3 bg-white rounded-2xl p-3.5 flex items-center justify-between shadow-sm border border-gray-100 cursor-pointer active:scale-[0.98] transition-transform"
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center text-lg">
              📦
            </div>
            <div>
              <p className="text-xs font-bold text-gray-800">Batch Seizures & Raids</p>
              <p className="text-[11px] text-gray-400">Group multiple suspect tests under one FIR</p>
            </div>
          </div>
          <span className="text-gray-300 text-sm font-bold">›</span>
        </div>
      </div>

      {/* ── Recent Tests (like "Featured Missions") ─────────────────────── */}
      <div>
        <div className="px-5 flex items-center justify-between mb-3">
          <p className="text-lg font-bold text-gray-900">Recent Tests</p>
          {tests.length > 0 && (
            <button onClick={() => navigate('log')} className="text-blue-500 text-sm font-medium">See all</button>
          )}
        </div>

        {tests.length === 0 ? (
          <div className="mx-5 rounded-3xl bg-white p-8 text-center shadow-sm border border-gray-100">
            <p className="text-4xl mb-3">🧪</p>
            <p className="text-gray-500 text-sm font-medium">No tests yet</p>
            <p className="text-gray-400 text-xs mt-1">Tap the + button to start</p>
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto px-5 pb-1 snap-x snap-mandatory">
            {recent.map(test => {
              const cls = CLS_STYLE[test.classification] || CLS_STYLE.INCONCLUSIVE;
              return (
                <div
                  key={test.recordId}
                  onClick={() => navigate('result', test)}
                  className="flex-shrink-0 w-44 rounded-3xl overflow-hidden cursor-pointer active:scale-95 transition-transform snap-start"
                  style={{ background: cls.bg }}
                >
                  <div className="p-4 flex flex-col" style={{ minHeight: 180 }}>
                    {/* Top icon */}
                    <div className="w-10 h-10 rounded-2xl bg-white/15 flex items-center justify-center text-xl mb-auto border border-white/20">
                      {cls.icon}
                    </div>
                    {/* Bottom text */}
                    <div className="mt-8">
                      <p className="text-white font-bold text-sm leading-tight">{test.classification}</p>
                      <p className="text-white/70 text-xs mt-0.5">{test.testKit?.replace(' Reagent', '')}</p>
                      <p className="text-white/50 text-xs mt-1 font-mono">{test.recordId?.split('-').slice(-1)[0]}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Reagent Kits (like "Explore by partner") ────────────────────── */}
      <div>
        <div className="px-5 mb-3">
          <p className="text-lg font-bold text-gray-900">Reagent Kits</p>
        </div>
        <div className="flex gap-3 overflow-x-auto px-5 pb-1">
          {KIT_ICONS.map(kit => (
            <div key={kit.key} className="flex-shrink-0 flex flex-col items-center gap-1.5">
              <div
                className="w-14 h-14 rounded-full flex items-center justify-center text-2xl shadow-md border-2 border-white"
                style={{ background: kit.bg }}
              >
                {kit.emoji}
              </div>
              <p className="text-xs font-medium text-gray-500 text-center">{kit.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Quick Stats (like "Explore by careers") ──────────────────────── */}
      <div>
        <div className="px-5 mb-3">
          <p className="text-lg font-bold text-gray-900">Quick Stats</p>
        </div>
        <div className="grid grid-cols-2 gap-3 px-5">
          {stats.map(s => (
            <div
              key={s.label}
              className="bg-white rounded-2xl p-4 flex items-center gap-3 shadow-sm border border-gray-100 active:scale-[0.97] transition-transform"
            >
              <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl flex-shrink-0"
                style={{ background: s.bg }}>
                {s.emoji}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{s.value}</p>
                <p className="text-xs text-gray-400 font-medium">{s.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Disclaimer ───────────────────────────────────────────────────── */}
      <div className="mx-5 mb-6 rounded-2xl p-3 flex items-center gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
        <span className="text-xl">⚠️</span>
        <p className="text-xs text-yellow-700 font-medium leading-relaxed">
          All results are <strong>presumptive only</strong> — lab confirmation required.
        </p>
      </div>

    </div>
  );
}
