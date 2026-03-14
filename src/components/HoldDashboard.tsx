import { useMemo } from 'react';
import type { HoldHistoryEntry, HoldRecord } from '../services/databaseService';

interface HoldDashboardProps {
  holds: HoldRecord[];
  history: HoldHistoryEntry[];
  isLoading?: boolean;
  onOpenEscalation?: () => void;
}

export function HoldDashboard({ holds, history, isLoading, onOpenEscalation }: HoldDashboardProps) {
  const stats = useMemo(() => {
    const byClinic: Record<string, number> = {};
    const byReason: Record<string, number> = {};
    const byTeam: Record<string, number> = {};

    holds.forEach((hold) => {
      byClinic[hold.clinic || 'Unknown'] = (byClinic[hold.clinic || 'Unknown'] || 0) + 1;
      byReason[hold.holdReason || 'Unknown'] = (byReason[hold.holdReason || 'Unknown'] || 0) + 1;
      byTeam[hold.placedBy || 'Unknown'] = (byTeam[hold.placedBy || 'Unknown'] || 0) + 1;
    });

    return {
      total: holds.length,
      over7Days: holds.filter((hold) => hold.daysOnHold >= 7).length,
      over14Days: holds.filter((hold) => hold.daysOnHold >= 14).length,
      clearedThisWeek: history.filter((item) => item.action === 'HOLD CLEARED').length,
      placedThisWeek: history.filter((item) => item.action === 'HOLD PLACED').length,
      byClinic,
      byReason,
      byTeam,
    };
  }, [holds, history]);

  const topClinics = Object.entries(stats.byClinic).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topReasons = Object.entries(stats.byReason).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const topTeam = Object.entries(stats.byTeam).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const recentActivity = [...history].slice(0, 5);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-5">
        <StatCard title="Total Active Holds" value={stats.total} accent="blue" icon="🔒" />
        <StatCard title="Open 7+ Days" value={stats.over7Days} accent="amber" icon="⚠️" />
        <StatCard title="Open 14+ Days" value={stats.over14Days} accent="red" icon="🚨" />
        <StatCard title="Cleared (History)" value={stats.clearedThisWeek} accent="emerald" icon="✅" />
        <StatCard title="Placed (History)" value={stats.placedThisWeek} accent="violet" icon="📌" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        <RankingCard title="📍 Holds by Clinic" items={topClinics} colorClass="from-blue-500 to-blue-600" total={Math.max(stats.total, 1)} />
        <RankingCard title="📋 Holds by Reason" items={topReasons} colorClass="from-violet-500 to-violet-600" total={Math.max(stats.total, 1)} />
        <RankingCard title="👤 Holds by Team" items={topTeam} colorClass="from-emerald-500 to-emerald-600" total={Math.max(stats.total, 1)} />
      </div>

      {stats.over14Days > 0 ? (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h3 className="text-lg font-bold text-red-100">Critical Hold Alert</h3>
              <p className="mt-2 text-sm text-red-200/90">
                {stats.over14Days} patient(s) have been on hold for 14+ days and need urgent follow-up.
              </p>
            </div>
            <button
              type="button"
              onClick={onOpenEscalation}
              className="rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
            >
              Open Escalation Center
            </button>
          </div>
        </div>
      ) : null}

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between gap-4">
          <h3 className="text-lg font-bold text-white">Recent History</h3>
          <span className="text-xs text-slate-500">{isLoading ? 'Refreshing...' : 'Live from current connection mode'}</span>
        </div>
        <div className="space-y-3">
          {recentActivity.length > 0 ? recentActivity.map((item) => (
            <div key={item.id} className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-800/60 px-4 py-3">
              <div>
                <div className="font-medium text-white">{item.action}</div>
                <div className="text-sm text-slate-400">{item.patientName} • EMR {item.emrId}</div>
              </div>
              <div className="text-right text-xs text-slate-500">
                <div>{item.location}</div>
                <div>{formatDate(item.timestamp)}</div>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-8 text-center text-slate-400">
              No recent history found for the current connection.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}

function StatCard({ title, value, icon, accent }: { title: string; value: number; icon: string; accent: 'blue' | 'amber' | 'red' | 'emerald' | 'violet' }) {
  const styles: Record<typeof accent, string> = {
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
    red: 'border-red-500/30 bg-red-500/10 text-red-100',
    emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100',
    violet: 'border-violet-500/30 bg-violet-500/10 text-violet-100',
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-xl ${styles[accent]}`}>
      <div className="text-2xl">{icon}</div>
      <div className="mt-3 text-xs uppercase tracking-[0.2em] opacity-70">{title}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function RankingCard({ title, items, colorClass, total }: { title: string; items: [string, number][]; colorClass: string; total: number }) {
  return (
    <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
      <h3 className="mb-4 text-lg font-bold text-white">{title}</h3>
      <div className="space-y-3">
        {items.length > 0 ? items.map(([label, value]) => (
          <div key={label}>
            <div className="flex items-center justify-between text-sm">
              <span className="truncate text-slate-300">{label}</span>
              <span className="ml-3 font-semibold text-white">{value}</span>
            </div>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-800">
              <div className={`h-full rounded-full bg-gradient-to-r ${colorClass}`} style={{ width: `${(value / total) * 100}%` }} />
            </div>
          </div>
        )) : (
          <div className="text-sm text-slate-400">No data available.</div>
        )}
      </div>
    </div>
  );
}
