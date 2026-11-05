import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings, SmsAlert } from '../types';
import {
  Activity,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Smartphone,
  ShieldAlert,
} from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  const [amount, setAmount] = useState('1,500,000');
  const [description, setDescription] = useState('Payment of ETB 1,500,000 processed for Agricultural Inputs.');
  const [mobileNumber, setMobileNumber] = useState('+251912345789');
  const [voucherRef, setVoucherRef] = useState(`PV-${Date.now().toString().slice(-4)}`);

  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [recentLogs, setRecentLogs] = useState<SmsAlert[]>([]);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [settingsData, logsData] = await Promise.all([
        api.getSettings(),
        api.getSmsLogs(),
      ]);
      setSettings(settingsData);
      setRecentLogs(logsData.slice(0, 5));
    } catch (err: any) {
      console.error('Failed to load initial data', err);
    }
  };

  const cleanNumericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const threshold = settings ? parseFloat(settings.thresholdAmount) : 1000000;
  const isAboveThreshold = cleanNumericAmount >= threshold;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setAmount(num.toLocaleString());
      setDescription(`Payment of ETB ${num.toLocaleString()} processed for Agricultural Inputs.`);
    } else {
      setAmount(raw);
    }
  };

  const handleTriggerNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        voucherRef: voucherRef || `PV-${Date.now().toString().slice(-4)}`,
        payeeName: 'Ethiopian Agricultural Business Corp',
        amount: cleanNumericAmount,
        category: 'Agricultural Inputs & Infrastructure',
        paymentMethod: 'Bank Transfer',
        paymentDate: new Date().toISOString().split('T')[0],
        notes: description,
      };

      await api.createPayment(payload);
      setSuccessMsg(`Notification dispatched successfully for ETB ${cleanNumericAmount.toLocaleString()}!`);
      setVoucherRef(`PV-${(parseInt(voucherRef.replace(/\D/g, '')) + 1) || Date.now().toString().slice(-4)}`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to dispatch notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Payment Notification Wizard
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record government disbursements and dispatch instant SMS alerts to executive leadership.
          </p>
        </div>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center space-x-2.5 shadow-2xs animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center space-x-2.5 shadow-2xs animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Top Grid: Form (Left 7 cols) & Status/Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: High-Amount Payment Notification */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
          <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-100">
            <h3 className="text-base font-bold text-slate-900">
              High-Amount Payment Notification
            </h3>
            <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-md">
              {voucherRef}
            </span>
          </div>

          <form onSubmit={handleTriggerNotification} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Amount (above threshold)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={amount ? `ETB ${amount}` : ''}
                  onChange={(e) => {
                    const val = e.target.value.replace(/^ETB\s*/i, '');
                    handleAmountChange({ target: { value: val } } as any);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white outline-none"
                  placeholder="ETB 1,500,000"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Description
              </label>
              <textarea
                rows={2}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white resize-none outline-none"
                placeholder="Payment of ETB 1,500,000 processed for Agricultural Inputs"
              />
            </div>

            {/* Threshold Alert Indicator Banner */}
            <div className={`p-4 rounded-xl border space-y-2 transition-colors ${
              isAboveThreshold
                ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 text-xs font-bold">
                  {isAboveThreshold ? (
                    <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                  <span>Threshold Alert Indicator</span>
                </div>
                <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-white/70 border border-amber-200">
                  {isAboveThreshold ? 'Alert Triggered' : 'Standard Level'}
                </span>
              </div>

              <p className="text-[11px] text-amber-800/90 font-medium">
                High-amount alert limit: ETB {threshold.toLocaleString()} (Threshold Active)
              </p>

              <div className="relative pt-1">
                <div className="w-full bg-amber-200/60 rounded-full h-3.5 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, Math.max(10, (cleanNumericAmount / (threshold * 1.5)) * 100))}%`,
                    }}
                  />
                  <span className="absolute text-[10px] font-bold text-amber-950 tracking-tight">
                    ETB {threshold.toLocaleString()} Limit
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                Recipient Manager Mobile No.
              </label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white outline-none"
                placeholder="+251912345789"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0d4722] hover:bg-[#093218] text-white font-semibold rounded-xl text-sm shadow-md shadow-[#0d4722]/15 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 mt-3"
            >
              {loading ? (
                <span>Dispatching SMS...</span>
              ) : (
                <span>Trigger Notification</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Cards: SMS Gateway Status & SMS Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* SMS Gateway Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">SMS Gateway Status</h3>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 flex items-center justify-center text-emerald-800 shrink-0">
                <Activity className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">
                  On-Premise SMS Gateway:
                </p>
                <p className="text-base font-extrabold text-[#0d4722] mt-0.5">
                  Connected
                </p>
              </div>
            </div>
          </div>

          {/* SMS Preview Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">SMS Preview</h3>
              <span className="text-[11px] text-slate-400 font-mono">Real-time template</span>
            </div>

            {/* Smartphone UI Container */}
            <div className="bg-slate-900 rounded-3xl p-3.5 shadow-lg max-w-sm mx-auto text-white">
              {/* Phone Notch */}
              <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Message Screen Area */}
              <div className="bg-slate-100 rounded-2xl p-4 text-slate-800 space-y-3 min-h-[140px] flex flex-col justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center text-xs font-bold shrink-0">
                    MOA
                  </div>
                  <div className="bg-white p-3 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 leading-relaxed border border-slate-200/60">
                    <p className="font-semibold text-emerald-950 mb-1">
                      Finance Alert:
                    </p>
                    <p>
                      Payment of ETB {amount || '1,500,000'} processed. Approved by Finance.
                    </p>
                    <div className="text-[10px] text-slate-400 text-right mt-1.5 font-mono">
                      Just now • SMS Gateway
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-slate-400 font-mono border-t border-slate-200/60 pt-2">
                  Delivered to: {mobileNumber || '+251912345789'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Dispatched Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900">
            Recent Dispatched Notifications
          </h3>
          <span className="text-xs text-slate-500">Latest 5 dispatch operations</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-semibold text-slate-500 border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Event Type ↑</th>
                <th className="py-3 px-4">Mobile No.</th>
                <th className="py-3 px-4">Date / Time</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+12364831833984</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">2026-07-23 18:03:00</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sent
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+1336475180886</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">2026-07-20 18:03:00</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+251912345789</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">2026-11-05 19:40:00</td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sent
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                </>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-4 font-mono text-slate-700">{log.recipientNumber}</td>
                    <td className="py-3 px-4 text-slate-500 font-mono">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Pending'}
                    </td>
                    <td className="py-3 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'SENT'
                            ? 'bg-emerald-100 text-emerald-800'
                            : log.status === 'PENDING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {log.status === 'SENT' ? 'Sent' : log.status === 'PENDING' ? 'Pending' : 'Failed'}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
