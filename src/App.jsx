import React, { useState, useEffect } from 'react';
import LoginScreen from './screens/LoginScreen';
import Dashboard from './screens/Dashboard';
import NewTestFlow from './screens/NewTestFlow';
import ResultScreen from './screens/ResultScreen';
import TestLog from './screens/TestLog';
import SettingsScreen from './screens/SettingsScreen';
import VerifyScreen from './screens/VerifyScreen';
import BatchTestScreen from './screens/BatchTestScreen';
import { getOperator } from './utils/storage';

export default function App() {
  const [page, setPage] = useState('login');
  const [operator, setOperator] = useState(null);
  const [currentRecord, setCurrentRecord] = useState(null);

  useEffect(() => {
    const saved = getOperator();
    if (saved) { setOperator(saved); setPage('dashboard'); }
  }, []);

  const navigate = (target, data = null) => {
    if (data) setCurrentRecord(data);
    setPage(target);
    window.scrollTo(0, 0);
  };

  const showNav = !['login', 'new-test'].includes(page);

  return (
    <div className="min-h-screen max-w-md mx-auto relative" style={{ background: '#eef4f4' }}>

      {/* ── Header ── */}
      {page !== 'login' && (
        <header className="px-5 pt-6 pb-2 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              {page === 'dashboard' ? 'SecureField' :
               page === 'log'       ? 'Test Log' :
               page === 'settings'  ? 'Settings' :
               page === 'verify'    ? 'Verify Record' :
               page === 'batch'     ? 'Batch Testing' :
               page === 'result'    ? 'Test Record' : 'SecureField'}
            </h1>
            {page === 'dashboard' && operator && (
              <p className="text-sm text-gray-400 mt-0.5">NCB · Ministry of Home Affairs</p>
            )}
          </div>
          {operator && page !== 'new-test' && (
            <div className="flex items-center gap-2">
              {operator.selfie ? (
                <img src={operator.selfie} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white shadow" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-white font-bold text-sm shadow">
                  {operator.name?.[0]?.toUpperCase() || 'O'}
                </div>
              )}
            </div>
          )}
        </header>
      )}

      {/* ── Pages ── */}
      <div className={showNav ? 'pb-24' : ''}>
        {page === 'login'     && <LoginScreen onLogin={(op) => { setOperator(op); setPage('dashboard'); }} />}
        {page === 'dashboard' && <Dashboard operator={operator} navigate={navigate} />}
        {page === 'new-test'  && <NewTestFlow operator={operator} navigate={navigate} />}
        {page === 'result'    && <ResultScreen record={currentRecord} navigate={navigate} />}
        {page === 'log'       && <TestLog navigate={navigate} />}
        {page === 'batch'     && <BatchTestScreen navigate={navigate} />}
        {page === 'settings'  && <SettingsScreen navigate={navigate} />}
        {page === 'verify'    && <VerifyScreen navigate={navigate} />}
      </div>

      {/* ── Bottom Navigation ── */}
      {showNav && (
        <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md z-50"
          style={{ background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(12px)', borderTop: '1px solid rgba(0,0,0,0.06)' }}
        >
          <div className="flex items-end px-2 py-2">
            <NavItem icon="⊞" emoji="🏠" label="Home"     active={page==='dashboard'} onClick={() => navigate('dashboard')} />
            <NavItem icon="≡" emoji="📋" label="Log"      active={page==='log'}       onClick={() => navigate('log')} />

            {/* Center FAB */}
            <button onClick={() => navigate('new-test')} className="flex-1 flex flex-col items-center gap-1 pb-1">
              <div className="w-14 h-14 -mt-6 rounded-full flex items-center justify-center text-white text-2xl shadow-xl border-4 border-white"
                style={{ background: 'linear-gradient(135deg,#1e3a5f,#2563eb)' }}>
                ＋
              </div>
              <span className="text-xs font-medium" style={{ color: '#2563eb' }}>New Test</span>
            </button>

            <NavItem emoji="🔍" label="Verify"   active={page==='verify'}   onClick={() => navigate('verify')} />
            <NavItem emoji="⚙️" label="Settings" active={page==='settings'} onClick={() => navigate('settings')} />
          </div>
          <div className="h-safe-area" style={{ height: 'env(safe-area-inset-bottom,0px)' }} />
        </nav>
      )}
    </div>
  );
}

function NavItem({ emoji, label, active, onClick }) {
  return (
    <button onClick={onClick} className="flex-1 flex flex-col items-center gap-1 py-2 rounded-xl transition-all">
      <div className={`w-10 h-10 flex items-center justify-center rounded-xl text-xl transition-all ${active ? 'bg-blue-50' : ''}`}>
        {emoji}
      </div>
      <span className={`text-xs font-medium transition-colors ${active ? 'text-blue-600 font-semibold' : 'text-gray-400'}`}>{label}</span>
    </button>
  );
}
