import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings, SmsAlert } from '../types';
import {
  Activity,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
} from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  const [amount, setAmount] = useState('1,500,000');
  const [description, setDescription] = useState('Payment of ETB 1,500,000 process');
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
      setDescription(`Payment of ETB ${num.toLocaleString()} process`);
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
      setSuccessMsg(`Notification triggered successfully for ETB ${cleanNumericAmount.toLocaleString()}!`);
      setVoucherRef(`PV-${(parseInt(voucherRef.replace(/\D/g, '')) + 1) || Date.now().toString().slice(-4)}`);
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to trigger notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div className="flex items-center justify-between pb-1">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
          Payment Notification Wizard
        </h2>
      </div>

      {/* Success / Error Alerts */}
      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}
      {errorMsg && (
        <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm flex items-center space-x-2.5 animate-fadeIn">
          <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
          <span className="font-semibold">{errorMsg}</span>
        </div>
      )}

      {/* Top Grid: Form (Left) & Status/Preview (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: High-Amount Payment Notification */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
          <h3 className="text-base font-bold text-slate-900 mb-5">
            High-Amount Payment Notification
          </h3>

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
                  className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white outline-none"
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white resize-none outline-none"
                placeholder="Payment of ETB 1,500,000 process"
              />
            </div>

            {/* Threshold Alert Indicator Banner (Matches Mockup Screen 2) */}
            <div className="p-3.5 bg-amber-50/90 border border-amber-200/90 rounded-xl space-y-2">
              <div className="flex items-center space-x-1.5 text-amber-800 text-xs font-bold">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Threshold Alert Indicator</span>
              </div>
              <p className="text-[11px] text-amber-700 font-medium">
                High-amount alert limit: ETB in (above threshold)
              </p>
              <div className="relative pt-1">
                <div className="w-full bg-amber-200/70 rounded-full h-3 flex items-center justify-center relative overflow-hidden">
                  <div
                    className="bg-amber-400 h-full rounded-full transition-all duration-300"
                    style={{ width: `${Math.min(100, Math.max(15, (cleanNumericAmount / (threshold * 1.5)) * 100))}%` }}
                  />
                  <span className="absolute text-[10px] font-bold text-amber-900 tracking-tight">
                    ETB {threshold.toLocaleString()} ETB
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
                className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm font-mono text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white outline-none"
                placeholder="+251912345789"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 bg-[#0d4722] hover:bg-[#0a381b] text-white font-semibold rounded-lg text-sm shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-60 mt-3"
            >
              {loading ? (
                <span>Triggering SMS...</span>
              ) : (
                <span>Trigger Notification</span>
              )}
            </button>
          </form>
        </div>

        {/* Right Cards: SMS Gateway Status & SMS Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* SMS Gateway Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">SMS Gateway Status</h3>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="flex items-center space-x-3.5 pt-1">
              <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 shrink-0">
                <Activity className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium leading-none">
                  On-Premise SMS Gateway:
                </p>
                <p className="text-sm font-bold text-[#0d4722] mt-1 leading-none">
                  Connected
                </p>
              </div>
            </div>
          </div>

          {/* SMS Preview Card with Smartphone Mockup */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-5 overflow-hidden relative min-h-[220px]">
            <h3 className="text-sm font-bold text-slate-900 mb-4">SMS Preview</h3>

            {/* SMS Message Bubble */}
            <div className="flex items-start space-x-3 z-10 relative">
              <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 shrink-0 mt-0.5">
                <UserIcon className="w-4 h-4" />
              </div>

              <div className="flex-1 bg-slate-100 p-3 rounded-2xl rounded-tl-xs text-xs text-slate-800 leading-relaxed font-sans shadow-2xs">
                <p>
                  <strong>Finance Alert:</strong> Payment of ETB {amount || '1,500,000'} processed. Approved by Finance.
                </p>
              </div>
            </div>

            {/* Smartphone Graphic Mockup peeking from right side */}
            <div className="mt-4 pt-3 flex justify-end">
              <div className="w-44 h-32 border-[3px] border-slate-800 rounded-t-3xl p-2.5 bg-slate-50 shadow-xl relative overflow-hidden flex flex-col justify-between">
                {/* Speaker notch */}
                <div className="w-14 h-1.5 bg-slate-800 rounded-full mx-auto" />
                {/* Mock display */}
                <div className="mt-2 text-center text-[10px] text-slate-600 font-mono">
                  <div className="font-bold text-emerald-700">● 4G Telecom</div>
                  <div className="text-[9px] text-slate-400 mt-0.5">MOA SMS Gateway</div>
                </div>
                {/* Bottom line */}
                <div className="w-16 h-1 bg-slate-300 rounded-full mx-auto mt-2" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Dispatched Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <h3 className="text-base font-bold text-slate-900 mb-4">
          Recent Dispatched Notifications
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-semibold text-slate-500 border-b border-slate-200/70 pb-2">
              <tr>
                <th className="py-2.5 px-3">Previous ↑</th>
                <th className="py-2.5 px-3">Mobil No.</th>
                <th className="py-2.5 px-3">Datert time</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-3 font-mono text-slate-600">+12364831833984</td>
                    <td className="py-3 px-3 text-slate-500">2023-07-23 18:03:00</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sent
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-3 font-mono text-slate-600">+1336475180886</td>
                    <td className="py-3 px-3 text-slate-500">2023-07-20 18:03:00</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                        Pending
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-3 font-mono text-slate-600">+251912345789</td>
                    <td className="py-3 px-3 text-slate-500">2026-11-05 19:40:00</td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        Sent
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right text-slate-400">
                      <MoreHorizontal className="w-4 h-4 inline cursor-pointer hover:text-slate-700" />
                    </td>
                  </tr>
                </>
              ) : (
                recentLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900">High-Amount Payment</td>
                    <td className="py-3 px-3 font-mono text-slate-600">{log.recipientNumber}</td>
                    <td className="py-3 px-3 text-slate-500">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Pending'}
                    </td>
                    <td className="py-3 px-3">
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
                    <td className="py-3 px-3 text-right text-slate-400">
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
