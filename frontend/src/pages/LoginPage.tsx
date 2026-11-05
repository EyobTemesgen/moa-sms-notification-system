import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Eye, EyeOff, AlertCircle, ShieldCheck, Lock, User } from 'lucide-react';

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
    <div className="min-h-screen w-full flex flex-col md:flex-row bg-slate-50 antialiased">
      {/* Left Brand Hero (5 Columns) */}
      <div className="md:w-5/12 lg:w-5/12 bg-[#0d4722] text-white p-8 sm:p-12 lg:p-16 flex flex-col justify-between relative overflow-hidden">
        {/* Subtle geometric background overlay */}
        <div className="absolute -right-24 -bottom-24 w-96 h-96 rounded-full bg-emerald-600/10 pointer-events-none blur-2xl" />
        <div className="absolute -left-20 -top-20 w-80 h-80 rounded-full bg-emerald-400/10 pointer-events-none blur-xl" />

        {/* Top Header */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-emerald-800/60 border border-emerald-700/50 text-[11px] font-mono text-emerald-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>MOA On-Premise Gateway</span>
          </div>
        </div>

        {/* Center Emblem & Branding */}
        <div className="my-auto py-12 text-center md:text-left relative z-10 flex flex-col items-center md:items-start">
          <div className="w-24 h-24 rounded-full bg-white/10 p-2 border-2 border-emerald-400/30 shadow-2xl flex items-center justify-center mb-6">
            <img
              src="/moa-logo.png"
              alt="Ministry of Agriculture"
              className="w-full h-full object-contain rounded-full"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white leading-tight">
            Ministry of Agriculture
          </h1>
          <p className="text-emerald-200 text-sm font-light mt-2 max-w-sm">
            Federal Democratic Republic of Ethiopia
          </p>
          <div className="w-16 h-1 bg-emerald-400/60 rounded-full my-6" />
          <p className="text-emerald-100/80 text-xs sm:text-sm leading-relaxed max-w-md">
            High-Value Payment SMS Notification System. Automatic instant dispatch for executive oversight and financial compliance.
          </p>
        </div>

        {/* Bottom Trust Badge */}
        <div className="relative z-10 pt-6 border-t border-emerald-800/60 flex items-center space-x-2 text-xs text-emerald-300/80">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>Encrypted Internal Finance Portal</span>
        </div>
      </div>

      {/* Right Sign-In Form (7 Columns) */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12 lg:p-20 bg-white md:bg-slate-50">
        <div className="w-full max-w-md bg-white md:p-10 md:rounded-3xl md:shadow-xl md:border md:border-slate-200/80">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Staff Sign In</h2>
            <p className="text-xs text-slate-500 mt-1">
              Authenticate to manage payments, notification rules, and gateway configurations.
            </p>
          </div>

          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center space-x-2.5 text-rose-700 text-xs animate-fadeIn">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Username / Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white transition-all outline-none"
                  placeholder="finance"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white transition-all outline-none"
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
              <label className="flex items-center space-x-2 cursor-pointer text-xs text-slate-600 select-none">
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
              className="w-full mt-2 py-3 px-4 bg-[#0d4722] hover:bg-[#093218] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#0d4722]/20 transition-all disabled:opacity-50 flex items-center justify-center space-x-2"
            >
              {loading ? <span>Signing In...</span> : <span>Secure Sign In</span>}
            </button>
          </form>

          {/* Single User Access Info */}
          <div className="mt-8 pt-5 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
            <span>Authorized User: <strong className="text-slate-800 font-mono">finance</strong> / <strong className="text-slate-800 font-mono">finance123</strong></span>
            <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">Full Access</span>
          </div>
        </div>
      </div>
    </div>
  );
};
