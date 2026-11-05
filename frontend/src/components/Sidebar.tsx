import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  Send,
  History,
  Settings,
  ChevronDown,
  ChevronsLeft,
  X,
  Sprout,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();
  const [historyOpen, setHistoryOpen] = useState(
    location.pathname === '/history' || location.pathname === '/sms-logs'
  );
  const [settingsOpen, setSettingsOpen] = useState(
    location.pathname === '/settings'
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-[#0d4722] text-white flex flex-col justify-between shadow-2xl transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Top Brand Header */}
          <div className="p-5 flex items-center justify-between border-b border-emerald-800/40">
            <div className="flex items-center space-x-3">
              <img
                src="/moa-logo.png"
                alt="MOA Logo"
                className="w-10 h-10 object-contain rounded-full bg-white/10 p-0.5"
                onError={(e) => {
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
              <div>
                <h1 className="font-extrabold text-lg leading-tight tracking-tight">MOA</h1>
                <p className="text-[11px] text-emerald-200/80 font-normal leading-none mt-0.5">
                  Ministry of Agriculture
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1 rounded-md text-emerald-300/70 hover:text-white hover:bg-emerald-800/50 transition-colors"
              title="Collapse Menu"
            >
              <ChevronsLeft className="w-4 h-4 hidden lg:block" />
              <X className="w-5 h-5 lg:hidden" />
            </button>
          </div>

          {/* Navigation Links */}
          <nav className="p-3.5 space-y-1.5 mt-3">
            {/* Send Notification */}
            <NavLink
              to="/"
              onClick={onClose}
              end
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[#1e5631] text-white font-semibold shadow-xs'
                    : 'text-emerald-100/90 hover:bg-emerald-800/40 hover:text-white'
                }`
              }
            >
              <Send className="w-4 h-4 text-emerald-300" />
              <span>Send Notification</span>
            </NavLink>

            {/* History */}
            <div>
              <div className="flex items-center justify-between rounded-lg hover:bg-emerald-800/40 transition-all">
                <NavLink
                  to="/history"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex-1 flex items-center space-x-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive || location.pathname === '/sms-logs'
                        ? 'bg-[#1e5631] text-white font-semibold rounded-lg'
                        : 'text-emerald-100/90'
                    }`
                  }
                >
                  <History className="w-4 h-4 text-emerald-300" />
                  <span>History</span>
                </NavLink>
                <button
                  onClick={() => setHistoryOpen(!historyOpen)}
                  className="px-2 py-2 text-emerald-300/80 hover:text-white"
                  title="Toggle History Options"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      historyOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {historyOpen && (
                <div className="pl-9 pr-2 py-1 space-y-1 text-xs text-emerald-200">
                  <NavLink
                    to="/history"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block py-1.5 px-2 rounded hover:bg-emerald-800/50 hover:text-white ${
                        isActive ? 'text-white font-semibold underline' : ''
                      }`
                    }
                  >
                    History & Audit Log
                  </NavLink>
                  <NavLink
                    to="/sms-logs"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block py-1.5 px-2 rounded hover:bg-emerald-800/50 hover:text-white ${
                        isActive ? 'text-white font-semibold underline' : ''
                      }`
                    }
                  >
                    SMS Gateway Dispatches
                  </NavLink>
                </div>
              )}
            </div>

            {/* Settings */}
            <div>
              <div className="flex items-center justify-between rounded-lg hover:bg-emerald-800/40 transition-all">
                <NavLink
                  to="/settings"
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex-1 flex items-center space-x-3 px-3.5 py-2.5 text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-[#1e5631] text-white font-semibold rounded-lg'
                        : 'text-emerald-100/90'
                    }`
                  }
                >
                  <Settings className="w-4 h-4 text-emerald-300" />
                  <span>Settings</span>
                </NavLink>
                <button
                  onClick={() => setSettingsOpen(!settingsOpen)}
                  className="px-2 py-2 text-emerald-300/80 hover:text-white"
                  title="Toggle Settings Options"
                >
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      settingsOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>
              </div>

              {settingsOpen && (
                <div className="pl-9 pr-2 py-1 space-y-1 text-xs text-emerald-200">
                  <NavLink
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) =>
                      `block py-1.5 px-2 rounded hover:bg-emerald-800/50 hover:text-white ${
                        isActive ? 'text-white font-semibold underline' : ''
                      }`
                    }
                  >
                    Threshold & Gateway
                  </NavLink>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Bottom Logo Emblem */}
        <div className="p-5 border-t border-emerald-800/40 flex items-center space-x-2.5">
          <Sprout className="w-5 h-5 text-emerald-300" />
          <span className="font-bold text-sm tracking-wider uppercase text-white">MOA</span>
        </div>
      </aside>
    </>
  );
};
