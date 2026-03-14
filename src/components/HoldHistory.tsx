import { useMemo, useState } from 'react';
import type { HoldHistoryEntry } from '../services/databaseService';

interface HoldHistoryProps {
  entries: HoldHistoryEntry[];
  isLoading?: boolean;
}

export function HoldHistory({ entries, isLoading }: HoldHistoryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterAction, setFilterAction] = useState<'all' | 'HOLD PLACED' | 'HOLD CLEARED' | 'ESCALATION SENT'>('all');

  const filtered = useMemo(() => entries.filter((entry) => {
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query
      || entry.patientName.toLowerCase().includes(query)
      || entry.emrId.toLowerCase().includes(query)
      || entry.location.toLowerCase().includes(query)
      || entry.reason.toLowerCase().includes(query);

    const matchesAction = filterAction === 'all' || entry.action === filterAction;
    return matchesSearch && matchesAction;
  }), [entries, filterAction, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-slate-700 bg-slate-900/70 p-6 shadow-xl">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Search history</label>
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Patient, EMR ID, location, reason..."
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
          <div>
            <label className="mb-2 block text-sm font-medium text-slate-200">Action</label>
            <select
              value={filterAction}
              onChange={(event) => setFilterAction(event.target.value as typeof filterAction)}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              <option value="all">All actions</option>
              <option value="HOLD PLACED">Hold placed</option>
              <option value="HOLD CLEARED">Hold cleared</option>
              <option value="ESCALATION SENT">Escalation sent</option>
            </select>
          </div>
        </div>
        <div className="mt-4 text-sm text-slate-400">
          {isLoading ? 'Refreshing history...' : `Showing ${filtered.length} record(s)`}
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-700 bg-slate-900/70 shadow-xl">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-800/90 text-slate-300">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Timestamp</th>
                <th className="px-6 py-4 text-left font-semibold">Action</th>
                <th className="px-6 py-4 text-left font-semibold">Patient</th>
                <th className="px-6 py-4 text-left font-semibold">Location</th>
                <th className="px-6 py-4 text-left font-semibold">Category</th>
                <th className="px-6 py-4 text-left font-semibold">User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.length > 0 ? filtered.map((entry) => (
                <tr key={entry.id} className="bg-slate-900/30 transition hover:bg-slate-800/60">
                  <td className="px-6 py-4 text-slate-300">{formatDate(entry.timestamp)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${badgeColor(entry.action)}`}>
                      {entry.action}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{entry.patientName}</div>
                    <div className="text-xs text-slate-500">EMR: {entry.emrId}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{entry.location}</td>
                  <td className="px-6 py-4">
                    <div className="font-medium text-white">{entry.category}</div>
                    <div className="text-xs text-slate-500">{entry.reason}</div>
                  </td>
                  <td className="px-6 py-4 text-slate-300">{entry.user}</td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-slate-400">
                    No history found for the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function badgeColor(action: HoldHistoryEntry['action']) {
  if (action === 'HOLD PLACED') return 'border-red-500/30 bg-red-500/10 text-red-100';
  if (action === 'HOLD CLEARED') return 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100';
  return 'border-amber-500/30 bg-amber-500/10 text-amber-100';
}

function formatDate(value: string) {
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleString();
}
