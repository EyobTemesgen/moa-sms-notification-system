import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings } from '../types';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  Send,
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

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [successResult, setSuccessResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const settingsData = await api.getSettings();
      setSettings(settingsData);
    } catch (err: any) {
      console.error('Failed to load settings', err);
    }
  };

  const threshold = settings ? parseFloat(settings.thresholdAmount) : 20000000;
  const numericAmount = parseFloat(formData.amount) || 0;
  const isHighValue = numericAmount >= threshold;

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

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Success Notification */}
      {successResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-950 animate-fadeIn shadow-xs">
          <div className="flex items-start space-x-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="font-bold text-sm">Disbursement Registered Successfully</h4>
              <p className="text-xs text-emerald-800 mt-1">
                Voucher <strong>{successResult.voucherRef}</strong> recorded for{' '}
                <strong>{Number(successResult.amount).toLocaleString()} ETB</strong>.
              </p>
              {successResult.triggeredAlert ? (
                <div className="mt-2.5 p-3 bg-emerald-100/90 rounded-xl border border-emerald-300 text-xs text-emerald-900 font-semibold flex items-center space-x-2">
                  <Zap className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>Executive SMS alerts were automatically dispatched to manager devices!</span>
                </div>
              ) : (
                <p className="text-[11px] text-emerald-700 mt-1">
                  Payment is below {(threshold / 1000000).toFixed(0)}M ETB threshold (no SMS alert required).
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Error Notification */}
      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center space-x-3 shadow-xs">
          <AlertTriangle className="w-5 h-5 flex-shrink-0 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Payment Form Card */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm p-6 sm:p-10">
        <div className="flex items-center justify-between pb-6 mb-6 border-b border-slate-100">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Record Finance Payment</h2>
              <p className="text-xs text-slate-500">
                Disbursements &ge; {(threshold / 1000000).toFixed(0)}M ETB trigger automatic manager SMS alerts.
              </p>
            </div>
          </div>
          <span className="text-xs px-3 py-1 rounded-full bg-slate-100 font-bold text-slate-600 border border-slate-200">
            Rule: &ge; {(threshold / 1000000).toFixed(0)}M ETB
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                Voucher / Reference No. *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. PV-2026-0045"
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
              Payee / Beneficiary Name *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Ethiopian Agricultural Transformation Agency / Supplier"
              value={formData.payeeName}
              onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          {/* Amount Field with Threshold Notice */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
                Payment Amount (ETB) *
              </label>
              {numericAmount > 0 && (
                <span className="text-xs font-semibold text-slate-500">
                  {numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                </span>
              )}
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
                className={`w-full pl-14 pr-4 py-3.5 rounded-xl border text-base font-bold transition-all ${
                  isHighValue
                    ? 'border-amber-400 bg-amber-50/40 text-amber-950 focus:ring-2 focus:ring-amber-500'
                    : 'border-slate-300 bg-slate-50/50 text-slate-900 focus:ring-2 focus:ring-emerald-500'
                }`}
              />
            </div>

            {/* Threshold Alert Callout */}
            {isHighValue && (
              <div className="mt-3 p-3.5 rounded-xl bg-amber-50 border border-amber-300 flex items-center space-x-2.5 text-xs text-amber-900 font-semibold animate-fadeIn">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  High-Value Trigger: Amount exceeds {(threshold / 1000000).toFixed(0)}M ETB. Manager SMS notifications will fire upon submission.
                </span>
              </div>
            )}
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
              Purpose / Notes (Optional)
            </label>
            <textarea
              rows={3}
              placeholder="Contract reference, procurement batch notes, project code..."
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-4 px-6 rounded-2xl font-bold text-sm shadow-lg transition-all flex items-center justify-center space-x-2.5 ${
              isHighValue
                ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            } disabled:opacity-50`}
          >
            {loading ? (
              <span>Recording Payment...</span>
            ) : isHighValue ? (
              <>
                <Send className="w-4 h-4" />
                <span>Submit & Send Manager SMS Alert</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Submit Payment</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
