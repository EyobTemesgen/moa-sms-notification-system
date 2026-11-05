import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { SmsAlert } from '../types';
import {
  Send,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCw,
  Search,
  Smartphone,
  ShieldAlert,
  MessageSquare,
} from 'lucide-react';

export const SmsLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<SmsAlert[]>([]);
  const [loading, setLoading] = useState(true);
  const [retryingId, setRetryingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const data = await api.getSmsLogs();
      setLogs(data);
    } catch (err) {
      console.error('Failed to load SMS logs', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (id: string) => {
    setRetryingId(id);
    try {
      await api.retrySms(id);
      await fetchLogs();
    } catch (err) {
      console.error('Failed to retry SMS', err);
    } finally {
      setRetryingId(null);
    }
  };

  const filteredLogs = logs.filter(
    (l) =>
      l.recipientName.toLowerCase().includes(search.toLowerCase()) ||
      l.recipientNumber.includes(search) ||
      l.message.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by manager name, phone, or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors"
        >
          <RotateCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center space-y-3">
            <RotateCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading gateway logs...</span>
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            <p className="font-semibold text-slate-700">No SMS alert dispatches found.</p>
            <p className="text-xs text-slate-400 mt-1">
              Dispatches will show here whenever a payment above 20,000,000 ETB is submitted.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Recipient Manager</th>
                  <th className="py-4 px-6">SMS Message Payload</th>
                  <th className="py-4 px-6">Delivery Status</th>
                  <th className="py-4 px-6">Timestamp</th>
                  <th className="py-4 px-6 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900">{log.recipientName}</div>
                      <div className="text-xs font-mono text-emerald-700 font-semibold flex items-center gap-1.5 mt-0.5">
                        <Smartphone className="w-3.5 h-3.5 text-slate-400" />
                        {log.recipientNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-lg bg-slate-50 border border-slate-200/80 p-3 rounded-2xl text-xs font-mono text-slate-800 leading-relaxed">
                        {log.message}
                      </div>
                      {log.gatewayResponse && (
                        <div className="mt-1 text-[11px] text-slate-400 truncate max-w-lg font-mono">
                          Telemetry: {log.gatewayResponse}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-100 text-emerald-900 rounded-full text-xs font-bold border border-emerald-300">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Delivered
                        </span>
                      ) : log.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-100 text-rose-900 rounded-full text-xs font-bold border border-rose-300">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-slate-500 whitespace-nowrap">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Not sent'}
                      {log.retryCount > 0 && (
                        <div className="text-[10px] text-slate-400">Retries: {log.retryCount}</div>
                      )}
                    </td>
                    <td className="py-4 px-6 text-center">
                      {log.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold rounded-xl border border-rose-200 transition-colors inline-flex items-center space-x-1.5 shadow-2xs"
                        >
                          <RotateCw
                            className={`w-3.5 h-3.5 ${
                              retryingId === log.id ? 'animate-spin' : ''
                            }`}
                          />
                          <span>Retry</span>
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
