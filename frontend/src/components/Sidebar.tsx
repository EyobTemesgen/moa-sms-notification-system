import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  CreditCard,
  History,
  Send,
  Settings,
  LogOut,
  ShieldAlert,
  Radio,
  SlidersHorizontal,
  ChevronRight,
  User,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth();

  const navItems = [
    {
      name: 'Record Payment',
      path: '/',
      icon: CreditCard,
      description: 'Enter voucher & trigger alerts',
    },
    {
      name: 'Payment Register',
      path: '/history',
      icon: History,
      description: 'Full audit history & filters',
    },
    {
      name: 'SMS Dispatch Logs',
      path: '/sms-logs',
      icon: Send,
      description: 'Live delivery & retry monitor',
    },
    {
      name: 'Settings & Contacts',
      path: '/settings',
      icon: Settings,
      description: 'Threshold & executive numbers',
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-40 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-72 bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-slate-100 flex flex-col border-r border-slate-800/80 shadow-2xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand Header */}
        <div className="p-6 pb-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3.5">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-lg shadow-emerald-500/20 ring-1 ring-white/20">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-base tracking-tight text-white">
                  MOA <span className="text-emerald-400">ALERT</span>
                </span>
                <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 font-semibold uppercase tracking-wider border border-emerald-500/30">
                  SMS
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Ministry of Agriculture</p>
            </div>
          </div>

          {/* Close button for mobile */}
          <button
            onClick={onClose}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Threshold Quick Pill */}
        <div className="mx-4 mt-5 p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <div>
              <p className="text-[11px] font-semibold text-slate-300">Active Alert Rule</p>
              <p className="text-xs font-bold text-amber-400">&ge; 20,000,000 ETB</p>
            </div>
          </div>
          <div className="p-1.5 rounded-lg bg-slate-700/50 text-slate-300">
            <Radio className="w-4 h-4 text-emerald-400" />
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 px-3 py-6 space-y-1.5 overflow-y-auto">
          <p className="px-3 text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
            Main Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-emerald-600/90 text-white shadow-lg shadow-emerald-900/40 border border-emerald-500/40 font-semibold'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-1.5 rounded-lg ${
                          isActive
                            ? 'bg-emerald-700 text-white'
                            : 'bg-slate-800 text-slate-400 group-hover:text-emerald-400 group-hover:bg-slate-700/80'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div>{item.name}</div>
                        <div
                          className={`text-[10px] font-normal leading-tight ${
                            isActive ? 'text-emerald-100' : 'text-slate-400 group-hover:text-slate-300'
                          }`}
                        >
                          {item.description}
                        </div>
                      </div>
                    </div>
                    <ChevronRight
                      className={`w-4 h-4 transition-transform ${
                        isActive
                          ? 'text-emerald-200 translate-x-0.5'
                          : 'text-slate-600 group-hover:text-slate-400'
                      }`}
                    />
                  </>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Gateway Status Badge in Sidebar */}
        <div className="mx-4 mb-4 p-3 rounded-xl bg-gradient-to-r from-emerald-950/60 to-slate-900 border border-emerald-800/40">
          <div className="flex items-center space-x-2 text-xs font-semibold text-emerald-400">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>On-Premise Gateway</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Connected &bull; Ready to dispatch SMS
          </p>
        </div>

        {/* User Card & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-slate-700 to-slate-600 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/10 shrink-0">
              {user?.fullName ? user.fullName.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase() : 'FO'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-white truncate">{user?.fullName || 'Finance Officer'}</p>
              <span className="inline-block text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800/50">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Finance Officer'}
              </span>
            </div>
          </div>

          <button
            onClick={logout}
            title="Sign Out"
            className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </aside>
    </>
  );
};
