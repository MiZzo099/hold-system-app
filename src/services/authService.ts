import { DEFAULT_SPREADSHEET_ID, PTOC_USER_NAMES } from '../constants/ptoc';
import { DatabaseService } from './databaseService';
import { User, LoginCredentials, DatabaseConfig } from '../types/auth';

const DB_CONFIG: DatabaseConfig = {
  spreadsheetId: DEFAULT_SPREADSHEET_ID,
  apiKey: '',
  appsScriptUrl: '',
  usersTab: 'Users',
};

function buildMockUsers(): User[] {
  const defaultPassword = 'AGONY';
  const baseUsers = [
    ['auth28@cobsolution.com', 'Mostafa Hassan', 'mostafa', 'Fordham', 'admin', 'referral'],
    ['auth29@cobsolution.com', 'Omar Abdullah', 'omar', 'Astoria', 'staff', 'benefits'],
    ['menna.sayed@cobsolution.com', 'Menna Sayed', 'menna', 'Flatbush', 'staff', 'referral'],
    ['billing35@cobsolution.com', 'Aya Mohamed', 'aya', 'Bay Ridge', 'staff', 'benefits'],
    ['auth19@cobsolution.com', 'Rashwan', 'rashwan', 'Grand Concourse', 'staff', 'clinic'],
    ['ali.esmail@cobsolution.com', 'Ali Esmail', 'ali', 'Midtown', 'viewer', 'clinic'],
    ['billing52@cobsolution.com', 'Shaimaa Khaled', 'shaimaa', 'Bushwick', 'staff', 'benefits'],
    ['billing11@cobsolution.com', 'Menna Bassem', 'menna_b', 'Tribeca', 'staff', 'benefits'],
  ] as const;

  return baseUsers.map(([email, name, username, clinic, role, team], index) => ({
    id: `user_${index + 1}`,
    email,
    name,
    username,
    clinic,
    role,
    team,
    permissions: role === 'viewer'
      ? ['view_holds']
      : ['view_holds', 'place_hold', 'clear_hold', 'generate_reports'],
    passwordHash: defaultPassword,
    status: 'active',
  }));
}

export class AuthService {
  private static readonly CACHE_KEY = 'ptoc_auth_cache';
  private static readonly CACHE_EXPIRY = 5 * 60 * 1000;

  static getConfig(): DatabaseConfig {
    const liveConfig = DatabaseService.getConfig();
    return {
      ...DB_CONFIG,
      spreadsheetId: liveConfig.spreadsheetId,
      apiKey: liveConfig.apiKey,
      appsScriptUrl: liveConfig.appsScriptUrl,
    };
  }

  static async fetchUsersFromSheet(): Promise<User[]> {
    const config = this.getConfig();

    if (config.apiKey.trim()) {
      try {
        const range = `${config.usersTab}!A2:I`;
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${config.spreadsheetId}/values/${encodeURIComponent(range)}?key=${config.apiKey}`;
        const response = await fetch(url);

        if (!response.ok) {
          throw new Error(`Google Sheets API error: ${response.status}`);
        }

        const data = (await response.json()) as { values?: string[][] };
        const rows = data.values || [];

        const users = rows
          .filter((row) => (row[0] || row[2] || '').trim())
          .map((row, index) => ({
            id: `user_${index + 1}`,
            email: row[0] || '',
            name: row[1] || PTOC_USER_NAMES[(row[0] || '').toLowerCase()] || row[0] || '',
            username: row[2] || (row[0] || '').split('@')[0],
            clinic: row[3] || 'PTOC',
            role: ((row[4] || 'staff').toLowerCase() as User['role']),
            team: ((row[5] || 'clinic').toLowerCase() as User['team']),
            permissions: row[6]
              ? row[6].split(',').map((permission) => permission.trim()).filter(Boolean)
              : ['view_holds', 'place_hold', 'clear_hold'],
            passwordHash: row[7] || 'AGONY',
            status: row[8] || 'active',
          }));

        if (users.length > 0) {
          return users;
        }
      } catch (error) {
        console.error('Error fetching users from sheet:', error);
      }
    }

    return buildMockUsers();
  }

  static async login(credentials: LoginCredentials): Promise<{ success: boolean; user?: User; error?: string }> {
    try {
      const input = credentials.username.toLowerCase().trim();
      const cached = this.getFromCache();

      if (cached) {
        const cachedUser = cached.find((user) =>
          user.username.toLowerCase() === input || user.email.toLowerCase() === input,
        );

        if (cachedUser && await this.verifyPassword(credentials.password, cachedUser.passwordHash || '')) {
          const updated = { ...cachedUser, lastLogin: new Date().toISOString() };
          this.saveSession(updated);
          return { success: true, user: updated };
        }
      }

      const users = await this.fetchUsersFromSheet();
      this.saveToCache(users);

      const user = users.find((candidate) =>
        candidate.username.toLowerCase() === input || candidate.email.toLowerCase() === input,
      );

      if (!user) {
        return { success: false, error: 'User not found' };
      }

      const valid = await this.verifyPassword(credentials.password, user.passwordHash || '');
      if (!valid) {
        return { success: false, error: 'Invalid password' };
      }

      const updatedUser = { ...user, lastLogin: new Date().toISOString() };
      this.saveSession(updatedUser);
      return { success: true, user: updatedUser };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Authentication failed. Please try again.' };
    }
  }

  private static async verifyPassword(inputPassword: string, storedHash: string): Promise<boolean> {
    if (inputPassword === storedHash) return true;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(inputPassword);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map((byte) => byte.toString(16).padStart(2, '0')).join('');
      return hashHex === storedHash;
    } catch {
      return false;
    }
  }

  private static saveToCache(users: User[]): void {
    localStorage.setItem(this.CACHE_KEY, JSON.stringify({ users, timestamp: Date.now() }));
  }

  private static getFromCache(): User[] | null {
    const cached = localStorage.getItem(this.CACHE_KEY);
    if (!cached) return null;

    try {
      const parsed = JSON.parse(cached) as { users: User[]; timestamp: number };
      if (Date.now() - parsed.timestamp < this.CACHE_EXPIRY) {
        return parsed.users;
      }
    } catch {
      // ignore and clear cache below
    }

    localStorage.removeItem(this.CACHE_KEY);
    return null;
  }

  static logout(): void {
    localStorage.removeItem('ptoc_user');
  }

  static saveSession(user: User): void {
    localStorage.setItem('ptoc_user', JSON.stringify(user));
  }

  static getSession(): User | null {
    const session = localStorage.getItem('ptoc_user');
    if (!session) return null;

    try {
      return JSON.parse(session) as User;
    } catch {
      return null;
    }
  }

  static hasPermission(user: User | null, permission: string): boolean {
    if (!user) return false;
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  }
}
