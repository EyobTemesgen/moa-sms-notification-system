import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Bell,
  CreditCard,
  History,
  Settings,
  LogOut,
  ShieldAlert,
  Send,
  UserCheck,
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const navItems = [
    { name: 'Record Payment', path: '/', icon: CreditCard },
    { name: 'Payment History', path: '/history', icon: History },
    { name: 'SMS Delivery Logs', path: '/sms-logs', icon: Send },
    { name: 'Settings & Contacts', path: '/settings', icon: Settings },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center space-x-3">
            <div className="bg-emerald-600 p-2 rounded-lg text-white shadow-sm flex items-center justify-center">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <div>
              <span className="text-lg font-bold text-gray-900 tracking-tight flex items-center gap-1.5">
                MOA <span className="text-emerald-700">Payment Alert</span>
              </span>
              <span className="block text-xs text-gray-700 font-medium -mt-0.5">
                Ministry of Agriculture SMS Gateway
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-emerald-50 text-emerald-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User profile & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-gray-800">{user?.fullName}</span>
              <span className="text-xs text-emerald-800 bg-emerald-100 font-bold px-2 py-0.5 rounded-full inline-block self-end">
                {user?.role === 'ADMIN' ? 'Administrator' : 'Finance Officer'}
              </span>
            </div>
            <button
              onClick={logout}
              title="Logout"
              className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

