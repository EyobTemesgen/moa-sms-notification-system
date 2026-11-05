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
  MessageSquare,
  Smartphone,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">SMS Gateway Dispatch Logs</h1>
          <p className="text-xs text-gray-500 mt-1">
            Real-time delivery status for SMS messages sent to executive managers.
          </p>
        </div>

        <button
          onClick={fetchLogs}
          className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RotateCw className="w-4 h-4" />
          <span>Refresh Logs</span>
        </button>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search recipient or message text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Logs Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading dispatch logs...
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No SMS alerts recorded yet. When a payment over the threshold is submitted, SMS dispatches will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">Recipient</th>
                  <th className="py-3.5 px-6">SMS Message Content</th>
                  <th className="py-3.5 px-6">Status</th>
                  <th className="py-3.5 px-6">Dispatched At</th>
                  <th className="py-3.5 px-6">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-semibold text-gray-900">{log.recipientName}</div>
                      <div className="text-xs font-mono text-gray-500 flex items-center gap-1 mt-0.5">
                        <Smartphone className="w-3 h-3 text-emerald-600" />
                        {log.recipientNumber}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="max-w-md bg-gray-50 border border-gray-200/70 p-2.5 rounded-xl text-xs font-mono text-gray-800 leading-relaxed">
                        {log.message}
                      </div>
                      {log.gatewayResponse && (
                        <div className="mt-1 text-[11px] text-gray-600 truncate max-w-md font-mono">
                          Response: {log.gatewayResponse}
                        </div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {log.status === 'SENT' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Delivered
                        </span>
                      ) : log.status === 'FAILED' ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 text-red-800 rounded-lg text-xs font-semibold">
                          <XCircle className="w-3.5 h-3.5 text-red-600" />
                          Failed
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          Pending
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-gray-500">
                      {log.sentAt ? new Date(log.sentAt).toLocaleString() : 'Not sent'}
                      {log.retryCount > 0 && (
                        <div className="text-[10px] text-gray-600">Retries: {log.retryCount}</div>
                      )}
                    </td>
                    <td className="py-4 px-6">
                      {log.status === 'FAILED' && (
                        <button
                          onClick={() => handleRetry(log.id)}
                          disabled={retryingId === log.id}
                          className="px-2.5 py-1 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-medium rounded-lg border border-red-200 transition-colors flex items-center space-x-1"
                        >
                          <RotateCw
                            className={`w-3 h-3 ${retryingId === log.id ? 'animate-spin' : ''}`}
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
