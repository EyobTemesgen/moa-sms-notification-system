import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Stats, SystemSettings } from '../types';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  Send,
  Building2,
  Calendar,
  FileText,
  Smartphone,
  ShieldAlert,
  Sparkles,
  Zap,
} from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  const [formData, setFormData] = useState({
    voucherRef: '',
    payeeName: '',
    amount: '',
    category: 'Fertilizer Procurement',
    paymentMethod: 'Bank Transfer',
    paymentDate: new Date().toISOString().split('T')[0],
    notes: '',
  });

  const [stats, setStats] = useState<Stats | null>(null);
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadMetadata();
  }, []);

  const loadMetadata = async () => {
    try {
      const [statsData, settingsData] = await Promise.all([
        api.getStats(),
        api.getSettings(),
      ]);
      setStats(statsData);
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load metadata', err);
    }
  };

  const threshold = settings ? parseFloat(settings.thresholdAmount) : 20000000;
  const numericAmount = parseFloat(formData.amount) || 0;
  const isHighValue = numericAmount >= threshold;
  const progressPercent = Math.min(100, Math.round((numericAmount / threshold) * 100));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessResult(null);
    setLoading(true);

    try {
      const payload = {
        ...formData,
        amount: numericAmount,
      };
      const result = await api.createPayment(payload);
      setSuccessResult(result);
      setFormData({
        voucherRef: '',
        payeeName: '',
        amount: '',
        category: 'Fertilizer Procurement',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: '',
      });
      loadMetadata();
    } catch (err: any) {
      setError(err.message || 'Failed to submit payment');
    } finally {
      setLoading(false);
    }
  };

  const categories = [
    'Fertilizer Procurement',
    'Irrigation & Water Infrastructure',
    'Seed & Agricultural Inputs',
    'Machinery & Fleet Maintenance',
    'Consultancy & Professional Services',
    'Operational & Administrative Expenses',
    'Emergency Relief & Food Security',
  ];

  const setPresetAmount = (val: number) => {
    setFormData((prev) => ({ ...prev, amount: val.toString() }));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Executive Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Notification Threshold
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {(threshold / 1000000).toFixed(0)}M{' '}
                <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md border border-amber-200">
                  ETB
                </span>
              </p>
              <p className="text-[11px] text-slate-700 mt-1">All amounts above trigger SMS</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shadow-xs">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                High-Value Payments
              </p>
              <p className="text-2xl font-black text-rose-600 mt-1">
                {stats?.highValueCount ?? 0}{' '}
                <span className="text-xs font-semibold text-slate-700">Records</span>
              </p>
              <p className="text-[11px] text-slate-700 mt-1">
                {stats?.highValueAmount
                  ? (stats.highValueAmount / 1000000).toFixed(1) + 'M ETB total'
                  : '0 ETB'}
              </p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shadow-xs">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                Total Disbursements
              </p>
              <p className="text-2xl font-black text-slate-900 mt-1">
                {stats?.totalPayments ?? 0}{' '}
                <span className="text-xs font-semibold text-slate-700">Vouchers</span>
              </p>
              <p className="text-[11px] text-slate-700 mt-1">Logged into MOA audit register</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shadow-xs">
              <CreditCard className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full pointer-events-none transition-all group-hover:scale-110" />
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-slate-700">
                SMS Alerts Sent
              </p>
              <p className="text-2xl font-black text-blue-600 mt-1">
                {stats?.sentAlerts ?? 0}{' '}
                <span className="text-xs font-semibold text-slate-700">Delivered</span>
              </p>
              <p className="text-[11px] text-slate-700 mt-1">Dispatched to executives</p>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-xs">
              <Send className="w-6 h-6" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Work Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Form (7 Cols) */}
        <div className="lg:col-span-7 bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-8">
          <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
            <div className="flex items-center space-x-3.5">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">New Disbursement Voucher</h2>
                <p className="text-xs text-slate-500">Fill in details. The system checks threshold instantly.</p>
              </div>
            </div>
            <span className="text-xs px-2.5 py-1 rounded-full bg-slate-100 font-bold text-slate-600">
              Form 2026-A
            </span>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-fadeIn">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h4 className="font-bold text-sm">Disbursement Registered Successfully</h4>
                  <p className="text-xs text-emerald-800 mt-1">
                    Voucher <strong>{successResult.voucherRef}</strong> recorded for{' '}
                    <strong>{Number(successResult.amount).toLocaleString()} ETB</strong>.
                  </p>
                  {successResult.triggeredAlert ? (
                    <div className="mt-2.5 p-3 bg-emerald-100/90 rounded-xl border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center space-x-2">
                      <Zap className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
                      <span>Executive managers were automatically alerted via on-premise SMS!</span>
                    </div>
                  ) : (
                    <p className="text-[11px] text-emerald-700 mt-1">
                      Payment is below {(threshold / 1000000).toFixed(0)}M ETB threshold (no SMS trigger required).
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Voucher / PV Number *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PV-2026-0098"
                  value={formData.voucherRef}
                  onChange={(e) => setFormData({ ...formData, voucherRef: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono font-medium focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.paymentDate}
                  onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Beneficiary / Payee Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ethiopian Agricultural Transformation Agency (EATA) / Supplier"
                value={formData.payeeName}
                onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
            </div>

            {/* Amount Section with Quick Presets */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100/80 border border-slate-200">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-bold text-slate-800 uppercase tracking-wider">
                  Payment Amount (ETB) *
                </label>
                <span className="text-[11px] font-semibold text-slate-500">
                  Threshold: {(threshold / 1000000).toFixed(0)}M ETB
                </span>
              </div>

              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-extrabold text-slate-700">
                  ETB
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  required
                  placeholder="e.g. 25000000"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-white"
                />
              </div>

              {/* Quick Presets */}
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-[11px] font-semibold text-slate-500">Quick test:</span>
                {[5_000_000, 15_000_000, 20_000_000, 25_000_000, 50_000_000].map((val) => (
                  <button
                    key={val}
                    type="button"
                    onClick={() => setPresetAmount(val)}
                    className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-xs font-bold text-slate-700 hover:border-emerald-500 hover:text-emerald-700 transition-colors shadow-2xs"
                  >
                    {(val / 1000000).toFixed(0)}M
                  </button>
                ))}
              </div>

              {/* Dynamic Threshold Gauge Bar */}
              <div className="mt-4 pt-3 border-t border-slate-200/80">
                <div className="flex justify-between text-xs font-bold mb-1.5">
                  <span className="text-slate-500">Threshold Progress</span>
                  <span className={isHighValue ? 'text-amber-600 font-extrabold' : 'text-slate-700'}>
                    {progressPercent}% of {(threshold / 1000000).toFixed(0)}M ETB
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden relative">
                  <div
                    className={`h-full transition-all duration-500 ${
                      isHighValue
                        ? 'bg-gradient-to-r from-amber-500 to-rose-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Budget Category *
                </label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                >
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                >
                  <option value="Bank Transfer">Bank Transfer (CBE / NBE)</option>
                  <option value="Cheque">Official Cheque</option>
                  <option value="CPO">Certified Payment Order (CPO)</option>
                  <option value="Direct Treasury">Direct Treasury Debit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Purpose / Memo Notes
              </label>
              <textarea
                rows={3}
                placeholder="Contract reference, procurement batch notes, project code, or supplier details..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-xl transition-all flex items-center justify-center space-x-2.5 ${
                isHighValue
                  ? 'bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 text-white shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Processing Disbursement & Checking Alerts...</span>
              ) : isHighValue ? (
                <>
                  <Send className="w-5 h-5 animate-pulse" />
                  <span>Submit Payment & Fire Executive SMS Alert</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Save Disbursement</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Right Column: Realistic Phone Preview Card (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Smartphone Simulator Mockup */}
          <div className="bg-slate-900 rounded-[2.5rem] p-4 pt-6 pb-6 shadow-2xl border-4 border-slate-800 text-white relative max-w-sm mx-auto">
            {/* Phone Speaker Notch */}
            <div className="w-24 h-4 bg-slate-800 rounded-full mx-auto mb-4 flex items-center justify-center">
              <div className="w-3 h-3 rounded-full bg-slate-700" />
            </div>

            {/* Phone Screen Status Bar */}
            <div className="flex justify-between items-center text-[10px] text-slate-400 px-4 mb-4">
              <span>9:41 AM</span>
              <div className="flex items-center space-x-1.5">
                <span>Ethio Telecom 4G</span>
                <span className="font-bold">100%</span>
              </div>
            </div>

            {/* Message App Header */}
            <div className="border-b border-slate-800 pb-3 mb-4 text-center">
              <div className="w-10 h-10 rounded-full bg-emerald-600/30 text-emerald-400 flex items-center justify-center mx-auto mb-1 ring-2 ring-emerald-500/40">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <p className="font-extrabold text-xs text-white">MOA-FINANCE</p>
              <p className="text-[10px] text-slate-400">On-Premise SMS Gateway</p>
            </div>

            {/* Chat Bubble Container */}
            <div className="min-h-[160px] bg-slate-950/80 rounded-2xl p-4 border border-slate-800/80 space-y-3">
              <div className="text-center text-[10px] text-slate-500">Today 9:41 AM</div>

              {isHighValue ? (
                <div className="bg-emerald-700 text-white p-3.5 rounded-2xl rounded-tl-xs text-xs font-sans leading-relaxed shadow-md">
                  <div className="font-bold text-amber-300 flex items-center gap-1 mb-1">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>MOA High-Value Payment Alert</span>
                  </div>
                  <p>
                    Payment of ETB{' '}
                    <strong className="underline decoration-amber-300 underline-offset-2">
                      {numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </strong>{' '}
                    issued to "{formData.payeeName || '[Beneficiary]'}" (Ref:{' '}
                    {formData.voucherRef || 'PV-2026-XXXX'}).
                  </p>
                  <p className="mt-1 text-[11px] text-emerald-200">
                    Category: {formData.category} &bull; Date: {formData.paymentDate}
                  </p>
                </div>
              ) : (
                <div className="text-center py-8 text-xs text-slate-500 italic">
                  Amounts under {(threshold / 1000000).toFixed(0)}M ETB do not trigger SMS alerts.
                  <br />
                  <span className="text-[11px] text-emerald-400 mt-2 inline-block font-mono">
                    Type &ge; {(threshold / 1000000).toFixed(0)},000,000 to preview
                  </span>
                </div>
              )}
            </div>

            {/* Phone Footer Info */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 text-center text-[10px] text-slate-400">
              Directly delivered to Minister & Directors
            </div>
          </div>

          {/* Alert Protocol Card */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
            <h4 className="font-bold text-slate-900 text-sm flex items-center gap-2">
              <Building2 className="w-4 h-4 text-emerald-600" />
              <span>MOA Executive Alert Policy</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              In accordance with Ministry financial protocols, disbursements over{' '}
              <strong>{(threshold / 1000000).toFixed(0)} Million ETB</strong> trigger instant SMS
              notifications to executive leaders to maintain real-time financial oversight.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
