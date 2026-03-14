import { DEFAULT_SPREADSHEET_ID, formatUserDisplay } from '../constants/ptoc';

export type DataMode = 'apps-script' | 'sheets-api' | 'demo';

export interface DatabaseConnectionConfig {
  spreadsheetId: string;
  apiKey: string;
  appsScriptUrl: string;
  databaseTab: string;
  historyTab: string;
  usersTab: string;
}

export interface HoldRecord {
  id: string;
  rowIndex?: number;
  emrId: string;
  patientName: string;
  clinic: string;
  location?: string;
  holdReason: string;
  category: string;
  placedDate: string;
  placedBy: string;
  status: 'hold' | 'once a week' | 'clear' | 'escalated';
  daysOnHold: number;
  notes: string;
  insurance?: string;
  clearedDate?: string;
  clearedBy?: string;
  threadId?: string;
}

export interface HoldHistoryEntry {
  id: string;
  rowIndex?: number;
  timestamp: string;
  action: 'HOLD PLACED' | 'HOLD CLEARED' | 'ESCALATION SENT';
  patientName: string;
  emrId: string;
  location: string;
  category: string;
  reason: string;
  user: string;
}

export interface PlaceHoldInput {
  emrId: string;
  patientName: string;
  clinic: string;
  category: string;
  holdReason: string;
  note: string;
  insurance?: string;
  placedBy: string;
}

export interface ClearHoldInput {
  rowIndex?: number;
  emrId: string;
  clearedBy: string;
  reason?: string;
}

export interface ServiceResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  mode: DataMode;
}

const STORAGE_KEY = 'ptoc_db_connection';

const DEFAULT_CONFIG: DatabaseConnectionConfig = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  apiKey: '',
  appsScriptUrl: '',
  databaseTab: 'Database',
  historyTab: 'Hold History',
  usersTab: 'Users',
};

function normalizeMode(config: DatabaseConnectionConfig): DataMode {
  if (config.appsScriptUrl.trim()) return 'apps-script';
  if (config.apiKey.trim()) return 'sheets-api';
  return 'demo';
}

function cleanEmr(value: string | number | undefined | null): string {
  if (!value) return '';
  const raw = String(value).trim();
  const match = raw.match(/\d{5,}/);
  return match ? match[0] : raw;
}

function calculateDays(value: string | undefined): number {
  if (!value) return 0;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 0;
  const diff = Date.now() - date.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function safeString(value: unknown): string {
  return value === undefined || value === null ? '' : String(value);
}

function parseHoldRow(row: unknown[], index: number): HoldRecord {
  const placedDate = safeString(row[0]);
  const placedByRaw = safeString(row[1]);
  const statusRaw = safeString(row[7]).trim().toUpperCase();
  const daysOnHold = calculateDays(placedDate);

  return {
    id: `db-${index + 2}-${cleanEmr(safeString(row[3]))}`,
    rowIndex: index + 2,
    emrId: cleanEmr(safeString(row[3])),
    patientName: safeString(row[2]),
    clinic: safeString(row[8]),
    holdReason: safeString(row[5]),
    category: safeString(row[5]),
    placedDate,
    placedBy: formatUserDisplay(placedByRaw),
    status: statusRaw === 'ONCE A WEEK' ? 'once a week' : statusRaw === 'CLEAR' ? 'clear' : daysOnHold >= 7 ? 'escalated' : 'hold',
    daysOnHold,
    notes: safeString(row[6]),
    insurance: safeString(row[4]),
    clearedDate: safeString(row[9]),
    clearedBy: formatUserDisplay(safeString(row[10])),
    threadId: safeString(row[15]),
  };
}

function parseHistoryRow(row: unknown[], index: number): HoldHistoryEntry {
  return {
    id: `history-${index + 2}`,
    rowIndex: index + 2,
    timestamp: safeString(row[0]),
    action: (safeString(row[1]) || 'HOLD PLACED') as HoldHistoryEntry['action'],
    patientName: safeString(row[2]),
    emrId: cleanEmr(safeString(row[3])),
    location: safeString(row[4]),
    category: safeString(row[5]),
    reason: safeString(row[6]) || safeString(row[5]),
    user: formatUserDisplay(safeString(row[7])),
  };
}

function getMockHolds(): HoldRecord[] {
  return [
    {
      id: 'mock-1',
      rowIndex: 2,
      emrId: '12345',
      patientName: 'John Doe',
      clinic: 'Fordham',
      holdReason: 'Missing Referral',
      category: 'Missing Referral',
      placedDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
      placedBy: 'Mostafa Hassan',
      status: 'escalated',
      daysOnHold: 8,
      notes: 'Demo record — configure Apps Script URL to write live data.',
      insurance: 'Aetna',
    },
    {
      id: 'mock-2',
      rowIndex: 3,
      emrId: '23456',
      patientName: 'Maria Garcia',
      clinic: 'Astoria',
      holdReason: 'Pending Authorization from Insurance',
      category: 'Pending Authorization',
      placedDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
      placedBy: 'Omar Abdullah',
      status: 'hold',
      daysOnHold: 3,
      notes: 'Demo record — read-only fallback.',
      insurance: 'UHC',
    },
    {
      id: 'mock-3',
      rowIndex: 4,
      emrId: '34567',
      patientName: 'Sam Wilson',
      clinic: 'Flatbush',
      holdReason: 'COB Update — Primary / Secondary',
      category: 'COB Update',
      placedDate: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
      placedBy: 'Menna Sayed',
      status: 'escalated',
      daysOnHold: 14,
      notes: 'Demo record — waiting on benefits update.',
      insurance: 'Medicare',
    },
  ];
}

function getMockHistory(): HoldHistoryEntry[] {
  return [
    {
      id: 'mock-history-1',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      action: 'HOLD PLACED',
      patientName: 'John Doe',
      emrId: '12345',
      location: 'Fordham',
      category: 'Missing Referral',
      reason: 'No Referral on Chart',
      user: 'Mostafa Hassan',
    },
    {
      id: 'mock-history-2',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
      action: 'HOLD CLEARED',
      patientName: 'Julia Adams',
      emrId: '88888',
      location: 'Bay Ridge',
      category: 'Coverage Issue',
      reason: 'Coverage Issue — Insurance Inactive',
      user: 'Omar Abdullah',
    },
  ];
}

export class DatabaseService {
  static getConfig(): DatabaseConnectionConfig {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT_CONFIG };

    try {
      return { ...DEFAULT_CONFIG, ...(JSON.parse(raw) as Partial<DatabaseConnectionConfig>) };
    } catch {
      return { ...DEFAULT_CONFIG };
    }
  }

  static saveConfig(config: DatabaseConnectionConfig): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }

  static getMode(config = this.getConfig()): DataMode {
    return normalizeMode(config);
  }

  static getSpreadsheetUrl(config = this.getConfig()): string {
    return `https://docs.google.com/spreadsheets/d/${config.spreadsheetId}/edit`;
  }

  static async testConnection(config = this.getConfig()): Promise<ServiceResult<{ detail: string }>> {
    const mode = this.getMode(config);

    if (mode === 'apps-script') {
      try {
        const result = await this.callAppsScript<{ message?: string }>(config, 'ping', 'GET');
        if (result.success) {
          return {
            success: true,
            data: { detail: result.message || 'Apps Script Web App is responding.' },
            message: result.message || 'Apps Script Web App is connected.',
            mode,
          };
        }

        return { success: false, error: result.error, mode };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Connection test failed.',
          mode,
        };
      }
    }

    if (mode === 'sheets-api') {
      try {
        const rows = await this.fetchSheetValues(config, config.databaseTab, 'A1:B3');
        return {
          success: true,
          data: { detail: `Google Sheets API returned ${rows.length} row(s).` },
          message: 'Read-only Google Sheets connection is working.',
          mode,
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Google Sheets API test failed.',
          mode,
        };
      }
    }

    return {
      success: true,
      data: { detail: 'Demo mode is active until you add an Apps Script URL or Sheets API key.' },
      message: 'Demo mode active. Add an Apps Script URL for live hold/clear actions.',
      mode,
    };
  }

  static async fetchActiveHolds(config = this.getConfig()): Promise<ServiceResult<HoldRecord[]>> {
    const mode = this.getMode(config);

    if (mode === 'apps-script') {
      const result = await this.callAppsScript<HoldRecord[]>(config, 'activeHolds', 'GET');
      if (result.success) {
        const rawRows = Array.isArray(result.data) ? result.data : [];
        const holds = rawRows.map((item, index) => ({
          ...item,
          id: item.id || `live-${index}`,
          placedBy: formatUserDisplay(item.placedBy || ''),
          daysOnHold: item.daysOnHold ?? calculateDays(item.placedDate),
          status: item.status ?? ((item.daysOnHold ?? calculateDays(item.placedDate)) >= 7 ? 'escalated' : 'hold'),
        }));

        return { success: true, data: holds, mode, message: result.message };
      }
    }

    if (mode === 'sheets-api') {
      try {
        const rows = await this.fetchSheetValues(config, config.databaseTab, 'A2:S');
        const holds = rows
          .map((row, index) => parseHoldRow(row, index))
          .filter((item) => item.status === 'hold' || item.status === 'once a week' || item.status === 'escalated');

        return {
          success: true,
          data: holds,
          mode,
          message: 'Loaded active holds from the Database tab.',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Could not load sheet data.',
          mode,
        };
      }
    }

    return {
      success: true,
      data: getMockHolds(),
      mode,
      message: 'Demo data loaded. Configure live integration in the Integration tab.',
    };
  }

  static async fetchHoldHistory(config = this.getConfig()): Promise<ServiceResult<HoldHistoryEntry[]>> {
    const mode = this.getMode(config);

    if (mode === 'apps-script') {
      const result = await this.callAppsScript<HoldHistoryEntry[]>(config, 'history', 'GET');
      if (result.success) {
        const data = Array.isArray(result.data)
          ? result.data.map((item, index) => ({
              ...item,
              id: item.id || `history-live-${index}`,
              user: formatUserDisplay(item.user || ''),
            }))
          : [];

        return { success: true, data, mode, message: result.message };
      }
    }

    if (mode === 'sheets-api') {
      try {
        const rows = await this.fetchSheetValues(config, config.historyTab, 'A2:H');
        return {
          success: true,
          data: rows.map((row, index) => parseHistoryRow(row, index)),
          mode,
          message: 'Loaded hold history from Google Sheets.',
        };
      } catch (error) {
        return {
          success: false,
          error: error instanceof Error ? error.message : 'Could not load hold history.',
          mode,
        };
      }
    }

    return {
      success: true,
      data: getMockHistory(),
      mode,
      message: 'Demo history loaded.',
    };
  }

  static async placeHold(payload: PlaceHoldInput, config = this.getConfig()): Promise<ServiceResult<undefined>> {
    const mode = this.getMode(config);

    if (mode !== 'apps-script') {
      return {
        success: false,
        error: 'Live hold placement requires a deployed Google Apps Script Web App URL. Add it in the Integration tab first.',
        mode,
      };
    }

    return this.callAppsScript<undefined>(config, 'placeHold', 'POST', payload);
  }

  static async clearHold(payload: ClearHoldInput, config = this.getConfig()): Promise<ServiceResult<undefined>> {
    const mode = this.getMode(config);

    if (mode !== 'apps-script') {
      return {
        success: false,
        error: 'Live hold clearing requires a deployed Google Apps Script Web App URL. Add it in the Integration tab first.',
        mode,
      };
    }

    return this.callAppsScript<undefined>(config, 'clearHold', 'POST', payload);
  }

  private static async fetchSheetValues(
    config: DatabaseConnectionConfig,
    sheetName: string,
    range: string,
  ): Promise<unknown[][]> {
    if (!config.apiKey.trim()) {
      throw new Error('No Google Sheets API key saved.');
    }

    const encodedRange = encodeURIComponent(`${sheetName}!${range}`);
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodedRange}?key=${config.apiKey}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Google Sheets API returned ${response.status}. Make sure the sheet is accessible and the API key is valid.`);
    }

    const data = (await response.json()) as { values?: unknown[][] };
    return data.values ?? [];
  }

  private static async callAppsScript<T>(
    config: DatabaseConnectionConfig,
    action: string,
    method: 'GET' | 'POST',
    payload?: unknown,
  ): Promise<ServiceResult<T>> {
    const baseUrl = config.appsScriptUrl.trim();

    if (!baseUrl) {
      return { success: false, error: 'Apps Script URL is missing.', mode: 'apps-script' };
    }

    const url = method === 'GET'
      ? `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}action=${encodeURIComponent(action)}`
      : baseUrl;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: method === 'POST' ? JSON.stringify({ action, payload }) : undefined,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `Apps Script returned ${response.status}. Confirm the deployment is active and shared correctly.`,
        mode: 'apps-script',
      };
    }

    const raw = (await response.json()) as {
      success?: boolean;
      message?: string;
      error?: string;
      data?: T;
      holds?: T;
      history?: T;
    } | T;

    if (Array.isArray(raw)) {
      return { success: true, data: raw as T, mode: 'apps-script' };
    }

    const record = raw as {
      success?: boolean;
      message?: string;
      error?: string;
      data?: T;
      holds?: T;
      history?: T;
    };

    if (record.success === false) {
      return {
        success: false,
        error: record.error || 'Apps Script request failed.',
        message: record.message,
        mode: 'apps-script',
      };
    }

    const data = record.data ?? record.holds ?? record.history;
    return {
      success: true,
      data,
      message: record.message,
      mode: 'apps-script',
    };
  }
}
