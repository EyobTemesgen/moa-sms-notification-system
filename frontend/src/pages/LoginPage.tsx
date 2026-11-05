import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('finance');
  const [password, setPassword] = useState('finance123');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await login(username, password);
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#eef3ec] relative p-4 sm:p-6 lg:p-8 flex items-center justify-center overflow-x-hidden">
      {/* Decorative dark green shape in top right corner (matching mockup) */}
      <div className="absolute top-0 right-0 w-80 h-48 bg-[#0d4722] rounded-bl-[4rem] pointer-events-none -z-0 opacity-90 hidden sm:block" />

      {/* Main Canvas Card */}
      <div className="w-full max-w-[1000px] bg-white rounded-3xl shadow-2xl border border-slate-200/70 overflow-hidden relative z-10 grid grid-cols-1 md:grid-cols-2 min-h-[580px]">
        {/* Left Green Hero Section */}
        <div className="bg-[#0d4722] p-8 sm:p-12 flex flex-col items-center justify-center text-center text-white relative">
          <div className="w-28 h-28 rounded-full bg-white/10 p-2 border-2 border-emerald-400/30 shadow-xl flex items-center justify-center mb-6">
            <img
              src="/moa-logo.png"
              alt="Ministry of Agriculture"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                // Fallback in case image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            Ministry of Agriculture
          </h2>
          <p className="text-emerald-200/80 text-xs sm:text-sm font-light max-w-xs">
            Federal Democratic Republic of Ethiopia
          </p>
          <div className="mt-8 text-[11px] text-emerald-300/60 uppercase tracking-widest font-mono">
            High-Value Payment Alert System
          </div>
        </div>

        {/* Right White Sign In Form */}
        <div className="p-8 sm:p-12 flex flex-col justify-center bg-white">
          <div className="max-w-sm w-full mx-auto">
            <h1 className="text-2xl font-bold text-slate-900 mb-6">Sign In</h1>

            {error && (
              <div className="mb-5 p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2 text-rose-700 text-xs animate-fadeIn">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Staff Username / Email
                </label>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white transition-all outline-none"
                  placeholder="Staff Username / Email"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-3.5 pr-10 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white transition-all outline-none"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 text-[#0d4722] rounded border-slate-300 focus:ring-[#0d4722]"
                  />
                  <span>Remember Me</span>
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full mt-2 py-3 px-4 bg-[#0d4722] hover:bg-[#093218] text-white font-semibold rounded-lg text-sm shadow-md shadow-emerald-950/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                {loading ? <span>Signing In...</span> : <span>Secure Sign In</span>}
              </button>
            </form>

            <div className="mt-8 pt-4 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Demo: <strong>finance</strong> / <strong>finance123</strong></span>
              <span>Admin: <strong>admin</strong> / <strong>admin123</strong></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
