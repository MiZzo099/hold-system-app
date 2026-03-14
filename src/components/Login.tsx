import { useState } from 'react';
import { AuthService } from '../services/authService';

interface LoginProps {
  onLoginSuccess: (user: unknown) => void;
}

export function Login({ onLoginSuccess }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await AuthService.login({ username, password });
      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Login failed. Please try again.');
      }
    } catch {
      setError('An error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.15),_transparent_35%),linear-gradient(135deg,#0f172a_0%,#111827_45%,#020617_100%)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-400 to-blue-600 shadow-2xl shadow-blue-500/30">
            <svg className="h-9 w-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white">PTOC Hold Management</h1>
          <p className="mt-2 text-sm text-slate-400">Live Google Sheets workflow for hold, clear, escalation, and history tracking</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-700/80 bg-slate-900/80 p-8 shadow-2xl backdrop-blur-xl">
          {error ? (
            <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mb-5">
            <label htmlFor="username" className="mb-2 block text-sm font-medium text-slate-200">
              Username or Email
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="auth28@cobsolution.com"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="mb-2 block text-sm font-medium text-slate-200">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Enter password"
              disabled={isLoading}
              className="w-full rounded-xl border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-3 font-semibold text-white shadow-lg shadow-blue-900/40 transition hover:from-blue-600 hover:to-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isLoading ? 'Signing in...' : 'Sign In'}
          </button>

          <div className="mt-6 border-t border-slate-800 pt-6 text-center">
            <p className="text-xs text-slate-400">Use your PTOC email or username</p>
            <p className="mt-2 text-xs text-slate-500">
              Default team password: <span className="font-bold text-blue-400">AGONY</span>
            </p>
          </div>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          <p>Connected to PTOC Database v9.5</p>
          <p className="mt-1">Configure live write access inside the Integration tab after login</p>
        </div>
      </div>
    </div>
  );
}
