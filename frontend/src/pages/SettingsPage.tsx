import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SystemSettings, Recipient } from '../types';
import {
  Settings,
  Users,
  Smartphone,
  Save,
  Send,
  Plus,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Radio,
  Server,
  ShieldCheck,
  Building,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const [settings, setSettings] = useState<SystemSettings | null>(null);
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New Recipient Form
  const [newRecipient, setNewRecipient] = useState({
    name: '',
    title: '',
    phoneNumber: '',
  });

  // SMS Gateway Test State
  const [testPhone, setTestPhone] = useState('+251911223344');
  const [testResult, setTestResult] = useState<any | null>(null);
  const [testingSms, setTestingSms] = useState(false);

  useEffect(() => {
    loadAll();
  }, []);

  const loadAll = async () => {
    setLoading(true);
    try {
      const [sData, rData] = await Promise.all([
        api.getSettings(),
        api.getRecipients(),
      ]);
      setSettings(sData);
      setRecipients(rData);
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settings) return;
    setSavingSettings(true);
    setSuccessMsg(null);
    try {
      const updated = await api.updateSettings({
        thresholdAmount: parseFloat(settings.thresholdAmount),
        isAlertEnabled: settings.isAlertEnabled,
        smsProvider: settings.smsProvider,
        smsGatewayUrl: settings.smsGatewayUrl,
        smsGatewayKey: settings.smsGatewayKey,
        smsSenderId: settings.smsSenderId,
      });
      setSettings(updated);
      setSuccessMsg('Settings updated and saved successfully!');
      setTimeout(() => setSuccessMsg(null), 4000);
    } catch (err: any) {
      alert(err.message || 'Failed to save settings');
    } finally {
      setSavingSettings(false);
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
    if (!confirm('Are you sure you want to remove this manager recipient?')) return;
    try {
      await api.deleteRecipient(id);
      setRecipients(recipients.filter((r) => r.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete recipient');
    }
  };

  const handleToggleRecipient = async (recipient: Recipient) => {
    try {
      await api.updateRecipient(recipient.id, { isActive: !recipient.isActive });
      setRecipients(
        recipients.map((r) =>
          r.id === recipient.id ? { ...r, isActive: !r.isActive } : r,
        ),
      );
    } catch (err: any) {
      alert(err.message || 'Failed to update recipient');
    }
  };

  const handleTestSms = async () => {
    setTestingSms(true);
    setTestResult(null);
    try {
      const res = await api.testSms({
        phoneNumber: testPhone,
        gatewayUrl: settings?.smsGatewayUrl,
        apiKey: settings?.smsGatewayKey,
      });
      setTestResult(res);
    } catch (err: any) {
      setTestResult({ success: false, error: err.message });
    } finally {
      setTestingSms(false);
    }
  };

  if (loading || !settings) {
    return <div className="p-16 text-center text-slate-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      {successMsg && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center space-x-2.5 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Threshold & Gateway Config (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center space-x-3.5 mb-6 pb-5 border-b border-slate-100">
              <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <Settings className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Notification Threshold & Rules</h2>
                <p className="text-xs text-slate-500">Configure alert ceiling and gateway parameters.</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  High-Value Alert Threshold (ETB) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-xs font-extrabold text-slate-700">
                    ETB
                  </span>
                  <input
                    type="number"
                    min="1"
                    step="1000"
                    required
                    value={settings.thresholdAmount}
                    onChange={(e) =>
                      setSettings({ ...settings, thresholdAmount: e.target.value })
                    }
                    className="w-full pl-14 pr-4 py-3 rounded-xl border border-slate-300 text-base font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all bg-slate-50/50"
                  />
                </div>
                <p className="text-xs text-slate-700 mt-1.5 font-medium">
                  Currently triggers for disbursements &ge;{' '}
                  <strong className="text-emerald-800">
                    {parseFloat(settings.thresholdAmount || '0').toLocaleString()} ETB
                  </strong>.
                </p>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  SMS Sender Header
                </label>
                <input
                  type="text"
                  required
                  value={settings.smsSenderId}
                  onChange={(e) =>
                    setSettings({ ...settings, smsSenderId: e.target.value })
                  }
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
                  placeholder="e.g. MOA-FINANCE"
                />
              </div>

              {/* Mode Selector */}
              <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
                  SMS Gateway Connector Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, smsProvider: 'mock' })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.smsProvider === 'mock'
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span>Mock / Console Mode</span>
                      {settings.smsProvider === 'mock' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1">
                      Simulates SMS delivery and logs to dashboard without network calls.
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, smsProvider: 'http' })}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      settings.smsProvider === 'http'
                        ? 'bg-emerald-50/80 border-emerald-500 text-emerald-950 font-bold shadow-xs ring-1 ring-emerald-500'
                        : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    <div className="text-xs font-extrabold flex items-center justify-between">
                      <span>On-Premise Gateway</span>
                      {settings.smsProvider === 'http' && (
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                      )}
                    </div>
                    <div className="text-[11px] font-normal text-slate-500 mt-1">
                      Transmits HTTP payload directly to internal telecom hardware/server.
                    </div>
                  </button>
                </div>
              </div>

              {settings.smsProvider === 'http' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Gateway Endpoint URL
                    </label>
                    <input
                      type="url"
                      placeholder="http://10.10.20.50:8080/api/sms/send"
                      value={settings.smsGatewayUrl || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, smsGatewayUrl: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                      Gateway Authorization Key (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Bearer token or leave blank if IP-whitelisted"
                      value={settings.smsGatewayKey || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, smsGatewayKey: e.target.value })
                      }
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:ring-2 focus:ring-emerald-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-4 border-t border-slate-100">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isAlertEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, isAlertEnabled: e.target.checked })
                    }
                    className="w-5 h-5 text-emerald-600 rounded-lg border-slate-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-bold text-slate-800">
                    Enable Automatic Alert Dispatch
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test SMS Gateway Console */}
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
            <div className="flex items-center space-x-3 pb-3 border-b border-slate-100">
              <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-base">Test SMS Connectivity</h3>
                <p className="text-xs text-slate-500">Verify internal gateway response with an instant test.</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                placeholder="+251911223344"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleTestSms}
                disabled={testingSms}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all flex items-center justify-center space-x-2 shadow-xs disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingSms ? 'Transmitting...' : 'Send Test Ping'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-4 rounded-2xl text-xs font-mono border ${
                  testResult.success
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                    : 'bg-rose-50 border-rose-300 text-rose-900'
                }`}
              >
                <div className="font-bold text-sm mb-1.5 flex items-center gap-1.5">
                  {testResult.success ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Gateway Connected Successfully!</span>
                    </>
                  ) : (
                    <>
                      <AlertCircle className="w-4 h-4 text-rose-600" />
                      <span>Connection Error</span>
                    </>
                  )}
                </div>
                <div>Provider: {testResult.provider}</div>
                {testResult.messageId && <div>Message ID: {testResult.messageId}</div>}
                {testResult.rawResponse && (
                  <div className="mt-1 text-[11px] truncate">
                    Raw Telemetry: {testResult.rawResponse}
                  </div>
                )}
                {testResult.error && <div>Error: {testResult.error}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manager Alert Recipients (5 Cols) */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-7 rounded-3xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-slate-100">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Executive Alert Contacts</h2>
              <p className="text-xs text-slate-500">
                Executives who receive SMS alerts for high disbursements.
              </p>
            </div>
          </div>

          {/* Add Recipient Form */}
          <form
            onSubmit={handleAddRecipient}
            className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase text-slate-700 tracking-wider">
              Add Executive Contact
            </h4>
            <input
              type="text"
              required
              placeholder="Full Name (e.g. H.E. State Minister)"
              value={newRecipient.name}
              onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <input
              type="text"
              required
              placeholder="Position Title (e.g. Director of Finance)"
              value={newRecipient.title}
              onChange={(e) => setNewRecipient({ ...newRecipient, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-emerald-500 bg-white"
            />
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Phone (+251911223344)"
                value={newRecipient.phoneNumber}
                onChange={(e) => setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })}
                className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl transition-all flex items-center space-x-1 shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Recipients List */}
          <div className="space-y-3">
            {recipients.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No recipients registered yet.</p>
            ) : (
              recipients.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-4 rounded-2xl border border-slate-200 hover:border-slate-300 transition-all bg-white shadow-2xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-sm">{r.name}</span>
                      <span className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-600 rounded-md font-semibold">
                        {r.title}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5 mt-1">
                      <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                      {r.phoneNumber}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => handleToggleRecipient(r)}
                      className={`text-xs px-2.5 py-1 rounded-full font-bold transition-all ${
                        r.isActive
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                          : 'bg-slate-100 text-slate-500 border border-slate-200'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Muted'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecipient(r.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
