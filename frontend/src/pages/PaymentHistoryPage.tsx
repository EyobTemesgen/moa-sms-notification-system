import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Payment } from '../types';
import {
  Search,
  Filter,
  CreditCard,
  AlertTriangle,
  RotateCw,
  Building,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const PaymentHistoryPage: React.FC = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterHighValueOnly, setFilterHighValueOnly] = useState(false);

  useEffect(() => {
    fetchPayments();
  }, []);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await api.getPayments();
      setPayments(data);
    } catch (err) {
      console.error('Failed to load payments', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredPayments = payments.filter((p) => {
    const matchesSearch =
      p.payeeName.toLowerCase().includes(search.toLowerCase()) ||
      p.voucherRef.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase());

    if (filterHighValueOnly) {
      return matchesSearch && p.requiresAlert;
    }
    return matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Controls Card */}
      <div className="bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-4 top-3.5" />
          <input
            type="text"
            placeholder="Search by voucher number, contractor, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-slate-50/50"
          />
        </div>

        {/* Filter Badges & Refresh */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setFilterHighValueOnly(!filterHighValueOnly)}
            className={`flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold border transition-all ${
              filterHighValueOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900 shadow-xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            <span>High-Value Only (&ge; 20M ETB)</span>
          </button>

          <button
            onClick={fetchPayments}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
            title="Refresh Ledger"
          >
            <RotateCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-xs overflow-hidden">
        {loading ? (
          <div className="p-16 text-center text-sm text-slate-500 flex flex-col items-center justify-center space-y-3">
            <RotateCw className="w-6 h-6 animate-spin text-emerald-600" />
            <span>Loading payment register...</span>
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-16 text-center text-slate-500 text-sm">
            <p className="font-semibold text-slate-700">No payment records found.</p>
            <p className="text-xs text-slate-400 mt-1">Try adjusting your search criteria.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50/80 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-100">
                <tr>
                  <th className="py-4 px-6">Voucher Ref</th>
                  <th className="py-4 px-6">Payee / Beneficiary</th>
                  <th className="py-4 px-6">Amount (ETB)</th>
                  <th className="py-4 px-6">Category</th>
                  <th className="py-4 px-6">Method & Date</th>
                  <th className="py-4 px-6 text-center">Executive SMS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPayments.map((p) => {
                  const amt = parseFloat(p.amount) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-4 px-6 font-mono font-bold text-xs text-slate-900">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                          {p.voucherRef}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-bold text-slate-900 block">{p.payeeName}</span>
                        {p.notes && (
                          <span className="text-xs text-slate-500 block truncate max-w-sm">
                            {p.notes}
                          </span>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <span
                          className={`font-black text-sm ${
                            p.requiresAlert ? 'text-amber-700' : 'text-slate-900'
                          }`}
                        >
                          {amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-slate-600 ml-1 font-bold">ETB</span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 rounded-lg bg-slate-100 text-slate-700 text-xs font-semibold">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-slate-500">
                        <div className="font-semibold text-slate-700">{p.paymentMethod}</div>
                        <div>{p.paymentDate}</div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        {p.requiresAlert ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-900 rounded-full text-xs font-bold border border-amber-300">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-700" />
                            Alerted (&ge;20M)
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 font-medium">Standard</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
