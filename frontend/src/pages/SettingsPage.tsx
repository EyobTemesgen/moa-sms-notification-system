import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings, Recipient } from '../types';
import {
  Activity,
  Check,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Users,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);

  // Form Fields matching Screen 4
  const [thresholdValue, setThresholdValue] = useState<number>(20000000);
  const [isAlertActive, setIsAlertActive] = useState<boolean>(true);
  const [ipAddress, setIpAddress] = useState<string>('197.168.183.150');
  const [port, setPort] = useState<string>('20023');
  const [stack, setStack] = useState<string>('api-v-run');
  const [apn, setApn] = useState<string>('et-telecom.com');

  // Test Connection & Save Toast
  const [testingConnection, setTestingConnection] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showToast, setShowToast] = useState<boolean>(false);
  const [saving, setSaving] = useState<boolean>(false);

  // New recipient form
  const [newRecipient, setNewRecipient] = useState({ name: '', title: '', phoneNumber: '' });

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    setLoading(true);
    try {
      const [sData, rData] = await Promise.all([
        api.getSettings(),
        api.getRecipients(),
      ]);
      setSettings(sData);
      setRecipients(rData);

      if (sData) {
        setThresholdValue(parseFloat(sData.thresholdAmount) || 20000000);
        setIsAlertActive(sData.isAlertEnabled);
        if (sData.smsGatewayUrl) {
          try {
            const url = new URL(sData.smsGatewayUrl);
            setIpAddress(url.hostname || '197.168.183.150');
            setPort(url.port || '20023');
          } catch {
            setIpAddress('197.168.183.150');
          }
        }
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const constructedUrl = `http://${ipAddress}:${port}/${stack}`;
      const updated = await api.updateSettings({
        thresholdAmount: thresholdValue,
        isAlertEnabled: isAlertActive,
        smsProvider: 'http',
        smsGatewayUrl: constructedUrl,
        smsGatewayKey: apn,
        smsSenderId: 'MOA-FINANCE',
      });
      setSettings(updated);
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setTestingConnection(true);
    setTestResult(null);
    try {
      await api.testSms({
        phoneNumber: '+251911223344',
        gatewayUrl: `http://${ipAddress}:${port}/${stack}`,
        apiKey: apn,
      });
      setTestResult({
        success: true,
        message: 'On-Premise SMS Gateway: Connected & Verified / ግንኙነቱ ተሳክቷል',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Gateway connection timed out / የግንኙነት ስህተት',
      });
    } finally {
      setTestingConnection(false);
    }
  };

  const handleAddRecipient = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createRecipient(newRecipient);
      setNewRecipient({ name: '', title: '', phoneNumber: '' });
      const updated = await api.getRecipients();
      setRecipients(updated);
    } catch (err: any) {
      alert(err.message || 'Failed to add recipient');
    }
  };

  const handleDeleteRecipient = async (id: string) => {
    try {
      await api.deleteRecipient(id);
      setRecipients(recipients.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete recipient');
    }
  };

  if (loading) {
    return <div className="p-12 text-center text-xs text-slate-400">በመጫን ላይ / Loading settings...</div>;
  }

  return (
    <div className="space-y-6 relative pb-16">
      {/* Page Title & Save Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight flex items-baseline gap-2">
            <span>SMS Gateway & Manager Settings</span>
            <span className="text-base font-semibold text-emerald-800">
              / የኤስኤምኤስ ጌትዌይና የማንቂያ ማስተካከያ
            </span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Configure the trigger alert limit, on-premise hardware connection, and executive contacts. / የማንቂያ መነሻ ገደብ፣ የሃርድዌር ጌትዌይ ውቅር እና የተላላኪ ኃላፊዎችን ያቀናብሩ።
          </p>
        </div>

        <button
          onClick={handleSaveSettings}
          disabled={saving}
          className="px-5 py-2.5 bg-[#0d4722] hover:bg-[#0a381b] text-white text-xs font-semibold rounded-xl shadow-xs transition-colors flex items-center space-x-2 disabled:opacity-50 self-start sm:self-auto cursor-pointer"
        >
          <Check className="w-4 h-4" />
          <span>{saving ? 'በመመዝገብ ላይ / Saving...' : 'Save Changes / ለውጦችን መዝግብ'}</span>
        </button>
      </div>

      {/* Main Settings Grid (2 Columns) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Threshold Slider & Gateway Status */}
        <div className="lg:col-span-6 space-y-6">
          {/* Card 1: Trigger Threshold Slider */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900">
                Trigger Threshold Slider / የማንቂያ ገደብ መጠን
              </h3>

              {/* iOS Style Toggle Switch */}
              <button
                type="button"
                onClick={() => setIsAlertActive(!isAlertActive)}
                className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 cursor-pointer ${
                  isAlertActive ? 'bg-[#0d4722]' : 'bg-slate-300'
                }`}
              >
                <div
                  className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ${
                    isAlertActive ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            <p className="text-xs text-slate-500 mb-6">
              ከዚህ መጠን በላይ የሚፈጸም ክፍያ አፋጣኝ የማንቂያ መልዕክት ያስነሳል። / Configure payment alert limit to trigger instant executive SMS.
            </p>

            {/* Range Slider Container with Dynamic Tooltip */}
            <div className="relative pt-6 pb-2">
              {/* Floating dark badge over thumb */}
              <div
                className="absolute top-0 transform -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold py-0.5 px-2.5 rounded shadow-md pointer-events-none transition-all"
                style={{
                  left: `${Math.min(92, Math.max(8, (thresholdValue / 30000000) * 100))}%`,
                }}
              >
                {thresholdValue.toLocaleString()} ETB / ብር
              </div>

              {/* Native styled slider */}
              <input
                type="range"
                min="0"
                max="30000000"
                step="1000000"
                value={thresholdValue}
                onChange={(e) => setThresholdValue(Number(e.target.value))}
                className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#0d4722]"
              />

              {/* Scale Labels below slider */}
              <div className="flex justify-between text-[11px] text-slate-500 font-medium mt-2">
                <span>0 ብር</span>
                <span className="text-[#0d4722] font-bold">
                  {thresholdValue.toLocaleString()} ETB
                </span>
                <span>30,000,000 ብር</span>
              </div>
            </div>
          </div>

          {/* Card 2: On-Premise SMS Gateway Status */}
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                On-Premise SMS Gateway / የውስጥ ኤስኤምኤስ ጌትዌይ
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
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gateway Configuration */}
        <div className="lg:col-span-6 space-y-6">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6">
            <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">
                On-Premise Gateway Configuration / የሃርድዌር ጌትዌይ ውቅር
              </h3>
              <div className="flex items-center space-x-1.5 text-xs font-semibold text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Live</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  <span>IP Address</span>
                  <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ የአይፒ አድራሻ</span>
                </label>
                <input
                  type="text"
                  value={ipAddress}
                  onChange={(e) => setIpAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                  placeholder="197.168.183.150"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Port</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ ፖርት</span>
                  </label>
                  <input
                    type="text"
                    value={port}
                    onChange={(e) => setPort(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                    placeholder="20023"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-800 mb-1">
                    <span>Stack</span>
                    <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ ፕሮቶኮል</span>
                  </label>
                  <input
                    type="text"
                    value={stack}
                    onChange={(e) => setStack(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                    placeholder="api-v-run"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  <span>APN (Access Point Name)</span>
                  <span className="text-[11px] text-slate-500 font-normal ml-1.5">/ ቴሌኮም ኤፒኤን</span>
                </label>
                <input
                  type="text"
                  value={apn}
                  onChange={(e) => setApn(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:ring-2 focus:ring-[#0d4722] focus:border-[#0d4722] bg-white outline-none"
                  placeholder="et-telecom.com"
                />
              </div>

              <button
                type="button"
                onClick={handleTestConnection}
                disabled={testingConnection}
                className="w-full py-2.5 px-4 bg-[#0d4722] hover:bg-[#0a381b] text-white font-semibold rounded-xl text-xs shadow-xs transition-colors flex items-center justify-center space-x-2 disabled:opacity-50 mt-2 cursor-pointer"
              >
                <span>{testingConnection ? 'በመሞከር ላይ / Testing...' : 'Test Connection / ግንኙነት ፈትሽ'}</span>
              </button>

              {testResult && (
                <div
                  className={`p-3 rounded-xl text-xs font-medium border flex items-center space-x-2 ${
                    testResult.success
                      ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                      : 'bg-rose-50 border-rose-200 text-rose-800'
                  }`}
                >
                  {testResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <X className="w-4 h-4 text-rose-600 shrink-0" />
                  )}
                  <span>{testResult.message}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Executive Alert Contacts */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs p-6 space-y-4">
        <div className="flex items-center space-x-2 pb-3 border-b border-slate-100">
          <Users className="w-5 h-5 text-[#0d4722]" />
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Executive Alert Contacts / የማንቂያ መልዕክት ተቀባይ ኃላፊዎች
            </h3>
            <p className="text-xs text-slate-500">ከፍተኛ ክፍያዎች በሚፈጸሙበት ጊዜ የኤስኤምኤስ መልዕክት የሚደርሳቸው የመንግሥት ኃላፊዎች ዝርዝር።</p>
          </div>
        </div>

        <form onSubmit={handleAddRecipient} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <input
            type="text"
            required
            placeholder="የኃላፊው ስም / Official Name"
            value={newRecipient.name}
            onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-1 focus:ring-[#0d4722]"
          />
          <input
            type="text"
            required
            placeholder="የሥራ መደብ / Position"
            value={newRecipient.title}
            onChange={(e) => setNewRecipient({ ...newRecipient, title: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs bg-white outline-none focus:ring-1 focus:ring-[#0d4722]"
          />
          <input
            type="text"
            required
            placeholder="ስልክ (+251911223344)"
            value={newRecipient.phoneNumber}
            onChange={(e) => setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })}
            className="px-3 py-2 rounded-xl border border-slate-300 text-xs font-mono bg-white outline-none focus:ring-1 focus:ring-[#0d4722]"
          />
          <button
            type="submit"
            className="px-3 py-2 bg-[#0d4722] hover:bg-[#0a381b] text-white text-xs font-semibold rounded-xl flex items-center justify-center space-x-1 shadow-2xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>አክል / Add Contact</span>
          </button>
        </form>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
          {recipients.map((r) => (
            <div
              key={r.id}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 flex items-center justify-between text-xs hover:border-slate-300 transition-colors"
            >
              <div>
                <p className="font-bold text-slate-900">{r.name}</p>
                <p className="text-[10px] text-slate-500">{r.title}</p>
                <p className="text-emerald-700 font-mono text-[11px] mt-0.5">{r.phoneNumber}</p>
              </div>
              <button
                onClick={() => handleDeleteRecipient(r.id)}
                className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
                title="አስወግድ / Remove"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Toast Notification */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#0d4722] text-white px-5 py-3 rounded-xl shadow-2xl flex items-center space-x-3 border border-emerald-600/40 animate-slideUp">
          <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-white shrink-0">
            <Check className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs font-semibold">
            ለውጦች በትክክል ተመዝግበዋል! / Saved! Setting confirmed alert
          </span>
          <button
            onClick={() => setShowToast(false)}
            className="p-1 text-emerald-200 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
