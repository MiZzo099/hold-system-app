export interface User {
  id: string;
  email: string;
  name: string;
  username: string;
  clinic: string;
  role: 'admin' | 'staff' | 'viewer';
  team: 'referral' | 'benefits' | 'customercare' | 'clinic';
  permissions: string[];
  lastLogin?: string;
  passwordHash?: string;
  status?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
  error: string | null;
}

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface DatabaseConfig {
  spreadsheetId: string;
  apiKey: string;
  appsScriptUrl?: string;
  usersTab: string;
}
