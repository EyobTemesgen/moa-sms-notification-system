import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import { Payment } from '../types';
import {
  Search,
  Filter,
  CreditCard,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Building,
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Payment Audit History</h1>
          <p className="text-xs text-gray-500 mt-1">
            Complete transaction register of payments entered by Finance.
          </p>
        </div>

        <button
          onClick={fetchPayments}
          className="flex items-center space-x-2 px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh List</span>
        </button>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm flex flex-col sm:flex-row items-center gap-4 justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
          <input
            type="text"
            placeholder="Search voucher, payee, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        <div className="flex items-center space-x-3 w-full sm:w-auto">
          <button
            onClick={() => setFilterHighValueOnly(!filterHighValueOnly)}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all ${
              filterHighValueOnly
                ? 'bg-amber-100 border-amber-300 text-amber-900'
                : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
            }`}
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>High-Value Only (&ge; 20M ETB)</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-sm text-gray-500">
            Loading payments...
          </div>
        ) : filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-gray-500 text-sm">
            No payments found matching your filter.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-600">
              <thead className="bg-gray-50/80 text-xs uppercase font-semibold text-gray-500 border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-6">Voucher Ref</th>
                  <th className="py-3.5 px-6">Beneficiary / Payee</th>
                  <th className="py-3.5 px-6">Amount (ETB)</th>
                  <th className="py-3.5 px-6">Category</th>
                  <th className="py-3.5 px-6">Method & Date</th>
                  <th className="py-3.5 px-6">SMS Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredPayments.map((p) => {
                  const amt = parseFloat(p.amount) || 0;
                  return (
                    <tr key={p.id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-6 font-semibold text-gray-900 font-mono text-xs">
                        {p.voucherRef}
                      </td>
                      <td className="py-4 px-6">
                        <span className="font-medium text-gray-800 block">{p.payeeName}</span>
                        {p.notes && <span className="text-xs text-gray-400 block truncate max-w-xs">{p.notes}</span>}
                      </td>
                      <td className="py-4 px-6 font-semibold">
                        <span
                          className={`text-sm ${
                            p.requiresAlert ? 'text-amber-700 font-bold' : 'text-gray-900'
                          }`}
                        >
                          {amt.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                      </td>
                      <td className="py-4 px-6">
                        <span className="px-2.5 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium">
                          {p.category}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-xs text-gray-500">
                        <div className="font-medium text-gray-700">{p.paymentMethod}</div>
                        <div>{p.paymentDate}</div>
                      </td>
                      <td className="py-4 px-6">
                        {p.requiresAlert ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 text-amber-800 rounded-lg text-xs font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                            Dispatched
                          </span>
                        ) : (
                          <span className="text-xs text-gray-600 font-medium">Below threshold</span>
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

