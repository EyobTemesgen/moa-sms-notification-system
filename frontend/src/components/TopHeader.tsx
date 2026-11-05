import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { Menu, Plus, Bell, ShieldCheck, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const location = useLocation();
  const { user } = useAuth();

  const getPageInfo = () => {
    switch (location.pathname) {
      case '/':
        return {
          title: 'Record Finance Disbursement',
          subtitle: 'Disbursements equal to or exceeding 20,000,000 ETB automatically alert executives.',
        };
      case '/history':
        return {
          title: 'Payment Audit Register',
          subtitle: 'Searchable ledger of all financial vouchers entered into the system.',
        };
      case '/sms-logs':
        return {
          title: 'SMS Gateway Dispatch Logs',
          subtitle: 'Delivery receipts, timestamped telemetry, and retry controls for manager alerts.',
        };
      case '/settings':
        return {
          title: 'System & SMS Gateway Configuration',
          subtitle: 'Set high-value threshold limits, on-premise gateway endpoints, and manager contacts.',
        };
      default:
        return {
          title: 'Ministry of Agriculture',
          subtitle: 'High-Value Payment Notification System',
        };
    }
  };

  const info = getPageInfo();
  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-30 px-4 sm:px-8 py-4 transition-all">
      <div className="flex items-center justify-between">
        {/* Left: Mobile hamburger + Page Title */}
        <div className="flex items-center space-x-4">
          <button
            onClick={onOpenSidebar}
            className="lg:hidden p-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            aria-label="Open side menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
              {info.title}
            </h1>
            <p className="hidden sm:block text-xs text-slate-500 mt-0.5">
              {info.subtitle}
            </p>
          </div>
        </div>

        {/* Right: Date, Status Badge, Quick Action */}
        <div className="flex items-center space-x-3">
          <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-slate-100 border border-slate-200 text-xs font-semibold text-slate-600">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{todayFormatted}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200/70 text-xs font-bold text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>Gateway Online</span>
          </div>

          {location.pathname !== '/' && (
            <Link
              to="/"
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs shadow-md shadow-emerald-600/20 transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Record Payment</span>
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};
