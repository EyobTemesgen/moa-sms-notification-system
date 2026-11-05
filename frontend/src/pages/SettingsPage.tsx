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
      setSuccessMsg('Settings updated successfully!');
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
    return <div className="p-12 text-center text-gray-500">Loading settings...</div>;
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">System & SMS Configuration</h1>
        <p className="text-xs text-gray-500 mt-1">
          Manage alert threshold amount, on-premise gateway connections, and recipient managers.
        </p>
      </div>

      {successMsg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm flex items-center space-x-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Column: Threshold & Gateway Config */}
        <div className="space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-100">
              <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-bold text-gray-900">Threshold & Provider Rules</h2>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  High-Value Alert Threshold (ETB) *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center text-xs font-bold text-gray-600">
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
                    className="w-full pl-12 pr-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
                <p className="text-xs text-gray-700 mt-1">
                  Payments equal to or exceeding{' '}
                  <strong className="text-emerald-800">
                    {parseFloat(settings.thresholdAmount || '0').toLocaleString()} ETB
                  </strong>{' '}
                  will trigger manager SMS notifications.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                  SMS Sender Header
                </label>
                <input
                  type="text"
                  required
                  value={settings.smsSenderId}
                  onChange={(e) =>
                    setSettings({ ...settings, smsSenderId: e.target.value })
                  }
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="e.g. MOA-FINANCE"
                />
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-200">
                <label className="block text-xs font-semibold text-gray-700 uppercase mb-2">
                  SMS Gateway Provider Mode
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, smsProvider: 'mock' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.smsProvider === 'mock'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs">Mock / Console Mode</div>
                    <div className="text-[11px] font-normal text-gray-500 mt-0.5">
                      Simulates SMS in logs (Ideal for dev)
                    </div>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSettings({ ...settings, smsProvider: 'http' })}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      settings.smsProvider === 'http'
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-900 font-bold'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <div className="text-xs">On-Premise Gateway</div>
                    <div className="text-[11px] font-normal text-gray-500 mt-0.5">
                      Sends via internal SMS server
                    </div>
                  </button>
                </div>
              </div>

              {settings.smsProvider === 'http' && (
                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                      Gateway Endpoint URL
                    </label>
                    <input
                      type="url"
                      placeholder="http://10.10.20.50:8080/api/sms/send"
                      value={settings.smsGatewayUrl || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, smsGatewayUrl: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase mb-1.5">
                      Gateway API Key / Token (Optional)
                    </label>
                    <input
                      type="password"
                      placeholder="Leave blank if open internal IP"
                      value={settings.smsGatewayKey || ''}
                      onChange={(e) =>
                        setSettings({ ...settings, smsGatewayKey: e.target.value })
                      }
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.isAlertEnabled}
                    onChange={(e) =>
                      setSettings({ ...settings, isAlertEnabled: e.target.checked })
                    }
                    className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500"
                  />
                  <span className="text-sm font-semibold text-gray-800">
                    Enable Automatic SMS Dispatch
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={savingSettings}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span>{savingSettings ? 'Saving...' : 'Save Configuration'}</span>
                </button>
              </div>
            </form>
          </div>

          {/* Test SMS Gateway Box */}
          <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
            <div className="flex items-center space-x-3 mb-4 pb-3 border-b border-gray-100">
              <div className="p-2 bg-blue-100 text-blue-700 rounded-xl">
                <Radio className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base">Test SMS Connectivity</h3>
                <p className="text-xs text-gray-500">Test sending an instant verification SMS right now.</p>
              </div>
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="+251911223344"
                value={testPhone}
                onChange={(e) => setTestPhone(e.target.value)}
                className="flex-1 px-4 py-2 rounded-xl border border-gray-300 text-sm font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="button"
                onClick={handleTestSms}
                disabled={testingSms}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1.5 disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{testingSms ? 'Testing...' : 'Send Test'}</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`mt-4 p-3 rounded-xl text-xs font-mono ${
                  testResult.success
                    ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
                    : 'bg-red-50 border border-red-200 text-red-800'
                }`}
              >
                <div className="font-bold mb-1">
                  {testResult.success ? '✓ Gateway Contact Successful!' : '✕ Connection Error'}
                </div>
                <div>Provider: {testResult.provider}</div>
                {testResult.messageId && <div>Message ID: {testResult.messageId}</div>}
                {testResult.error && <div>Error: {testResult.error}</div>}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Manager Alert Recipients */}
        <div className="bg-white p-6 sm:p-7 rounded-2xl border border-gray-200 shadow-sm space-y-6">
          <div className="flex items-center space-x-3 pb-4 border-b border-gray-100">
            <div className="p-2.5 bg-emerald-100 text-emerald-800 rounded-xl">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Executive Alert Recipients</h2>
              <p className="text-xs text-gray-500">
                Managers who automatically receive SMS alerts when high-value payments occur.
              </p>
            </div>
          </div>

          {/* Add Recipient Form */}
          <form onSubmit={handleAddRecipient} className="p-4 bg-gray-50 rounded-2xl border border-gray-200 space-y-3">
            <h4 className="text-xs font-bold uppercase text-gray-700 tracking-wider">
              Add New Manager / Approver
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <input
                type="text"
                required
                placeholder="Full Name"
                value={newRecipient.name}
                onChange={(e) => setNewRecipient({ ...newRecipient, name: e.target.value })}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
              <input
                type="text"
                required
                placeholder="Title / Role (e.g. State Minister)"
                value={newRecipient.title}
                onChange={(e) => setNewRecipient({ ...newRecipient, title: e.target.value })}
                className="px-3.5 py-2 rounded-xl border border-gray-300 text-xs focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div className="flex gap-2">
              <input
                type="text"
                required
                placeholder="Phone Number (e.g. +251911223344)"
                value={newRecipient.phoneNumber}
                onChange={(e) => setNewRecipient({ ...newRecipient, phoneNumber: e.target.value })}
                className="flex-1 px-3.5 py-2 rounded-xl border border-gray-300 text-xs font-mono focus:ring-2 focus:ring-emerald-500"
              />
              <button
                type="submit"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-xl transition-all flex items-center space-x-1"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </form>

          {/* Recipients List */}
          <div className="space-y-3">
            {recipients.length === 0 ? (
              <p className="text-xs text-gray-400 italic">No recipients added yet.</p>
            ) : (
              recipients.map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between p-3.5 rounded-xl border border-gray-200 hover:border-gray-300 transition-colors bg-white shadow-xs"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-gray-900 text-sm">{r.name}</span>
                      <span className="text-[11px] px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                        {r.title}
                      </span>
                    </div>
                    <div className="text-xs font-mono text-gray-500 flex items-center gap-1.5 mt-0.5">
                      <Smartphone className="w-3 h-3 text-emerald-600" />
                      {r.phoneNumber}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      type="button"
                      onClick={() => handleToggleRecipient(r)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold transition-all ${
                        r.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-gray-100 text-gray-500'
                      }`}
                    >
                      {r.isActive ? 'Active' : 'Muted'}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleDeleteRecipient(r.id)}
                      className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Remove Recipient"
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

