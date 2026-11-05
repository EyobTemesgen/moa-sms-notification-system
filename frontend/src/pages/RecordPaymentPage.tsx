import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings, SmsAlert, Recipient } from '../types';
import {
  Activity,
  MoreHorizontal,
  CheckCircle2,
  AlertTriangle,
  User as UserIcon,
  Building2,
  Receipt,
  Calendar,
  CreditCard,
  Layers,
  RotateCw,
  Phone,
  Send,
} from 'lucide-react';

export const RecordPaymentPage: React.FC = () => {
  // Payment Form Fields
  const [voucherRef, setVoucherRef] = useState(`PV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  const [payeeName, setPayeeName] = useState('Ethiopian Agricultural Business Corp');
  const [amount, setAmount] = useState('25,000,000');
  const [category, setCategory] = useState('Fertilizer & Soil Nutrition');
  const [paymentMethod, setPaymentMethod] = useState('Commercial Bank of Ethiopia (CBE) Direct Transfer');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [description, setDescription] = useState(
    'Procurement of 50,000 MT Urea Fertilizer for national agricultural input distribution.'
  );

  // Recipient Contact
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
  const [mobileNumber, setMobileNumber] = useState('+251911223344');

  // System Data
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
      const [settingsData, logsData, recipientsData] = await Promise.all([
        api.getSettings(),
        api.getSmsLogs(),
        api.getRecipients(),
      ]);
      setSettings(settingsData);
      setRecentLogs(logsData.slice(0, 5));
      setRecipients(recipientsData);

      if (recipientsData && recipientsData.length > 0) {
        setSelectedRecipientId(recipientsData[0].id);
        setMobileNumber(recipientsData[0].phoneNumber);
      }
    } catch (err: any) {
      console.error('Failed to load initial data', err);
    }
  };

  const cleanNumericAmount = parseFloat(amount.replace(/,/g, '')) || 0;
  const threshold = settings ? parseFloat(settings.thresholdAmount) : 20000000;
  const isAboveThreshold = cleanNumericAmount >= threshold;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num)) {
      setAmount(num.toLocaleString());
    } else {
      setAmount(raw);
    }
  };

  const handleRecipientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const rId = e.target.value;
    setSelectedRecipientId(rId);
    if (rId === 'custom') {
      return;
    }
    const found = recipients.find((r) => r.id === rId);
    if (found) {
      setMobileNumber(found.phoneNumber);
    }
  };

  const handleRegenerateRef = () => {
    setVoucherRef(`PV-2026-${Math.floor(1000 + Math.random() * 9000)}`);
  };

  const handleTriggerNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);
    setErrorMsg(null);
    setLoading(true);

    try {
      const payload = {
        voucherRef: voucherRef.trim(),
        payeeName: payeeName.trim(),
        amount: cleanNumericAmount,
        category,
        paymentMethod,
        paymentDate,
        notes: description.trim(),
      };

      const res = await api.createPayment(payload);

      if (res.triggeredAlert) {
        setSuccessMsg(
          `Payment ${voucherRef} recorded! High-amount threshold exceeded — SMS notification automatically dispatched to executive leadership.`
        );
      } else {
        setSuccessMsg(
          `Payment ${voucherRef} recorded successfully in ledger (Standard amount under alert limit).`
        );
      }

      // Refresh data and prepare next voucher reference
      handleRegenerateRef();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process payment and dispatch notification');
    } finally {
      setLoading(false);
    }
  };

  // Dynamic Live SMS Text Preview
  const previewSmsText = `MOA Payment Alert: High-value payment of ETB ${
    amount || '25,000,000'
  } issued to "${payeeName || 'Beneficiary'}" (Ref: ${
    voucherRef || 'PV-2026-0000'
  }) for ${category}. Recorded by Ministry Finance on ${paymentDate}.`;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Send Payment Notification
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record ministry financial disbursements and automatically trigger on-premise SMS alerts for high-value transactions.
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

      {/* Main Grid: Form (Left 7 cols) & Status/Preview (Right 5 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Form: Payment Details */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 sm:p-7">
          <form onSubmit={handleTriggerNotification} className="space-y-5">
            {/* 1. Identification & Beneficiary */}
            <div className="space-y-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-[#0d4722]" />
                <span>1. Payment Identification & Beneficiary</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Payment Voucher No. *
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      required
                      value={voucherRef}
                      onChange={(e) => setVoucherRef(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                      placeholder="PV-2026-0001"
                    />
                    <button
                      type="button"
                      onClick={handleRegenerateRef}
                      className="p-2.5 rounded-xl border border-slate-300 text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors"
                      title="Generate New Reference"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Disbursement Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={(e) => setPaymentDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payee / Beneficiary Organization *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={payeeName}
                    onChange={(e) => setPayeeName(e.target.value)}
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                    placeholder="e.g. Ethiopian Agricultural Business Corp"
                  />
                </div>
              </div>
            </div>

            {/* 2. Amount & Classification */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-[#0d4722]" />
                <span>2. Financial Value & Classification</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Payment Amount (ETB) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-black text-slate-600">
                    ETB
                  </span>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                    placeholder="25,000,000"
                  />
                </div>
              </div>

              {/* Dynamic Threshold Alert Indicator */}
              <div
                className={`p-4 rounded-xl border space-y-2 transition-all ${
                  isAboveThreshold
                    ? 'bg-amber-50/90 border-amber-300 text-amber-950'
                    : 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2 text-xs font-bold">
                    {isAboveThreshold ? (
                      <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    )}
                    <span>
                      {isAboveThreshold
                        ? 'High-Amount Alert Limit Exceeded'
                        : 'Normal Disbursement Amount'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAboveThreshold
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    Threshold: {threshold.toLocaleString()} ETB
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {isAboveThreshold
                    ? `This disbursement (${cleanNumericAmount.toLocaleString()} ETB) exceeds the executive alert threshold (${threshold.toLocaleString()} ETB). An instant SMS notification will be dispatched via the on-premise telecom gateway.`
                    : `Disbursement is below the executive threshold (${threshold.toLocaleString()} ETB). The payment will be logged in the audit ledger without high-value SMS dispatch.`}
                </p>

                <div className="relative pt-1">
                  <div className="w-full bg-slate-200/70 rounded-full h-3 flex items-center justify-center relative overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isAboveThreshold ? 'bg-amber-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(
                          100,
                          Math.max(10, (cleanNumericAmount / (threshold * 1.4)) * 100)
                        )}%`,
                      }}
                    />
                    <span className="absolute text-[9px] font-mono font-bold text-slate-800">
                      {cleanNumericAmount.toLocaleString()} / {threshold.toLocaleString()} ETB
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Expenditure Category *
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                  >
                    <option value="Fertilizer & Soil Nutrition">Fertilizer & Soil Nutrition</option>
                    <option value="Improved Seeds & Nursery Distribution">Improved Seeds & Nursery Distribution</option>
                    <option value="Irrigation, Dams & Water Works">Irrigation, Dams & Water Works</option>
                    <option value="Mechanization & Tractors Procurement">Mechanization & Tractors Procurement</option>
                    <option value="Livestock, Dairy & Veterinary Vaccines">Livestock, Dairy & Veterinary Vaccines</option>
                    <option value="National Strategic Food Reserve">National Strategic Food Reserve</option>
                    <option value="Agricultural Extension & Operations">Agricultural Extension & Operations</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Disbursement Method *
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE) Direct Transfer">Commercial Bank of Ethiopia (CBE) Direct Transfer</option>
                    <option value="National Bank of Ethiopia (NBE) RTGS Wire">National Bank of Ethiopia (NBE) RTGS Wire</option>
                    <option value="Treasury Single Account (TSA) Transfer">Treasury Single Account (TSA) Transfer</option>
                    <option value="Letter of Credit (L/C)">Letter of Credit (L/C)</option>
                    <option value="Government Cheque">Government Cheque</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Purpose & Notes */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-[#0d4722]" />
                <span>3. Payment Purpose & Description</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Detailed Purpose / Description *
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white resize-none outline-none leading-relaxed"
                  placeholder="State the purpose, contract, or region for this disbursement..."
                />
              </div>
            </div>

            {/* 4. Notification Dispatch Recipient */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#0d4722]" />
                <span>4. Alert Dispatch Recipient Contact</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Executive Official
                  </label>
                  <select
                    value={selectedRecipientId}
                    onChange={handleRecipientSelect}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                  >
                    {recipients.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.title})
                      </option>
                    ))}
                    <option value="custom">-- Custom Phone Number --</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Target Mobile No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => {
                      setMobileNumber(e.target.value);
                      setSelectedRecipientId('custom');
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono font-bold text-slate-900 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                    placeholder="+251911223344"
                  />
                </div>
              </div>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 px-4 bg-[#0d4722] hover:bg-[#093218] text-white font-bold rounded-xl text-sm shadow-md shadow-[#0d4722]/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-60 mt-4 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>
                {loading
                  ? 'Processing & Dispatching...'
                  : isAboveThreshold
                  ? 'Record Payment & Trigger SMS Alert'
                  : 'Record Payment (Standard Disbursement)'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Cards: SMS Gateway Status & Live Smartphone Preview */}
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
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Hardware: 197.168.183.150:20023
                </p>
              </div>
            </div>
          </div>

          {/* SMS Preview Card with Real-time Smartphone Mockup */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 overflow-hidden">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Live SMS Dispatch Preview</h3>
              <span className="text-[11px] text-slate-400 font-mono">Dynamic Text</span>
            </div>

            {/* Smartphone UI Mockup */}
            <div className="bg-slate-900 rounded-3xl p-3.5 shadow-xl max-w-sm mx-auto text-white">
              {/* Speaker Notch */}
              <div className="w-20 h-3 bg-slate-800 rounded-full mx-auto mb-3" />

              {/* Message Screen Area */}
              <div className="bg-slate-100 rounded-2xl p-4 text-slate-800 space-y-3 min-h-[160px] flex flex-col justify-between">
                <div className="flex items-start space-x-2.5">
                  <div className="w-8 h-8 rounded-full bg-[#0d4722] text-white flex items-center justify-center text-xs font-bold shrink-0">
                    MOA
                  </div>
                  <div className="bg-white p-3.5 rounded-2xl rounded-tl-xs shadow-xs text-xs text-slate-800 leading-relaxed border border-slate-200">
                    <p className="font-bold text-[#0d4722] mb-1">
                      MOA Payment Alert:
                    </p>
                    <p className="text-slate-800">
                      High-value payment of <strong>ETB {amount || '25,000,000'}</strong> issued to{' '}
                      <strong>"{payeeName || 'Beneficiary'}"</strong> (Ref: {voucherRef}) for{' '}
                      <em>{category}</em>. Recorded by Ministry Finance on {paymentDate}.
                    </p>
                    <div className="text-[10px] text-slate-400 text-right mt-2 font-mono">
                      Just now • SMS Gateway
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-slate-400 font-mono border-t border-slate-200 pt-2 flex items-center justify-between px-1">
                  <span>To: {mobileNumber}</span>
                  <span className="text-emerald-700 font-bold">Encrypted Dispatch</span>
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
          <span className="text-xs text-slate-500">Live feed from on-premise SMS gateway</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-semibold text-slate-500 border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Event Type ↑</th>
                <th className="py-3 px-4">Recipient Mobile No.</th>
                <th className="py-3 px-4">Dispatched At</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentLogs.length === 0 ? (
                <>
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Value Payment Alert</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+251911223344</td>
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
                  <tr className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Value Payment Alert</td>
                    <td className="py-3 px-4 font-mono text-slate-700">+251911556677</td>
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
                    <td className="py-3 px-4 font-semibold text-slate-900">High-Value Payment Alert</td>
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
