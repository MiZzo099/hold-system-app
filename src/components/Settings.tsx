import { useMemo, useState } from 'react';
import { DatabaseService, type DatabaseConnectionConfig, type DataMode } from '../services/databaseService';
import { DEFAULT_SPREADSHEET_ID } from '../constants/ptoc';
import { useToast } from '../hooks/useToast';

interface SettingsProps {
  onConnectionSaved?: () => Promise<void> | void;
}

interface SystemSettings {
  autoSyncInterval: number;
  escalationDaysThreshold: number;
  weeklyReportDay: string;
  timeZone: string;
}

const APPS_SCRIPT_TEMPLATE = `/** Apps Script Web App bridge for PTOC React app */
const DB_URL = 'https://docs.google.com/spreadsheets/d/${DEFAULT_SPREADSHEET_ID}/edit';
const DB_TAB_NAME = 'Database';
const HISTORY_TAB = 'Hold History';

function doGet(e) {
  const action = (e && e.parameter && e.parameter.action) || 'ping';
  return ContentService.createTextOutput(JSON.stringify(routeAction_(action, null)))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = e && e.postData && e.postData.contents ? JSON.parse(e.postData.contents) : {};
  return ContentService.createTextOutput(JSON.stringify(routeAction_(body.action, body.payload || {})))
    .setMimeType(ContentService.MimeType.JSON);
}

function routeAction_(action, payload) {
  if (action === 'ping') return { success: true, message: 'Apps Script bridge ready' };
  if (action === 'activeHolds') return { success: true, data: getActiveHolds_() };
  if (action === 'history') return { success: true, data: getHistory_() };
  if (action === 'placeHold') return placeHold_(payload);
  if (action === 'clearHold') return clearHold_(payload);
  return { success: false, error: 'Unknown action: ' + action };
}

function getActiveHolds_() {
  const sheet = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(DB_TAB_NAME);
  const data = sheet.getDataRange().getValues();
  return data.slice(1)
    .map(function(row, index) {
      const status = (row[7] || '').toString().trim().toUpperCase();
      return {
        id: 'db-' + (index + 2),
        rowIndex: index + 2,
        emrId: row[3] || '',
        patientName: row[2] || '',
        clinic: row[8] || '',
        holdReason: row[5] || '',
        category: row[5] || '',
        placedDate: row[0] || '',
        placedBy: row[1] || '',
        status: status === 'CLEAR' ? 'clear' : 'hold',
        daysOnHold: Math.floor((new Date() - new Date(row[0])) / (1000 * 60 * 60 * 24)),
        notes: row[6] || '',
        insurance: row[4] || ''
      };
    })
    .filter(function(item) { return item.status !== 'clear'; });
}

function getHistory_() {
  const sheet = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(HISTORY_TAB);
  const data = sheet.getDataRange().getValues();
  return data.slice(1).reverse().map(function(row, index) {
    return {
      id: 'history-' + (index + 2),
      timestamp: row[0] || '',
      action: row[1] || 'HOLD PLACED',
      patientName: row[2] || '',
      emrId: row[3] || '',
      location: row[4] || '',
      category: row[5] || '',
      reason: row[6] || '',
      user: row[7] || ''
    };
  });
}

function placeHold_(payload) {
  const sheet = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(DB_TAB_NAME);
  const now = new Date();
  sheet.appendRow([now, payload.placedBy, payload.patientName, payload.emrId, payload.insurance || '', payload.category, payload.note, 'Hold', payload.clinic, '', '', '', '', '', '', 'PENDING-NIGHTLY', '']);

  const history = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(HISTORY_TAB);
  history.appendRow([now, 'HOLD PLACED', payload.patientName, payload.emrId, payload.clinic, payload.category, payload.holdReason, payload.placedBy]);
  return { success: true, message: 'Hold placed successfully' };
}

function clearHold_(payload) {
  const sheet = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(DB_TAB_NAME);
  const data = sheet.getDataRange().getValues();
  const now = new Date();

  for (var i = 1; i < data.length; i++) {
    if ((data[i][3] || '').toString() === (payload.emrId || '').toString() && (data[i][7] || '').toString().toUpperCase() === 'HOLD') {
      sheet.getRange(i + 1, 8).setValue('Clear');
      sheet.getRange(i + 1, 10).setValue(now);
      sheet.getRange(i + 1, 11).setValue(payload.clearedBy || '');
      break;
    }
  }

  const history = SpreadsheetApp.openByUrl(DB_URL).getSheetByName(HISTORY_TAB);
  history.appendRow([now, 'HOLD CLEARED', payload.patientName || '', payload.emrId || '', payload.location || '', payload.reason || 'Hold', payload.reason || 'Hold', payload.clearedBy || '']);
  return { success: true, message: 'Hold cleared successfully' };
}`;

export function Settings({ onConnectionSaved }: SettingsProps) {
  const { pushToast } = useToast();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    autoSyncInterval: 30,
    escalationDaysThreshold: 7,
    weeklyReportDay: 'Monday',
    timeZone: 'America/New_York',
  });
  const [config, setConfig] = useState<DatabaseConnectionConfig>(DatabaseService.getConfig());
  const [testing, setTesting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [testMessage, setTestMessage] = useState('');

  const mode: DataMode = useMemo(() => DatabaseService.getMode(config), [config]);

  const handleSaveSettings = () => {
    pushToast({ title: 'Settings saved', description: 'UI preferences were stored for this browser session.', tone: 'success' });
  };

  const handleSaveConnection = async () => {
    setSaving(true);
    DatabaseService.saveConfig(config);
    setSaving(false);
    pushToast({ title: 'Connection saved', description: 'Database connection settings were stored locally in this browser.', tone: 'success' });
    await onConnectionSaved?.();
  };

  const handleTestConnection = async () => {
    setTesting(true);
    setTestMessage('');
    const result = await DatabaseService.testConnection(config);
    setTesting(false);
    setTestMessage(result.message || result.error || 'No response');
    pushToast({
      title: result.success ? 'Connection successful' : 'Connection failed',
      description: result.message || result.error,
      tone: result.success ? 'success' : 'error',
    });
  };

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div className="grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 shadow-xl">
            <h2 className="text-2xl font-bold text-white">System Settings</h2>
            <div className="mt-6 space-y-5">
              <Field label="Auto-sync interval (minutes)">
                <input
                  type="number"
                  min={5}
                  max={120}
                  value={systemSettings.autoSyncInterval}
                  onChange={(event) => setSystemSettings((current) => ({ ...current, autoSyncInterval: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <Field label="Escalation threshold (days)">
                <input
                  type="number"
                  min={1}
                  max={30}
                  value={systemSettings.escalationDaysThreshold}
                  onChange={(event) => setSystemSettings((current) => ({ ...current, escalationDaysThreshold: Number(event.target.value) }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <Field label="Weekly report day">
                <select
                  value={systemSettings.weeklyReportDay}
                  onChange={(event) => setSystemSettings((current) => ({ ...current, weeklyReportDay: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day) => <option key={day}>{day}</option>)}
                </select>
              </Field>

              <Field label="Time zone">
                <select
                  value={systemSettings.timeZone}
                  onChange={(event) => setSystemSettings((current) => ({ ...current, timeZone: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="America/New_York">America/New_York</option>
                  <option value="America/Chicago">America/Chicago</option>
                  <option value="America/Denver">America/Denver</option>
                  <option value="America/Los_Angeles">America/Los_Angeles</option>
                </select>
              </Field>
            </div>
            <button
              type="button"
              onClick={handleSaveSettings}
              className="mt-6 rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Save Settings
            </button>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-white">Connection Status</h3>
            <div className="mt-4 rounded-2xl border border-slate-800 bg-slate-800/70 p-5">
              <div className="text-xs uppercase tracking-[0.2em] text-slate-500">Current mode</div>
              <div className="mt-2 text-2xl font-bold text-white">{mode === 'apps-script' ? 'Live Write Mode' : mode === 'sheets-api' ? 'Read-only Sheet Mode' : 'Demo Mode'}</div>
              <div className="mt-2 text-sm text-slate-400">
                {mode === 'apps-script'
                  ? 'You can place and clear holds directly against the Google Sheet.'
                  : mode === 'sheets-api'
                    ? 'You can read live holds and history, but hold/clear writes are blocked until Apps Script is connected.'
                    : 'The app is using demo data until you connect Google Sheets.'}
              </div>
              <a
                href={DatabaseService.getSpreadsheetUrl(config)}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex text-sm font-semibold text-blue-400 hover:text-blue-300"
              >
                Open Spreadsheet ↗
              </a>
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-700 bg-slate-900/70 p-8 shadow-xl">
            <div className="flex items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-bold text-white">Google Sheets Integration</h2>
                <p className="mt-1 text-sm text-slate-400">Use your real PTOC spreadsheet and optionally your Apps Script Web App for write access.</p>
              </div>
            </div>

            <div className="mt-6 space-y-5">
              <Field label="Spreadsheet ID">
                <input
                  type="text"
                  value={config.spreadsheetId}
                  onChange={(event) => setConfig((current) => ({ ...current, spreadsheetId: event.target.value }))}
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <Field label="Google Sheets API Key (optional for read-only)">
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={(event) => setConfig((current) => ({ ...current, apiKey: event.target.value }))}
                  placeholder="Paste API key to read directly from Google Sheets"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <Field label="Apps Script Web App URL (required for hold/clear)">
                <input
                  type="text"
                  value={config.appsScriptUrl}
                  onChange={(event) => setConfig((current) => ({ ...current, appsScriptUrl: event.target.value }))}
                  placeholder="https://script.google.com/macros/s/.../exec"
                  className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                />
              </Field>

              <div className="grid gap-4 md:grid-cols-3">
                <Field label="Database tab">
                  <input
                    type="text"
                    value={config.databaseTab}
                    onChange={(event) => setConfig((current) => ({ ...current, databaseTab: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </Field>
                <Field label="History tab">
                  <input
                    type="text"
                    value={config.historyTab}
                    onChange={(event) => setConfig((current) => ({ ...current, historyTab: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </Field>
                <Field label="Users tab">
                  <input
                    type="text"
                    value={config.usersTab}
                    onChange={(event) => setConfig((current) => ({ ...current, usersTab: event.target.value }))}
                    className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </Field>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleSaveConnection}
                disabled={saving}
                className="rounded-xl bg-blue-600 px-5 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-60"
              >
                {saving ? 'Saving...' : 'Save Connection'}
              </button>
              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testing}
                className="rounded-xl border border-slate-700 px-5 py-3 font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </button>
            </div>

            {testMessage ? (
              <div className="mt-4 rounded-xl border border-slate-800 bg-slate-800/70 px-4 py-3 text-sm text-slate-300">
                {testMessage}
              </div>
            ) : null}
          </section>

          <section className="rounded-2xl border border-amber-500/30 bg-amber-500/10 p-8 shadow-xl">
            <h3 className="text-xl font-bold text-amber-100">How to really connect your Google Sheet</h3>
            <ol className="mt-4 list-decimal space-y-3 pl-5 text-sm text-amber-50/90">
              <li>Open your Apps Script project that already powers the original PTOC spreadsheet workflow.</li>
              <li>Create a Web App endpoint with <span className="font-semibold">Execute as: Me</span> and <span className="font-semibold">Who has access: Anyone with the link</span> or your domain users.</li>
              <li>Add simple <span className="font-semibold">doGet</span> and <span className="font-semibold">doPost</span> handlers using the template below.</li>
              <li>Paste the deployed Web App URL into this page and save it.</li>
              <li>After that, the React app can place holds and clear holds against the same sheet you shared.</li>
            </ol>
          </section>

          <section className="rounded-2xl border border-slate-700 bg-slate-950/80 p-0 shadow-2xl overflow-hidden">
            <div className="border-b border-slate-800 px-6 py-4 text-sm font-semibold text-white">Apps Script starter template</div>
            <pre className="max-h-[520px] overflow-auto px-6 py-5 text-xs leading-6 text-slate-300">{APPS_SCRIPT_TEMPLATE}</pre>
          </section>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-slate-200">{label}</span>
      {children}
    </label>
  );
}
