import type { HoldRecord } from '../services/databaseService';

interface EscalationCenterProps {
  holds: HoldRecord[];
  onClear: (hold: HoldRecord) => Promise<void> | void;
  isLoading?: boolean;
}

export function EscalationCenter({ holds, onClear, isLoading }: EscalationCenterProps) {
  const escalated = holds.filter((hold) => hold.daysOnHold >= 7);
  const critical = escalated.filter((hold) => hold.daysOnHold >= 14);
  const high = escalated.filter((hold) => hold.daysOnHold >= 7 && hold.daysOnHold < 14);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <MetricCard title="Total Escalations" value={escalated.length} accent="blue" />
        <MetricCard title="Critical (14+ days)" value={critical.length} accent="red" />
        <MetricCard title="High (7-13 days)" value={high.length} accent="amber" />
      </div>

      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-white">Escalated Holds</h3>
          <span className="text-sm text-slate-500">{isLoading ? 'Refreshing...' : `${escalated.length} hold(s)`}</span>
        </div>

        <div className="space-y-4">
          {escalated.length > 0 ? escalated.map((hold) => (
            <div key={hold.id} className="rounded-2xl border border-slate-800 bg-slate-800/70 p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-3">
                    <h4 className="text-lg font-semibold text-white">{hold.patientName}</h4>
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${hold.daysOnHold >= 14 ? 'bg-red-500/20 text-red-100' : 'bg-amber-500/20 text-amber-100'}`}>
                      {hold.daysOnHold} day(s)
                    </span>
                  </div>
                  <div className="mt-2 text-sm text-slate-400">
                    EMR: {hold.emrId} • {hold.clinic} • {hold.holdReason}
                  </div>
                  <div className="mt-2 text-xs text-slate-500">
                    Placed by {hold.placedBy} on {formatDate(hold.placedDate)}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onClear(hold)}
                  className="rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700"
                >
                  Clear Hold
                </button>
              </div>
            </div>
          )) : (
            <div className="rounded-xl border border-slate-800 bg-slate-800/50 px-4 py-10 text-center text-slate-400">
              No escalated holds right now.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MetricCard({ title, value, accent }: { title: string; value: number; accent: 'blue' | 'red' | 'amber' }) {
  const classes = {
    blue: 'border-blue-500/30 bg-blue-500/10 text-blue-100',
    red: 'border-red-500/30 bg-red-500/10 text-red-100',
    amber: 'border-amber-500/30 bg-amber-500/10 text-amber-100',
  };

  return (
    <div className={`rounded-2xl border p-5 shadow-xl ${classes[accent]}`}>
      <div className="text-xs uppercase tracking-[0.2em] opacity-70">{title}</div>
      <div className="mt-2 text-3xl font-bold text-white">{value}</div>
    </div>
  );
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}
