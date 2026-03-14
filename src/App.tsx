import { useCallback, useEffect, useMemo, useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { Login } from './components/Login';
import { HoldDashboard } from './components/HoldDashboard';
import { HoldPlacementForm } from './components/HoldPlacementForm';
import { HoldHistory } from './components/HoldHistory';
import { EscalationCenter } from './components/EscalationCenter';
import { Settings } from './components/Settings';
import { DatabaseService, type HoldHistoryEntry, type HoldRecord } from './services/databaseService';
import { ToastProvider, useToast } from './hooks/useToast';

type Tab = 'dashboard' | 'place-hold' | 'history' | 'escalation' | 'settings';

function AppContent() {
  const { user, logout } = useAuth();
  const { pushToast } = useToast();
  const [activeTab, setActiveTab] = useState<Tab>('dashboard');
  const [holds, setHolds] = useState<HoldRecord[]>([]);
  const [history, setHistory] = useState<HoldHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [connectionMessage, setConnectionMessage] = useState('Demo mode active until connection is configured.');

  const refreshData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [holdsResult, historyResult] = await Promise.all([
        DatabaseService.fetchActiveHolds(),
        DatabaseService.fetchHoldHistory(),
      ]);

      if (holdsResult.success && holdsResult.data) {
        setHolds(holdsResult.data);
      } else {
        pushToast({ title: 'Could not load holds', description: holdsResult.error, tone: 'error' });
      }

      if (historyResult.success && historyResult.data) {
        setHistory(historyResult.data);
      } else {
        pushToast({ title: 'Could not load history', description: historyResult.error, tone: 'error' });
      }

      const message = holdsResult.message || historyResult.message || 'Connection refreshed.';
      setConnectionMessage(message);
    } finally {
      setIsLoading(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (user) {
      void refreshData();
    }
  }, [refreshData, user]);

  const totalHolds = holds.length;
  const liveMode = useMemo(() => DatabaseService.getMode(), []);

  const handleClearHold = useCallback(async (hold: HoldRecord) => {
    if (!user) return;

    const result = await DatabaseService.clearHold({
      rowIndex: hold.rowIndex,
      emrId: hold.emrId,
      clearedBy: user.email,
      reason: hold.holdReason,
    });

    if (!result.success) {
      pushToast({ title: 'Clear failed', description: result.error, tone: 'error' });
      return;
    }

    pushToast({ title: 'Hold cleared', description: `${hold.patientName} was cleared successfully.`, tone: 'success' });
    await refreshData();
  }, [pushToast, refreshData, user]);

  if (!user) {
    return <Login onLoginSuccess={() => window.location.reload()} />;
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.12),_transparent_30%),linear-gradient(135deg,#020617_0%,#0f172a_48%,#111827_100%)] text-white">
      <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/80 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-xl shadow-blue-900/50">
                <svg className="h-6 w-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold">PTOC Hold Management</h1>
                <p className="text-sm text-slate-400">Google Sheets-connected authorization, hold, clear, and escalation workspace</p>
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-100">
                <div className="font-semibold">{totalHolds} Active Holds</div>
                <div className="text-xs text-red-200/80">{connectionMessage}</div>
              </div>
              <div className="rounded-2xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-sm">
                <div className="font-semibold text-white">{user.name}</div>
                <div className="text-xs text-slate-400">{user.email} • {user.role} • {user.clinic}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="rounded-xl border border-slate-700 px-4 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-900"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <nav className="sticky top-[97px] z-40 border-b border-slate-800 bg-slate-950/70 backdrop-blur-xl">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex gap-1 overflow-x-auto py-2">
            {[
              { id: 'dashboard', label: '📊 Dashboard' },
              { id: 'place-hold', label: '🔒 Place Hold' },
              { id: 'history', label: '📜 History' },
              { id: 'escalation', label: '⚠️ Escalation' },
              { id: 'settings', label: '🔗 Integration' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as Tab)}
                className={`rounded-xl px-4 py-3 text-sm font-semibold transition ${activeTab === tab.id ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40' : 'text-slate-400 hover:bg-slate-900 hover:text-slate-200'}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {activeTab === 'dashboard' ? (
          <HoldDashboard
            holds={holds}
            history={history}
            isLoading={isLoading}
            onOpenEscalation={() => setActiveTab('escalation')}
          />
        ) : null}

        {activeTab === 'place-hold' ? <HoldPlacementForm onRefresh={refreshData} /> : null}
        {activeTab === 'history' ? <HoldHistory entries={history} isLoading={isLoading} /> : null}
        {activeTab === 'escalation' ? <EscalationCenter holds={holds} onClear={handleClearHold} isLoading={isLoading} /> : null}
        {activeTab === 'settings' ? <Settings onConnectionSaved={refreshData} /> : null}
      </main>

      <section className="mx-auto max-w-7xl px-4 pb-10 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-xl">
          <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
            <div>
              <h3 className="text-lg font-bold text-white">Active Holds</h3>
              <p className="text-sm text-slate-400">Live work queue from the current connection mode</p>
            </div>
            <div className="rounded-full border border-slate-700 px-3 py-1 text-xs text-slate-400">
              Mode: {liveMode}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-slate-800/80 text-slate-300">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Patient</th>
                  <th className="px-6 py-4 text-left font-semibold">Clinic</th>
                  <th className="px-6 py-4 text-left font-semibold">Reason</th>
                  <th className="px-6 py-4 text-left font-semibold">Days</th>
                  <th className="px-6 py-4 text-left font-semibold">Placed By</th>
                  <th className="px-6 py-4 text-left font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {holds.length > 0 ? holds.map((hold) => (
                  <tr key={hold.id} className="transition hover:bg-slate-900/60">
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{hold.patientName}</div>
                      <div className="text-xs text-slate-500">EMR: {hold.emrId}</div>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{hold.clinic}</td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-white">{hold.holdReason}</div>
                      <div className="text-xs text-slate-500">{hold.notes}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hold.daysOnHold >= 14 ? 'bg-red-500/20 text-red-100' : hold.daysOnHold >= 7 ? 'bg-amber-500/20 text-amber-100' : 'bg-blue-500/20 text-blue-100'}`}>
                        {hold.daysOnHold}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-slate-300">{hold.placedBy}</td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => void handleClearHold(hold)}
                        className="rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white transition hover:bg-emerald-700"
                      >
                        Clear Hold
                      </button>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                      No active holds were returned. Configure the Integration tab to read your live Google Sheet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-800 bg-slate-950/80 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-sm text-slate-500 sm:px-6 lg:px-8">
          <p>PTOC Authorization & Hold Management System • React + Vite + Tailwind</p>
          <p className="mt-1">Supports demo mode, Google Sheets read mode, and Apps Script live write mode</p>
        </div>
      </footer>
    </div>
  );
}

export function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </AuthProvider>
  );
}
