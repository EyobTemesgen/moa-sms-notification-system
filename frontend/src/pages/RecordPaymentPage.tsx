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
          `Payment ${voucherRef} recorded! / ክፍያ ተመዝግቧል! High-amount threshold exceeded — SMS notification automatically dispatched to executive leadership.`
        );
      } else {
        setSuccessMsg(
          `Payment ${voucherRef} recorded in ledger / ክፍያ በመዝገብ ላይ ተመዝግቧል (Standard amount under alert limit).`
        );
      }

      handleRegenerateRef();
      await loadData();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to process payment and dispatch notification');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>Send Payment Notification</span>
            <span className="text-base font-semibold text-emerald-850 text-[#0d4722]">
              / የክፍያ ማስታወቂያ መላኪያ
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Record ministry financial disbursements and dispatch automated SMS alerts. / የመንግሥት ክፍያዎችን መዝግበው ለከፍተኛ ኃላፊዎች አፋጣኝ የኤስኤምኤስ መልዕክት ያስተላልፉ።
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
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Receipt className="w-4 h-4 text-[#0d4722]" />
                <span>1. Payment Identification & Beneficiary / የክፍያ መረጃና ተቀባይ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Payment Voucher No. *</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያ ማረጋገጫ ቁጥር</span>
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
                      title="አዲስ ቁጥር አፍልቅ / Generate New Reference"
                    >
                      <RotateCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Disbursement Date *</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያ ቀን</span>
                  </label>
                  <input
                    type="date"
                    required
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  <span>Payee / Beneficiary Organization *</span>
                  <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያ ተቀባይ ድርጅት ስም</span>
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
                    placeholder="ምሳሌ፡ የኢትዮጵያ ግብርና ሥራዎች ኮርፖሬሽን / Ethiopian Agricultural Business Corp"
                  />
                </div>
              </div>
            </div>

            {/* 2. Amount & Classification */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <CreditCard className="w-4 h-4 text-[#0d4722]" />
                <span>2. Financial Value & Classification / የፋይናንስ መጠንና ምድብ</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  <span>Payment Amount (ETB) *</span>
                  <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያ መጠን (ብር)</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-black text-slate-600">
                    ETB / ብር
                  </span>
                  <input
                    type="text"
                    required
                    value={amount}
                    onChange={handleAmountChange}
                    className="w-full pl-20 pr-4 py-3 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
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
                        ? 'High-Amount Alert Limit Exceeded / የከፍተኛ ክፍያ ማንቂያ ገደብ አልፏል'
                        : 'Normal Disbursement Amount / መደበኛ የክፍያ መጠን'}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isAboveThreshold
                        ? 'bg-amber-200 text-amber-900'
                        : 'bg-emerald-200 text-emerald-900'
                    }`}
                  >
                    ገደብ: {threshold.toLocaleString()} ETB
                  </span>
                </div>

                <p className="text-[11px] leading-relaxed">
                  {isAboveThreshold
                    ? `ይህ ክፍያ (${cleanNumericAmount.toLocaleString()} ብር) ከተቀመጠው ገደብ (${threshold.toLocaleString()} ብር) በላይ ስለሆነ ለከፍተኛ ኃላፊዎች አፋጣኝ የኤስኤምኤስ ማንቂያ ይላካል። / Amount exceeds threshold. Automated SMS will be dispatched.`
                    : `ክፍያው ከተቀመጠው የማንቂያ ገደብ በታች በመሆኑ በመደበኛ መዝገብ ላይ ብቻ ይመዘገባል። / Transaction logged without executive SMS alert.`}
                </p>

                <div className="relative pt-1">
                  <div className="w-full bg-slate-200/70 rounded-full h-3.5 flex items-center justify-center relative overflow-hidden">
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
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Expenditure Category *</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የወጪ ምድብ</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                  >
                    <option value="Fertilizer & Soil Nutrition">Fertilizer & Soil Nutrition (የአፈር ማዳበሪያና ንጥረ-ምግብ)</option>
                    <option value="Improved Seeds & Nursery Distribution">Improved Seeds & Nursery (ምርጥ ዘርና ችግኝ ማሰራጨት)</option>
                    <option value="Irrigation, Dams & Water Works">Irrigation, Dams & Water Works (የመስኖና ውኃ ልማት)</option>
                    <option value="Mechanization & Tractors Procurement">Mechanization & Tractors (የግብርና ሜካናይዜሽንና ትራክተሮች)</option>
                    <option value="Livestock, Dairy & Veterinary Vaccines">Livestock & Vaccines (የእንስሳት ሀብትና መድኃኒት)</option>
                    <option value="National Strategic Food Reserve">Strategic Food Reserve (የምግብ መጠባበቂያ ክምችት)</option>
                    <option value="Agricultural Extension & Operations">Extension & Operations (የግብርና ኤክስቴንሽንና ስራ ማስኬጃ)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Disbursement Method *</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያ ዘዴ</span>
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-medium text-slate-800 focus:ring-2 focus:ring-[#0d4722] bg-white outline-none"
                  >
                    <option value="Commercial Bank of Ethiopia (CBE) Direct Transfer">Commercial Bank of Ethiopia (CBE) / የኢትዮጵያ ንግድ ባንክ</option>
                    <option value="National Bank of Ethiopia (NBE) RTGS Wire">National Bank of Ethiopia (NBE) RTGS / ብሔራዊ ባንክ</option>
                    <option value="Treasury Single Account (TSA) Transfer">Treasury Single Account (TSA) / ግምጃ ቤት</option>
                    <option value="Letter of Credit (L/C)">Letter of Credit (L/C) / የብድር ሰነድ</option>
                    <option value="Government Cheque">Government Cheque / የመንግሥት ቼክ</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Purpose & Notes */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Layers className="w-4 h-4 text-[#0d4722]" />
                <span>3. Payment Purpose & Description / የክፍያው ዝርዝር መግለጫ</span>
              </h3>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  <span>Detailed Purpose / Description *</span>
                  <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የክፍያው ዝርዝር ዓላማ</span>
                </label>
                <textarea
                  rows={2}
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs text-slate-800 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] transition-all bg-white resize-none outline-none leading-relaxed"
                  placeholder="የክፍያውን ዝርዝር ምክንያት፣ ውል ወይም ክልል እዚህ ይጥቀሱ..."
                />
              </div>
            </div>

            {/* 4. Notification Dispatch Recipient */}
            <div className="space-y-4 pt-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-600 flex items-center gap-1.5 pb-2 border-b border-slate-100">
                <Phone className="w-4 h-4 text-[#0d4722]" />
                <span>4. Alert Dispatch Recipient Contact / የኤስኤምኤስ ተቀባይ ኃላፊ</span>
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Select Executive Official</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ ኃላፊ ይምረጡ</span>
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
                    <option value="custom">-- ሌላ ስልክ ቁጥር / Custom Phone Number --</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Target Mobile No. *</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የስልክ ቁጥር</span>
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
                  ? 'በማስኬድ ላይ / Processing...'
                  : isAboveThreshold
                  ? 'Record Payment & Trigger SMS Alert / ክፍያ መዝግብና የኤስኤምኤስ መልዕክት ላክ'
                  : 'Record Payment (Standard) / መደበኛ ክፍያ መዝግብ'}
              </span>
            </button>
          </form>
        </div>

        {/* Right Cards: SMS Gateway Status & Live Smartphone Preview */}
        <div className="lg:col-span-5 space-y-6">
          {/* SMS Gateway Status Card */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                SMS Gateway Status / የጌትዌይ ሁኔታ
              </h3>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>ቀጥታ / Live</span>
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
                  Connected / ተገናኝቷል
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
              <h3 className="text-sm font-bold text-slate-900">
                Live SMS Preview / የቅድመ-ዕይታ መልዕክት
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">Real-time</span>
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
                      MOA Payment Alert (የክፍያ ማስታወቂያ):
                    </p>
                    <p className="text-slate-800">
                      High-value payment of <strong>ETB {amount || '25,000,000'}</strong> issued to{' '}
                      <strong>"{payeeName || 'Beneficiary'}"</strong> (Ref: {voucherRef}) for{' '}
                      <em>{category}</em>. Recorded by Ministry Finance on {paymentDate}.
                    </p>
                    <div className="text-[10px] text-slate-400 text-right mt-2 font-mono">
                      Just now • On-Premise SMS
                    </div>
                  </div>
                </div>

                <div className="text-[10px] text-center text-slate-400 font-mono border-t border-slate-200 pt-2 flex items-center justify-between px-1">
                  <span>ተቀባይ: {mobileNumber}</span>
                  <span className="text-emerald-700 font-bold">Encrypted</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Table: Recent Dispatched Notifications */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Recent Dispatched Notifications</span>
            <span className="text-xs font-normal text-slate-500">/ የቅርብ ጊዜ የተላኩ መልዕክቶች</span>
          </h3>
          <span className="text-xs text-slate-500">Live feed from on-premise gateway</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600">
            <thead className="text-[11px] font-semibold text-slate-500 border-b border-slate-200 bg-slate-50/50">
              <tr>
                <th className="py-3 px-4">Event Type / የክስተት ዓይነት</th>
                <th className="py-3 px-4">Recipient Mobile / የስልክ ቁጥር</th>
                <th className="py-3 px-4">Dispatched At / የተላከበት ቀን</th>
                <th className="py-3 px-4">Status / ሁኔታ</th>
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
                        ተልኳል / Sent
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
                        ተልኳል / Sent
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
                        {log.status === 'SENT' ? 'ተልኳል / Sent' : log.status === 'PENDING' ? 'በመጠባበቅ ላይ / Pending' : 'አልተሳካም / Failed'}
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
