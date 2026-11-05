import React from 'react';
import { Menu, HelpCircle, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface TopHeaderProps {
  onOpenSidebar: () => void;
}

export const TopHeader: React.FC<TopHeaderProps> = ({ onOpenSidebar }) => {
  const { user, logout } = useAuth();

  return (
    <header className="sticky top-0 z-30 px-6 py-4 flex items-center justify-between border-b border-slate-200/80 bg-white/95 backdrop-blur-xs">
      {/* Left: Hamburger menu */}
      <button
        onClick={onOpenSidebar}
        className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
        title="Toggle Menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Right: Help, Bell with red dot, Profile */}
      <div className="flex items-center space-x-3.5">
        <button
          className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
          title="Help"
        >
          <HelpCircle className="w-5 h-5" />
        </button>

        <div className="relative">
          <button
            className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-50 rounded-full transition-colors"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
          </button>
          <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white" />
        </div>

        <div className="flex items-center space-x-2.5 pl-2 border-l border-slate-200">
          <div
            className="w-8 h-8 rounded-full bg-[#0d4722] text-white flex items-center justify-center font-bold text-xs"
            title="Finance Officer"
          >
            FO
          </div>

          <div className="hidden sm:block text-left">
            <p className="text-xs font-bold text-slate-900 leading-tight">Finance Officer</p>
            <p className="text-[10px] text-emerald-700 font-semibold leading-tight">All Permissions</p>
          </div>

          <button
            onClick={logout}
            className="text-slate-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors text-xs flex items-center gap-1 ml-1"
            title="Sign Out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};
