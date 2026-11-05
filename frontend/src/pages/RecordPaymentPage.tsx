import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Stats, SystemSettings } from '../types';
import {
  CreditCard,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  TrendingUp,
  Send,
  Building2,
  Calendar,
  FileText,
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
      // Reset form with new voucher suggestion
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

  return (
    <div className="space-y-8">
      {/* Top Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Alert Threshold</p>
            <p className="text-xl font-bold text-gray-900 mt-1">
              {(threshold / 1000000).toFixed(0)}M <span className="text-sm font-normal text-gray-500">ETB</span>
            </p>
          </div>
          <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
            <AlertTriangle className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">High-Value Count</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.highValueCount ?? 0}</p>
          </div>
          <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
            <TrendingUp className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Total Payments</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.totalPayments ?? 0}</p>
          </div>
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
            <CreditCard className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">SMS Alerts Sent</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{stats?.sentAlerts ?? 0}</p>
          </div>
          <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
            <Send className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 sm:p-8">
          <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <CreditCard className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">Record Finance Payment</h2>
              <p className="text-xs text-gray-500">Enter disbursement details. High payments will immediately alert managers.</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successResult && (
            <div className="mb-6 p-5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900">
              <div className="flex items-start space-x-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <h4 className="font-semibold text-base">Payment Recorded Successfully</h4>
                  <p className="text-sm text-emerald-700 mt-1">
                    Voucher <strong>{successResult.voucherRef}</strong> recorded for <strong>{Number(successResult.amount).toLocaleString()} ETB</strong>.
                  </p>
                  {successResult.triggeredAlert ? (
                    <div className="mt-2.5 p-3 bg-emerald-100/70 rounded-xl border border-emerald-300 text-xs text-emerald-800 font-medium flex items-center space-x-2">
                      <Send className="w-4 h-4 text-emerald-700" />
                      <span>SMS notification was dispatched to executive managers!</span>
                    </div>
                  ) : (
                    <p className="text-xs text-emerald-600 mt-1">
                      Payment is below the {(threshold / 1000000).toFixed(0)}M ETB threshold (no SMS trigger required).
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Voucher / Reference No. *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. PV-2026-0145"
                  value={formData.voucherRef}
                  onChange={(e) => setFormData({ ...formData, voucherRef: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Payment Date *
                </label>
                <div className="relative">
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                Payee / Beneficiary Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Ethiopian Agricultural Transformation Agency / ABC Supplier"
                value={formData.payeeName}
                onChange={(e) => setFormData({ ...formData, payeeName: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Payment Amount (ETB) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-gray-600">
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
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                {numericAmount > 0 && (
                  <p className="text-xs text-gray-700 mt-1">
                    {numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} ETB
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  Payment Method *
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                >
                  <option value="Bank Transfer">Bank Transfer (CBE / NBE)</option>
                  <option value="Cheque">Official Cheque</option>
                  <option value="CPO">Certified Payment Order (CPO)</option>
                  <option value="Direct Treasury">Direct Treasury Debit</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                Budget Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                Remarks / Purpose
              </label>
              <textarea
                rows={3}
                placeholder="Contract reference, procurement batch notes, or project description..."
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-semibold text-sm shadow-md transition-all flex items-center justify-center space-x-2 ${
                isHighValue
                  ? 'bg-amber-600 hover:bg-amber-700 text-white shadow-amber-600/30'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
              } disabled:opacity-50`}
            >
              {loading ? (
                <span>Recording Payment & Dispatching...</span>
              ) : isHighValue ? (
                <>
                  <Send className="w-4 h-4" />
                  <span>Submit Payment & Trigger Manager SMS</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Record Payment</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live SMS Threshold Warning & Simulation Side-Card */}
        <div className="space-y-6">
          <div
            className={`p-6 rounded-2xl border transition-all shadow-sm ${
              isHighValue
                ? 'bg-amber-50/70 border-amber-300'
                : 'bg-white border-gray-200'
            }`}
          >
            <div className="flex items-center space-x-3 mb-4">
              <div
                className={`p-2 rounded-xl ${
                  isHighValue
                    ? 'bg-amber-500 text-white animate-pulse'
                    : 'bg-gray-100 text-gray-500'
                }`}
              >
                <AlertTriangle className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-gray-900 text-base">Threshold Monitor</h3>
            </div>

            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Active Alert Rule:</span>
                <span className="font-semibold text-gray-900">
                  &ge; {threshold.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-gray-100">
                <span className="text-gray-500">Entered Amount:</span>
                <span
                  className={`font-bold ${
                    isHighValue ? 'text-amber-700' : 'text-gray-900'
                  }`}
                >
                  {numericAmount.toLocaleString()} ETB
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-gray-500">Alert Trigger Status:</span>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                    isHighValue
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-gray-100 text-gray-600'
                  }`}
                >
                  {isHighValue ? '🚨 SMS TRIGGER ARMED' : 'Standard (No Alert)'}
                </span>
              </div>
            </div>

            {/* Simulated Live SMS Message Preview */}
            <div className="mt-6 pt-5 border-t border-gray-200">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-2 flex items-center gap-1.5">
                <Send className="w-3.5 h-3.5" /> Live SMS Preview
              </p>
              <div className="bg-gray-900 text-gray-100 p-4 rounded-xl text-xs font-mono leading-relaxed border border-gray-800 shadow-inner">
                {isHighValue ? (
                  <p>
                    <span className="text-emerald-400 font-bold">[MOA Payment Alert]</span>
                    <br />
                    High-value payment of ETB{' '}
                    <span className="text-yellow-300 font-bold">
                      {numericAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>{' '}
                    issued to "{formData.payeeName || '[Beneficiary]'}" (Ref:{' '}
                    {formData.voucherRef || 'PV-XXXX'}) for {formData.category}.
                  </p>
                ) : (
                  <p className="text-gray-400 italic">
                    Amounts under {threshold.toLocaleString()} ETB will not trigger SMS alerts.
                  </p>
                )}
              </div>
              <p className="text-[11px] text-gray-700 mt-2 font-medium">
                Sent to all active executive phone numbers registered in Settings.
              </p>
            </div>
          </div>

          {/* System Info card */}
          <div className="bg-white p-5 rounded-2xl border border-gray-200 text-xs text-gray-600 space-y-2">
            <h4 className="font-bold text-gray-800 flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-emerald-600" /> Ministry On-Premise Gateway
            </h4>
            <p>
              Connected via internal gateway service. Alerts are delivered instantly to managerial devices without third-party cloud dependencies.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

